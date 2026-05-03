#!/bin/bash
#
# ralph.sh — multi-CLI iterative TDD loop driver
#
# Usage: ./ralph.sh <tool> <iterations>
#   tool: claude | opencode | droid | kilo
#
# Behavior
#   - Runs the 6-prompt TDD loop once per iteration.
#   - Within an iteration, prompts 2..6 resume the session created by prompt 1
#     via captured session ID. Fresh session each iteration; codebase + git
#     are the only carry-over.
#   - On any failure (non-zero exit or error event detected), the rest of the
#     current iteration is skipped and the next iteration starts fresh.
#   - Assistant text streams to stdout. Error events stream to stderr in red.
#
# YOLO levels per tool
#   claude   --dangerously-skip-permissions
#   opencode --dangerously-skip-permissions
#   droid    --skip-permissions-unsafe   (FULL yolo: safety interlocks OFF;
#                                         intended for isolated/throwaway envs)
#   kilo     --auto    (requires permission: { "*": "allow" } in kilo config;
#                       startup check warns if not set)
#

set -uo pipefail

# ---------- Output helpers ----------
ANSI_RED=$'\033[31m'
ANSI_YELLOW=$'\033[33m'
ANSI_RESET=$'\033[0m'

print_err()  { printf '%s%s%s\n' "$ANSI_RED"    "$*" "$ANSI_RESET" >&2; }
print_warn() { printf '%s%s%s\n' "$ANSI_YELLOW" "$*" "$ANSI_RESET" >&2; }

usage() {
  cat >&2 <<EOF
Usage: $0 <tool> <iterations>
  tool       claude | opencode | droid | kilo
  iterations positive integer
EOF
  exit 1
}

# ---------- Argument parsing ----------
[[ $# -eq 2 ]] || usage
TOOL="$1"
ITERATIONS="$2"

case "$TOOL" in
  claude|opencode|droid|kilo) ;;
  *) usage ;;
esac

[[ "$ITERATIONS" =~ ^[0-9]+$ && "$ITERATIONS" -ge 1 ]] || usage

# ---------- Binary existence check ----------
if ! command -v "$TOOL" >/dev/null 2>&1; then
  print_err "[$TOOL] binary not found in PATH"
  exit 1
fi
if ! command -v jq >/dev/null 2>&1; then
  print_err "jq is required but not found in PATH"
  exit 1
fi

# ---------- Kilo permission startup check ----------
kilo_perm_check() {
  local cfg=""
  for p in \
    "./.kilo/config.json" \
    "$HOME/.config/kilo/config.json" \
    "$HOME/.kilo/config.json" \
    "$HOME/.kilocode/config.json"
  do
    if [[ -f "$p" ]]; then cfg="$p"; break; fi
  done

  if [[ -z "$cfg" ]]; then
    print_warn "[kilo] no kilo config found at known paths; if yolo stalls, set permission.* = \"allow\""
    return
  fi

  if jq -e '.permission["*"] == "allow"' "$cfg" >/dev/null 2>&1; then
    return
  fi
  print_warn "[kilo] permission[\"*\"] is not \"allow\" in $cfg"
  print_warn "[kilo] yolo may stall on permission prompts; consider:"
  print_warn "[kilo]   { \"permission\": { \"*\": \"allow\" } }"
}

[[ "$TOOL" == "kilo" ]] && kilo_perm_check

# ---------- Prompts (shared across all tools, unchanged) ----------
PROMPTS=(
  'Use the `gh` CLI to find the smallest, clearly defined, unblocked GitHub issue in the current repo, then identify whether it is a bug or a feature. Summarize the problem, assumptions, impact, risks, and affected areas without proposing solutions.'
  'If the issue is a feature, produce a concise but comprehensive implementation plan covering test strategy (TDD), approach, architecture improvements, UI/UX considerations (if relevant), and validation steps. If the issue is a bug, load both the agent-browser skill to attempt reproduction and the systematic-debugging skill to guide root cause analysis, then produce a debugging and fix plan including reproduction steps, hypotheses, isolation strategy, fix approach, and validation.'
  'Load the tdd skill and proceed with the plan.'
  'Use the GitHub CLI (gh) to close the issue associated with the work you just completed.'
  'Review all uncommitted changes, group them into atomic commits by feature/fix/refactor with clear conventional commit messages, then sync with the remote default branch by rebasing, resolve any conflicts, switch to the default branch if needed, and delete the current branch if it is not the default.'
)

# ---------- Stream dispatch ----------
# Each per-tool runner emits tab-separated lines: <TAG>\t<payload>
#   SID\t<session_id>            -> captured to $SID_FILE
#   TXT\t<text-with-\n-escaped>  -> stdout (newlines re-expanded)
#   ERR\t<error-message>         -> stderr in red
#   SAW_ERR\t                    -> sets ERROR_SEEN=1 (for soft error events
#                                   that don't trip the exit code)
dispatch_lines() {
  local tag rest
  while IFS=$'\t' read -r tag rest; do
    case "$tag" in
      SID)     printf '%s' "$rest" > "$SID_FILE" ;;
      TXT)     printf '%b\r\n' "$rest" ;;
      ERR)     print_err "[ERROR] $(printf '%b' "$rest")"
               printf '1' > "$ERR_FLAG_FILE" ;;
      SAW_ERR) printf '1' > "$ERR_FLAG_FILE" ;;
      *)       : ;;
    esac
  done
}

# ---------- Per-tool runners ----------
# Each runner: $1 = session_id (empty for fresh), $2 = prompt
# Returns 0 iff: process exit 0 AND no error event was seen on the stream.

run_claude() {
  local sid="$1" prompt="$2"
  local args=(
    --print
    --verbose
    --output-format stream-json
    --dangerously-skip-permissions
  )
  [[ -n "$sid" ]] && args+=(--resume "$sid")

  claude "${args[@]}" "$prompt" \
    | grep --line-buffered '^{' \
    | jq --unbuffered -r '
        def enc: tostring | gsub("\n"; "\\n");
        if .type == "system" and .subtype == "init" and ((.session_id // "") != "") then
          "SID\t" + .session_id
        elif .type == "assistant" then
          (.message.content[]? | select(.type == "text") | "TXT\t" + (.text | enc))
        elif .type == "result" and (.is_error // false) then
          "ERR\t" + ((.result // .error // "claude reported is_error=true") | enc)
        else empty end
      ' \
    | dispatch_lines

  local rc=${PIPESTATUS[0]}
  return "$rc"
}

run_opencode() {
  local sid="$1" prompt="$2"
  local args=(run --format json --dangerously-skip-permissions)
  [[ -n "$sid" ]] && args+=(-s "$sid")

  opencode "${args[@]}" "$prompt" \
    | grep --line-buffered '^{' \
    | jq --unbuffered -r '
        def enc: tostring | gsub("\n"; "\\n");
        ( if ((.sessionID // "") != "") then "SID\t" + .sessionID else empty end ),
        ( if ((.part.text // "") != "" and (.part.type // "") != "thinking") then
            "TXT\t" + (.part.text | enc)
          else empty end ),
        ( if .type == "error" then
            "ERR\t" + ((.error.data.message // .error.name // (.error | tostring)) | enc)
          else empty end )
      ' \
    | dispatch_lines

  local rc=${PIPESTATUS[0]}
  return "$rc"
}

run_droid() {
  local sid="$1" prompt="$2"
  local args=(
    exec
    --output-format stream-json
    --skip-permissions-unsafe
  )
  [[ -n "$sid" ]] && args+=(-s "$sid")

  droid "${args[@]}" "$prompt" \
    | grep --line-buffered '^{' \
    | jq --unbuffered -r '
        def enc: tostring | gsub("\n"; "\\n");
        ( if ((.session_id // "") != "") then "SID\t" + .session_id else empty end ),
        ( if ((.text // "") != "") then "TXT\t" + (.text | enc) else empty end ),
        ( if ((.finalText // "") != "") then "TXT\t" + (.finalText | enc) else empty end ),
        ( if (.is_error // false) or .type == "error" then
            "ERR\t" + ((.error // .message // .result // "droid reported error") | enc)
          else empty end )
      ' \
    | dispatch_lines

  local rc=${PIPESTATUS[0]}
  return "$rc"
}

run_kilo() {
  local sid="$1" prompt="$2"
  local args=(run --auto --format json)
  [[ -n "$sid" ]] && args+=(-s "$sid")

  kilo "${args[@]}" "$prompt" \
    | grep --line-buffered '^{' \
    | jq --unbuffered -r '
        def enc: tostring | gsub("\n"; "\\n");
        ( if ((.sessionID // .session_id // "") != "") then
            "SID\t" + (.sessionID // .session_id)
          else empty end ),
        ( if ((.part.text // "") != "" and (.part.type // "") != "thinking") then
            "TXT\t" + (.part.text | enc)
          else empty end ),
        ( if ((.text // "") != "") then "TXT\t" + (.text | enc) else empty end ),
        ( if .type == "error" then
            "ERR\t" + ((.message // .error // (. | tostring)) | enc)
          else empty end )
      ' \
    | dispatch_lines

  local rc=${PIPESTATUS[0]}
  return "$rc"
}

# ---------- Outer / inner loops ----------
SID_FILE=$(mktemp)
ERR_FLAG_FILE=$(mktemp)
trap 'rm -f "$SID_FILE" "$ERR_FLAG_FILE"' EXIT

TOTAL_START=$(date +%s)

for ((i=1; i<=ITERATIONS; i++)); do
  ITERATION_START=$(date +%s)

  echo
  echo "=================================================="
  echo "[$TOOL] Iteration $i/$ITERATIONS started"
  echo "=================================================="

  # Fresh iteration: clear captured session ID
  : > "$SID_FILE"

  ITERATION_FAILED=0

  for ((j=0; j<${#PROMPTS[@]}; j++)); do
    PROMPT_NUM=$((j + 1))
    PROMPT_TEXT="${PROMPTS[$j]}"

    echo "--------------------------------------------------"
    echo "[$TOOL] Iteration $i/$ITERATIONS | Prompt $PROMPT_NUM/${#PROMPTS[@]}"
    echo "Instruction: $PROMPT_TEXT"
    echo "--------------------------------------------------"

    SID=$(<"$SID_FILE")
    : > "$ERR_FLAG_FILE"

    set +e
    "run_$TOOL" "$SID" "$PROMPT_TEXT"
    rc=$?
    set -e

    SAW_ERR=$(<"$ERR_FLAG_FILE")

    if [[ "$rc" -ne 0 || -n "$SAW_ERR" ]]; then
      print_err "[$TOOL] Iteration $i prompt $PROMPT_NUM failed (exit=$rc, error_event=${SAW_ERR:-0}); skipping rest of iteration"
      ITERATION_FAILED=1
      break
    fi

    echo
  done

  ITERATION_END=$(date +%s)
  ITERATION_ELAPSED=$((ITERATION_END - ITERATION_START))

  echo "=================================================="
  if [[ "$ITERATION_FAILED" -eq 1 ]]; then
    echo "[$TOOL] Iteration $i/$ITERATIONS aborted (${ITERATION_ELAPSED}s)"
  else
    echo "[$TOOL] Iteration $i/$ITERATIONS done (${ITERATION_ELAPSED}s)"
  fi
  echo "=================================================="
done

TOTAL_END=$(date +%s)
TOTAL_ELAPSED=$((TOTAL_END - TOTAL_START))

echo
echo "=================================================="
echo "[$TOOL] All iterations complete (${TOTAL_ELAPSED}s)"
echo "=================================================="
