import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { render, fireEvent } from "@testing-library/react";
import RespondingResults from "./RespondingResults";
import type { GameResults } from "@/lib/gameRegistry";

// Read source file for static class analysis (matches History.test.tsx pattern)
const source = readFileSync(
  resolve(import.meta.dirname, "RespondingResults.tsx"),
  "utf-8"
);

function makeResults(overrides?: Partial<GameResults>): GameResults {
  return {
    sessionId: "test-session",
    gameId: "responding",
    settings: {
      gameId: "responding",
      difficulty: "intermediate",
      handCount: 2,
      timerSeconds: null,
      feedbackMode: "immediate",
      displayMode: "text",
      extra: {},
    },
    hands: [
      {
        handIndex: 0,
        handData: {
          hand: { cards: [{ suit: "S", rank: "A" }] },
          partnerBid: "1C",
          hcp: 12,
          distribution: "4-4-3-2",
        },
        userAnswer: "__timeout__",
        correctAnswer: "1S",
        isCorrect: false,
        timeTaken: 10000,
        explanation: "With 12+ HCP and 4+ spades, respond 1S.",
      },
    ],
    totalCorrect: 0,
    totalHands: 2,
    accuracy: 0,
    totalTime: 10000,
    averageTime: 10000,
    extraData: {},
    ...overrides,
  };
}

describe("RespondingResults", () => {
  it("uses var(--muted-foreground) for timeout answer color instead of hard-coded #888", async () => {
    const results = makeResults();
    const { container } = render(
      <RespondingResults
        results={results}
        onPlayAgain={() => {}}
        onBackToMenu={() => {}}
      />
    );

    // Expand the "Review Hands" section
    const toggle = container.querySelector("button");
    if (toggle) {
      fireEvent.click(toggle);
    }

    // Find the span with inline style color for the timeout answer
    const timeoutSpan = Array.from(container.querySelectorAll("span")).find(
      span => span.textContent?.includes("Time's up")
    );

    expect(timeoutSpan).toBeTruthy();
    // Check the raw style attribute value (jsdom resolves CSS vars in .style.color)
    const styleAttr = timeoutSpan!.getAttribute("style");
    expect(styleAttr).toContain("var(--muted-foreground)");
    expect(styleAttr).not.toContain("#888");
  });
});

describe("RespondingResults — theme tokens (#32)", () => {
  it("incorrect row uses destructive theme tokens, not hard-coded red", () => {
    expect(source).not.toContain("bg-red-50/50");
    expect(source).not.toContain("border-red-200/50");
    expect(source).toContain("bg-destructive/5");
    expect(source).toContain("border-destructive/20");
  });

  it("correct answer display uses text-primary, not hard-coded text-emerald-600", () => {
    expect(source).not.toContain("text-emerald-600");
    expect(source).toContain("text-primary");
  });
});
