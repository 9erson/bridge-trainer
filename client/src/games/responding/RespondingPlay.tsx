import { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import CardDisplay from "@/components/CardDisplay";
import DisplayModeToggle from "@/components/DisplayModeToggle";
import GameShell from "@/components/GameShell";
import {
  type BridgeHand,
  calculateHCP,
  getSuitLength,
  SUITS,
  SUIT_SYMBOLS,
  SUIT_NAMES,
} from "@/lib/bridge";
import {
  generateResponderScenario,
  getResponseBidsForDifficulty,
  formatBid,
  type ResponderScenario,
} from "@/lib/conventions";
import { nanoid } from "nanoid";
import { saveSession, saveHandResult } from "@/lib/db";
import type {
  GameSettings,
  GameResults,
  HandResultData,
} from "@/lib/gameRegistry";
import { motion, AnimatePresence } from "framer-motion";
import { getBidShortcutLabel } from "@/hooks/useKeyboardShortcuts";
import { BookOpen, ChevronDown, ChevronUp } from "lucide-react";

interface Props {
  settings: GameSettings;
  onComplete: (results: GameResults) => void;
  onQuit: () => void;
}

function getDistribution(hand: BridgeHand): string {
  const lengths = SUITS.map(s => getSuitLength(hand, s));
  return `${lengths[0]}-${lengths[1]}-${lengths[2]}-${lengths[3]}`;
}

const RESPONSE_REFERENCE: Record<string, { title: string; rules: string[] }> = {
  "1H": {
    title: "Responses to 1H",
    rules: [
      "3H: 10-12 HCP, 3+ heart support (invitational)",
      "2H: 6-9 HCP, 3+ heart support (simple raise)",
      "1S: 6+ HCP, 4+ spades",
      "1NT: 6-10 HCP, no fit, no 4-card spade",
      "2C/2D: 10+ HCP, 4+ cards in that suit",
      "2NT: 11-12 HCP, no fit (invitational)",
      "3H: 13+ HCP, 4+ support (game force)",
    ],
  },
  "1S": {
    title: "Responses to 1S",
    rules: [
      "3S: 10-12 HCP, 3+ spade support (invitational)",
      "2S: 6-9 HCP, 3+ spade support (simple raise)",
      "2H: 10+ HCP, 5+ hearts",
      "1NT: 6-10 HCP, no fit",
      "2C/2D: 10+ HCP, 4+ cards in that suit",
      "2NT: 11-12 HCP, no fit (invitational)",
      "3S: 13+ HCP, 4+ support (game force)",
    ],
  },
  "1D": {
    title: "Responses to 1D",
    rules: [
      "1H/1S: 6+ HCP, 4+ cards in that major",
      "2D: 6-9 HCP, 4+ diamond support (simple raise)",
      "1NT: 6-10 HCP, no 4-card major",
      "2C: 10+ HCP, 4+ clubs",
      "3D: 10-12 HCP, 4+ diamonds (invitational)",
    ],
  },
  "1C": {
    title: "Responses to 1C",
    rules: [
      "1H/1S: 6+ HCP, 4+ cards in that major",
      "1D: 6+ HCP, 4+ diamonds, no 4-card major",
      "1NT: 6-10 HCP, no 4-card major",
      "2C: 6-9 HCP, 4+ club support (simple raise)",
      "3C: 10-12 HCP, 4+ clubs (invitational)",
    ],
  },
};

export default function RespondingPlay({
  settings,
  onComplete,
  onQuit,
}: Props) {
  const conventionId =
    (settings.extra.conventionId as string) ?? "sayc-responses";
  const availableBids = getResponseBidsForDifficulty(settings.difficulty);

  const sessionId = useRef(nanoid());
  const startTime = useRef(Date.now());
  const handStartTime = useRef(Date.now());

  const generateScenario = useCallback((): ResponderScenario => {
    for (let i = 0; i < 500; i++) {
      const scenario = generateResponderScenario(
        conventionId,
        settings.difficulty,
        availableBids
      );
      if (scenario) return scenario;
    }
    // Fallback — should never happen but avoids crashes
    const fallbackScenario = generateResponderScenario(conventionId, "hard", [
      "Pass",
      "1C",
      "1D",
      "1H",
      "1S",
      "1NT",
      "2C",
      "2D",
      "2H",
      "2S",
      "2NT",
      "3C",
      "3D",
      "3H",
      "3S",
    ]);
    return fallbackScenario!;
  }, [conventionId, settings.difficulty, availableBids]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [scenario, setScenario] = useState<ResponderScenario>(() =>
    generateScenario()
  );
  const [displayMode, setDisplayMode] = useState(settings.displayMode);
  const [results, setResults] = useState<HandResultData[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showReference, setShowReference] = useState(false);
  const [sequenceBuffer, setSequenceBuffer] = useState("");
  const [timerKey, setTimerKey] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const sequenceTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const generateNewHand = useCallback(() => {
    setScenario(generateScenario());
    setSelectedIndex(0);
    handStartTime.current = Date.now();
    setTimerKey(k => k + 1);
    setIsTimerRunning(true);
  }, [generateScenario]);

  const submitAnswer = useCallback(
    (userBid: string) => {
      const timeTaken = Date.now() - handStartTime.current;
      const isCorrect = userBid === scenario.correctBid;

      const handResult: HandResultData = {
        handIndex: currentIndex,
        handData: {
          hand: scenario.hand,
          partnerBid: scenario.partnerBid,
          hcp: calculateHCP(scenario.hand),
          distribution: getDistribution(scenario.hand),
        },
        userAnswer: userBid,
        correctAnswer: scenario.correctBid,
        isCorrect,
        timeTaken,
        explanation: scenario.description,
      };

      const newResults = [...results, handResult];
      setResults(newResults);
      setIsTimerRunning(false);

      saveHandResult({
        id: nanoid(),
        sessionId: sessionId.current,
        handIndex: currentIndex,
        handData: JSON.stringify(scenario),
        userAnswer: userBid,
        correctAnswer: scenario.correctBid,
        isCorrect,
        timeTaken,
        timestamp: Date.now(),
      });

      // End-only feedback mode: proceed immediately
      if (currentIndex + 1 >= settings.handCount) {
        finishSession(newResults);
      } else {
        setCurrentIndex(i => i + 1);
        generateNewHand();
      }
    },
    [scenario, currentIndex, results, settings.handCount, generateNewHand]
  );

  const handleTimeUp = useCallback(() => {
    submitAnswer("__timeout__");
  }, [submitAnswer]);

  const finishSession = useCallback(
    (finalResults: HandResultData[]) => {
      const totalCorrect = finalResults.filter(r => r.isCorrect).length;
      const totalTime = Date.now() - startTime.current;
      const avgTime =
        finalResults.length > 0
          ? finalResults.reduce((sum, r) => sum + r.timeTaken, 0) /
            finalResults.length
          : 0;
      const accuracy =
        finalResults.length > 0 ? totalCorrect / finalResults.length : 0;

      const gameResults: GameResults = {
        sessionId: sessionId.current,
        gameId: "responding",
        settings,
        hands: finalResults,
        totalCorrect,
        totalHands: finalResults.length,
        accuracy,
        totalTime,
        averageTime: avgTime,
        extraData: { conventionId },
      };

      saveSession({
        id: sessionId.current,
        gameType: "responding",
        startedAt: startTime.current,
        completedAt: Date.now(),
        isComplete: true,
        settings: JSON.stringify(settings),
        totalHands: finalResults.length,
        correctCount: totalCorrect,
        totalTime,
        averageTime: avgTime,
        accuracy,
        extraData: JSON.stringify({ conventionId }),
      });

      onComplete(gameResults);
    },
    [settings, conventionId, onComplete]
  );

  const handleQuit = useCallback(() => {
    const totalCorrect = results.filter(r => r.isCorrect).length;
    const totalTime = Date.now() - startTime.current;
    const avgTime =
      results.length > 0
        ? results.reduce((sum, r) => sum + r.timeTaken, 0) / results.length
        : 0;

    saveSession({
      id: sessionId.current,
      gameType: "responding",
      startedAt: startTime.current,
      completedAt: Date.now(),
      isComplete: false,
      settings: JSON.stringify(settings),
      totalHands: results.length,
      correctCount: totalCorrect,
      totalTime,
      averageTime: avgTime,
      accuracy: results.length > 0 ? totalCorrect / results.length : 0,
      extraData: JSON.stringify({ conventionId }),
    });

    onQuit();
  }, [results, settings, conventionId, onQuit]);

  // Focus container for keyboard events
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.focus();
    }
  }, [currentIndex]);

  // Keyboard handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;

      const key = e.key.toLowerCase();

      // H to toggle reference
      if (key === "h") {
        e.preventDefault();
        setShowReference(prev => !prev);
        return;
      }

      // P for Pass
      if (key === "p" && availableBids.includes("Pass")) {
        e.preventDefault();
        submitAnswer("Pass");
        setSequenceBuffer("");
        return;
      }

      // Number keys start a sequence
      if (/^[1-7]$/.test(key)) {
        e.preventDefault();
        setSequenceBuffer(key);
        if (sequenceTimeout.current) clearTimeout(sequenceTimeout.current);
        sequenceTimeout.current = setTimeout(() => {
          setSequenceBuffer("");
        }, 1500);
        return;
      }

      // Second key of sequence (c, d, h, s, n)
      if (sequenceBuffer && /^[cdhsn]$/.test(key)) {
        e.preventDefault();
        const strain = key === "n" ? "NT" : key.toUpperCase();
        const bidKey = sequenceBuffer + strain;
        if (sequenceTimeout.current) clearTimeout(sequenceTimeout.current);
        setSequenceBuffer("");

        if (availableBids.includes(bidKey)) {
          submitAnswer(bidKey);
          return;
        }
        return;
      }

      // Arrow key navigation
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, availableBids.length - 1));
        return;
      }
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
        return;
      }

      // Enter to submit selected
      if (e.key === "Enter") {
        e.preventDefault();
        submitAnswer(availableBids[selectedIndex]);
        return;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      if (sequenceTimeout.current) clearTimeout(sequenceTimeout.current);
    };
  }, [availableBids, selectedIndex, sequenceBuffer, submitAnswer]);

  const hcp = calculateHCP(scenario.hand);
  const distribution = getDistribution(scenario.hand);
  const partnerFormatted = formatBid(scenario.partnerBid);
  const partnerSuit = scenario.partnerBid[1] as keyof typeof SUIT_SYMBOLS;
  const refData = RESPONSE_REFERENCE[scenario.partnerBid];

  return (
    <GameShell
      settings={settings}
      currentHand={currentIndex + 1}
      totalHands={settings.handCount}
      onQuit={handleQuit}
      onTimeUp={handleTimeUp}
      timerKey={timerKey}
      isTimerRunning={isTimerRunning}
    >
      <Card className="border-border/50 shadow-sm">
        <CardContent className="pt-6 pb-6">
          {/* Partner's bid callout */}
          <div className="flex justify-center mb-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-primary/30 bg-primary/5">
              <span className="text-sm text-muted-foreground">
                Partner opened:
              </span>
              <span
                className="text-lg font-bold font-mono"
                style={{ color: partnerFormatted.color }}
              >
                {partnerFormatted.text}
              </span>
            </div>
          </div>

          {/* Header info */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="bg-muted px-2 py-0.5 rounded font-mono font-medium">
                {hcp} HCP
              </span>
              <span className="bg-muted px-2 py-0.5 rounded font-mono font-medium">
                {distribution}
              </span>
            </div>
            <DisplayModeToggle mode={displayMode} onChange={setDisplayMode} />
          </div>

          {/* Hand display */}
          <div className="flex justify-center mb-6">
            <CardDisplay hand={scenario.hand} mode={displayMode} />
          </div>

          {/* Question */}
          <p className="text-center text-sm text-muted-foreground mb-4 font-serif">
            What is your response?
          </p>

          {/* Sequence indicator */}
          {sequenceBuffer && (
            <div className="text-center mb-2">
              <span className="inline-flex items-center px-2 py-0.5 bg-primary/10 border border-primary/30 rounded text-xs font-mono text-primary">
                {sequenceBuffer}_{" "}
                <span className="ml-1 text-muted-foreground">
                  (type C/D/H/S/N)
                </span>
              </span>
            </div>
          )}

          {/* Bid selection */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div
              ref={containerRef}
              tabIndex={0}
              className="flex flex-wrap justify-center gap-2 max-w-md mx-auto outline-none"
            >
              {availableBids.map((bid, idx) => {
                const formatted = formatBid(bid);
                const shortcutLabel = getBidShortcutLabel(bid);
                return (
                  <Button
                    key={bid}
                    variant="outline"
                    className={`h-11 px-3 font-semibold text-sm min-w-[3.5rem] relative transition-all ${
                      selectedIndex === idx
                        ? "ring-2 ring-primary ring-offset-1 bg-primary/5"
                        : ""
                    }`}
                    onClick={() => submitAnswer(bid)}
                  >
                    <span style={{ color: formatted.color }}>
                      {formatted.text}
                    </span>
                    {shortcutLabel && (
                      <span className="absolute -top-0.5 -right-0.5 text-[8px] bg-muted text-muted-foreground/70 px-1 rounded font-mono leading-tight">
                        {shortcutLabel}
                      </span>
                    )}
                  </Button>
                );
              })}
            </div>
          </motion.div>
        </CardContent>
      </Card>

      {/* Inline reference */}
      {refData && (
        <div className="mt-4">
          <Button
            variant="ghost"
            size="sm"
            className="w-full flex items-center justify-center gap-2 text-xs text-muted-foreground hover:text-foreground border border-dashed border-border/60 hover:border-border"
            onClick={() => setShowReference(prev => !prev)}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>
              {showReference ? "Hide" : "Show"} Reference — {refData.title}
            </span>
            <kbd className="ml-1 px-1 py-0.5 bg-muted border border-border rounded text-[9px] font-mono text-muted-foreground/60">
              H
            </kbd>
            {showReference ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </Button>

          <AnimatePresence>
            <motion.div
              initial={{ gridTemplateRows: "0fr", opacity: 0 }}
              animate={
                showReference
                  ? { gridTemplateRows: "1fr", opacity: 1 }
                  : { gridTemplateRows: "0fr", opacity: 0 }
              }
              transition={{ duration: 0.2 }}
              style={{ display: "grid" }}
            >
              <div className="overflow-hidden" style={{ minHeight: 0 }}>
                <div className="mt-3 rounded-lg border border-border/60 bg-muted/30 p-4 space-y-3">
                  <h4 className="text-xs font-semibold text-foreground/80 uppercase tracking-wide">
                    {refData.title}
                  </h4>
                  <ul className="space-y-1">
                    {refData.rules.map((rule, i) => (
                      <li
                        key={i}
                        className="text-xs text-foreground/70 flex gap-1.5"
                      >
                        <span className="text-primary font-bold shrink-0">
                          &bull;
                        </span>
                        <span className="font-serif">{rule}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      )}
    </GameShell>
  );
}
