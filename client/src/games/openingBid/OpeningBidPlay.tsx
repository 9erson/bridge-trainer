// ============================================================
// OpeningBidPlay — main gameplay for opening bid practice
// Shows hand, user selects bid from list
// Full keyboard support: P for Pass, level+strain sequences,
// arrow navigation, H for reference toggle, Enter/Space/N for next
// ============================================================

import { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import CardDisplay from "@/components/CardDisplay";
import DisplayModeToggle from "@/components/DisplayModeToggle";
import GameShell from "@/components/GameShell";
import { calculateHCP } from "@/lib/bridge";
import { getBidsForDifficulty, formatBid } from "@/lib/conventions";
import {
  generateHandForBidding,
  type HandGenerationResult,
} from "@/lib/handGeneration";
import { nanoid } from "nanoid";
import { saveSession, saveHandResult } from "@/lib/db";
import type {
  GameSettings,
  GameResults,
  HandResultData,
} from "@/lib/gameRegistry";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, ArrowRight, Info } from "lucide-react";
import InlineReference from "@/components/InlineReference";
import SequenceIndicator from "@/components/SequenceIndicator";
import { getBidShortcutLabel } from "@/hooks/useKeyboardShortcuts";

interface Props {
  settings: GameSettings;
  onComplete: (results: GameResults) => void;
  onQuit: () => void;
}

export default function OpeningBidPlay({
  settings,
  onComplete,
  onQuit,
}: Props) {
  const conventionId = (settings.extra.conventionId as string) ?? "sayc";
  const availableBids = getBidsForDifficulty(settings.difficulty);

  const sessionId = useRef(nanoid());
  const startTime = useRef(Date.now());
  const handStartTime = useRef(Date.now());

  const [currentIndex, setCurrentIndex] = useState(0);
  const [handData, setHandData] = useState<HandGenerationResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(true);
  const [displayMode, setDisplayMode] = useState(settings.displayMode);
  const [results, setResults] = useState<HandResultData[]>([]);
  const [feedback, setFeedback] = useState<{
    isCorrect: boolean;
    correctBid: string;
    userBid: string;
    description: string;
  } | null>(null);
  const [timerKey, setTimerKey] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showReference, setShowReference] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Generate initial hand on mount
  useEffect(() => {
    let cancelled = false;
    generateHandForBidding(conventionId, settings.difficulty, availableBids)
      .then(data => {
        if (!cancelled) {
          setHandData(data);
          setIsGenerating(false);
          setIsTimerRunning(true);
          handStartTime.current = Date.now();
        }
      })
      .catch(() => {
        if (!cancelled) setIsGenerating(false);
      });
    return () => {
      cancelled = true;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const generateNewHand = useCallback(async () => {
    setIsGenerating(true);
    setIsTimerRunning(false);
    try {
      const newData = await generateHandForBidding(
        conventionId,
        settings.difficulty,
        availableBids
      );
      setHandData(newData);
      setFeedback(null);
      setSelectedIndex(0);
      handStartTime.current = Date.now();
      setTimerKey(k => k + 1);
      setIsTimerRunning(true);
    } finally {
      setIsGenerating(false);
    }
  }, [conventionId, settings.difficulty, availableBids]);

  const submitAnswer = useCallback(
    (userBid: string) => {
      if (feedback || isGenerating || !handData) return;

      const timeTaken = Date.now() - handStartTime.current;
      const isCorrect = userBid === handData.bid;

      const handResult: HandResultData = {
        handIndex: currentIndex,
        handData: {
          ...handData.hand,
          seat: handData.seat,
          vuln: handData.vuln,
        },
        userAnswer: userBid,
        correctAnswer: handData.bid,
        isCorrect,
        timeTaken,
        explanation: handData.description,
      };

      const newResults = [...results, handResult];
      setResults(newResults);
      setIsTimerRunning(false);

      saveHandResult({
        id: nanoid(),
        sessionId: sessionId.current,
        handIndex: currentIndex,
        handData: JSON.stringify(handData),
        userAnswer: userBid,
        correctAnswer: handData.bid,
        isCorrect,
        timeTaken,
        timestamp: Date.now(),
      });

      if (settings.feedbackMode === "immediate") {
        setFeedback({
          isCorrect,
          correctBid: handData.bid,
          userBid,
          description: handData.description,
        });
      } else {
        proceedToNext(newResults);
      }
    },
    [
      feedback,
      isGenerating,
      handData,
      currentIndex,
      results,
      settings.feedbackMode,
    ]
  );

  const proceedToNext = useCallback(
    (currentResults: HandResultData[]) => {
      if (currentIndex + 1 >= settings.handCount) {
        finishSession(currentResults);
      } else {
        setCurrentIndex(i => i + 1);
        generateNewHand();
      }
    },
    [currentIndex, settings.handCount, generateNewHand]
  );

  const handleNext = useCallback(() => {
    proceedToNext(results);
  }, [proceedToNext, results]);

  const handleTimeUp = useCallback(() => {
    submitAnswer("__timeout__");
  }, [submitAnswer]);

  const finishSession = useCallback(
    (finalResults: HandResultData[]) => {
      const totalCorrect = finalResults.filter(r => r.isCorrect).length;
      const totalTime = Date.now() - startTime.current;
      const avgTime =
        finalResults.reduce((sum, r) => sum + r.timeTaken, 0) /
        finalResults.length;
      const accuracy = totalCorrect / finalResults.length;

      const gameResults: GameResults = {
        sessionId: sessionId.current,
        gameId: "opening-bid",
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
        gameType: "opening-bid",
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
      gameType: "opening-bid",
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
    if (!feedback && containerRef.current) {
      containerRef.current.focus();
    }
  }, [currentIndex, feedback]);

  // Keyboard handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;

      const key = e.key.toLowerCase();

      // H to toggle reference (works anytime during gameplay)
      if (key === "h") {
        e.preventDefault();
        setShowReference(prev => !prev);
        return;
      }

      // When feedback is showing, handle next-hand shortcuts
      if (feedback) {
        if (e.key === "Enter" || e.key === " " || key === "n") {
          e.preventDefault();
          handleNext();
          return;
        }
        return;
      }

      // P for Pass
      if (key === "p" && availableBids.includes("Pass")) {
        e.preventDefault();
        submitAnswer("Pass");
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
    };
  }, [feedback, availableBids, selectedIndex, submitAnswer, handleNext]);

  const hcp = handData ? calculateHCP(handData.hand) : 0;

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
          {isGenerating || !handData ? (
            <div className="flex justify-center py-12">
              <span className="text-sm text-muted-foreground animate-pulse">
                Dealing cards…
              </span>
            </div>
          ) : (
            <>
              {/* Header info */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  {settings.difficulty !== "easy" && (
                    <>
                      <span className="bg-muted px-2 py-0.5 rounded font-medium">
                        Seat: {handData.seat}
                      </span>
                      {settings.difficulty === "hard" && (
                        <span className="bg-muted px-2 py-0.5 rounded font-medium">
                          Vuln:{" "}
                          {handData.vuln === "none"
                            ? "None"
                            : handData.vuln.toUpperCase()}
                        </span>
                      )}
                    </>
                  )}
                  <span className="bg-muted px-2 py-0.5 rounded font-mono font-medium">
                    {hcp} HCP
                  </span>
                </div>
                <DisplayModeToggle
                  mode={displayMode}
                  onChange={setDisplayMode}
                />
              </div>

              {/* Hand display */}
              <div className="flex justify-center mb-6">
                <CardDisplay hand={handData.hand} mode={displayMode} />
              </div>

              {/* Question */}
              <p className="text-center text-sm text-muted-foreground mb-4 font-serif">
                What is your opening bid?
              </p>

              {/* Sequence indicator (extracted for performance — owns its own state) */}
              <SequenceIndicator onBid={submitAnswer} enabled={!feedback} />

              {/* Bid selection */}
              <AnimatePresence mode="wait">
                {!feedback ? (
                  <motion.div
                    key="bids"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
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
                ) : (
                  <motion.div
                    key="feedback"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center space-y-3"
                  >
                    <div
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold
                    ${
                      feedback.isCorrect
                        ? "bg-primary/10 text-primary border border-primary/30"
                        : "bg-destructive/10 text-destructive border border-destructive/30"
                    }`}
                    >
                      {feedback.isCorrect ? (
                        <>
                          <Check className="w-4 h-4" />
                          Correct! {formatBid(feedback.correctBid).text}
                        </>
                      ) : (
                        <>
                          <X className="w-4 h-4" />
                          {feedback.userBid === "__timeout__"
                            ? "Time's up!"
                            : `You said ${formatBid(feedback.userBid).text}`}{" "}
                          — correct: {formatBid(feedback.correctBid).text}
                        </>
                      )}
                    </div>
                    {/* Explanation */}
                    <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg p-3 max-w-sm mx-auto">
                      <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                      <span className="font-serif">{feedback.description}</span>
                    </div>
                    <div>
                      <Button onClick={handleNext} variant="default" size="sm">
                        {currentIndex + 1 >= settings.handCount
                          ? "See Results"
                          : "Next Hand"}
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      Press{" "}
                      <kbd className="px-1 py-0.5 bg-muted border border-border rounded text-[9px] font-mono">
                        Enter
                      </kbd>{" "}
                      or{" "}
                      <kbd className="px-1 py-0.5 bg-muted border border-border rounded text-[9px] font-mono">
                        Space
                      </kbd>{" "}
                      to continue
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </CardContent>
      </Card>

      {/* Collapsible convention reference */}
      <InlineReference
        conventionId={conventionId}
        isOpen={showReference}
        onToggle={() => setShowReference(p => !p)}
      />
    </GameShell>
  );
}
