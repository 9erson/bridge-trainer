// ============================================================
// PointCountingPlay — main gameplay for point counting
// Supports easy (multiple choice) and hard (type answer)
// Full keyboard support: number keys, arrows, Enter/Space/N
// ============================================================

import { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import CardDisplay from "@/components/CardDisplay";
import DisplayModeToggle from "@/components/DisplayModeToggle";
import GameShell from "@/components/GameShell";
import {
  generateRandomHand,
  calculateHCP,
  generateHCPChoices,
  type BridgeHand,
} from "@/lib/bridge";
import { nanoid } from "nanoid";
import { saveSession, saveHandResult } from "@/lib/db";
import type {
  GameSettings,
  GameResults,
  HandResultData,
} from "@/lib/gameRegistry";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, ArrowRight } from "lucide-react";

interface Props {
  settings: GameSettings;
  onComplete: (results: GameResults) => void;
  onQuit: () => void;
}

export default function PointCountingPlay({
  settings,
  onComplete,
  onQuit,
}: Props) {
  const sessionId = useRef(nanoid());
  const startTime = useRef(Date.now());
  const handStartTime = useRef(Date.now());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hand, setHand] = useState<BridgeHand>(() => generateRandomHand());
  const [correctAnswer, setCorrectAnswer] = useState(() => calculateHCP(hand));
  const [choices, setChoices] = useState(() =>
    generateHCPChoices(correctAnswer)
  );
  const [userInput, setUserInput] = useState("");
  const [displayMode, setDisplayMode] = useState(settings.displayMode);
  const [results, setResults] = useState<HandResultData[]>([]);
  const [feedback, setFeedback] = useState<{
    isCorrect: boolean;
    correct: number;
    user: string;
  } | null>(null);
  const [timerKey, setTimerKey] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const isEasy = settings.difficulty === "easy";

  const generateNewHand = useCallback(() => {
    const newHand = generateRandomHand();
    const hcp = calculateHCP(newHand);
    setHand(newHand);
    setCorrectAnswer(hcp);
    setChoices(generateHCPChoices(hcp));
    setUserInput("");
    setFeedback(null);
    setSelectedIndex(0);
    handStartTime.current = Date.now();
    setTimerKey(k => k + 1);
    setIsTimerRunning(true);
  }, []);

  const submitAnswer = useCallback(
    (answer: string) => {
      if (feedback) return;

      const timeTaken = Date.now() - handStartTime.current;
      const userNum = parseInt(answer, 10);
      const isCorrect = userNum === correctAnswer;

      const handResult: HandResultData = {
        handIndex: currentIndex,
        handData: hand,
        userAnswer: answer,
        correctAnswer: String(correctAnswer),
        isCorrect,
        timeTaken,
      };

      const newResults = [...results, handResult];
      setResults(newResults);
      setIsTimerRunning(false);

      saveHandResult({
        id: nanoid(),
        sessionId: sessionId.current,
        handIndex: currentIndex,
        handData: JSON.stringify(hand),
        userAnswer: answer,
        correctAnswer: String(correctAnswer),
        isCorrect,
        timeTaken,
        timestamp: Date.now(),
      });

      if (settings.feedbackMode === "immediate") {
        setFeedback({ isCorrect, correct: correctAnswer, user: answer });
      } else {
        proceedToNext(newResults);
      }
    },
    [
      feedback,
      correctAnswer,
      currentIndex,
      hand,
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
    submitAnswer("-1");
  }, [submitAnswer]);

  const finishSession = useCallback(
    (finalResults: HandResultData[]) => {
      const totalCorrect = finalResults.filter(r => r.isCorrect).length;
      const totalTime = Date.now() - startTime.current;
      const avgTime =
        finalResults.reduce((sum, r) => sum + r.timeTaken, 0) /
        finalResults.length;
      const accuracy = totalCorrect / finalResults.length;

      const avgHCP =
        finalResults.reduce(
          (sum, r) => sum + parseInt(r.correctAnswer, 10),
          0
        ) / finalResults.length;

      const gameResults: GameResults = {
        sessionId: sessionId.current,
        gameId: "point-counting",
        settings,
        hands: finalResults,
        totalCorrect,
        totalHands: finalResults.length,
        accuracy,
        totalTime,
        averageTime: avgTime,
        extraData: { averageHCP: avgHCP },
      };

      saveSession({
        id: sessionId.current,
        gameType: "point-counting",
        startedAt: startTime.current,
        completedAt: Date.now(),
        isComplete: true,
        settings: JSON.stringify(settings),
        totalHands: finalResults.length,
        correctCount: totalCorrect,
        totalTime,
        averageTime: avgTime,
        accuracy,
        extraData: JSON.stringify({ averageHCP: avgHCP }),
      });

      onComplete(gameResults);
    },
    [settings, onComplete]
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
      gameType: "point-counting",
      startedAt: startTime.current,
      completedAt: Date.now(),
      isComplete: false,
      settings: JSON.stringify(settings),
      totalHands: results.length,
      correctCount: totalCorrect,
      totalTime,
      averageTime: avgTime,
      accuracy: results.length > 0 ? totalCorrect / results.length : 0,
      extraData: JSON.stringify({}),
    });

    onQuit();
  }, [results, settings, onQuit]);

  // Focus input on hard mode
  useEffect(() => {
    if (!isEasy && inputRef.current && !feedback) {
      inputRef.current.focus();
    }
  }, [currentIndex, feedback, isEasy]);

  // Focus container for keyboard events in easy mode
  useEffect(() => {
    if (isEasy && !feedback && containerRef.current) {
      containerRef.current.focus();
    }
  }, [currentIndex, feedback, isEasy]);

  // Keyboard handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't handle if typing in input (except Enter)
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" && e.key !== "Enter") return;

      // When feedback is showing, handle next-hand shortcuts
      if (feedback) {
        if (e.key === "Enter" || e.key === " " || e.key.toLowerCase() === "n") {
          e.preventDefault();
          handleNext();
          return;
        }
        return;
      }

      // Easy mode: number keys and arrow navigation
      if (isEasy && !feedback) {
        // Number keys 1-5 for choices
        const num = parseInt(e.key, 10);
        if (num >= 1 && num <= choices.length) {
          e.preventDefault();
          submitAnswer(String(choices[num - 1]));
          return;
        }

        // Arrow key navigation
        if (e.key === "ArrowRight" || e.key === "ArrowDown") {
          e.preventDefault();
          setSelectedIndex(prev => Math.min(prev + 1, choices.length - 1));
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
          submitAnswer(String(choices[selectedIndex]));
          return;
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [feedback, isEasy, choices, selectedIndex, submitAnswer, handleNext]);

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
          {/* Display mode toggle */}
          <div className="flex justify-end mb-4">
            <DisplayModeToggle mode={displayMode} onChange={setDisplayMode} />
          </div>

          {/* Hand display */}
          <div className="flex justify-center mb-6">
            <CardDisplay hand={hand} mode={displayMode} />
          </div>

          {/* Question */}
          <p className="text-center text-sm text-muted-foreground mb-4 font-serif">
            How many high card points?
          </p>

          {/* Answer area */}
          <AnimatePresence mode="wait">
            {!feedback ? (
              <motion.div
                key="input"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {isEasy ? (
                  <div
                    ref={containerRef}
                    tabIndex={0}
                    className="grid grid-cols-5 gap-2 max-w-sm mx-auto outline-none"
                  >
                    {choices.map((choice, idx) => (
                      <Button
                        key={choice}
                        variant="outline"
                        className={`h-12 font-mono text-lg font-semibold relative transition-all ${
                          selectedIndex === idx
                            ? "ring-2 ring-primary ring-offset-1 bg-primary/5"
                            : ""
                        }`}
                        onClick={() => submitAnswer(String(choice))}
                      >
                        {choice}
                        <span className="absolute top-0.5 right-1 text-[9px] text-muted-foreground/60 font-sans font-normal">
                          {idx + 1}
                        </span>
                      </Button>
                    ))}
                  </div>
                ) : (
                  <form
                    onSubmit={e => {
                      e.preventDefault();
                      if (userInput.trim()) submitAnswer(userInput.trim());
                    }}
                    className="flex items-center gap-2 max-w-xs mx-auto"
                  >
                    <Input
                      ref={inputRef}
                      type="number"
                      min={0}
                      max={37}
                      value={userInput}
                      onChange={e => setUserInput(e.target.value)}
                      placeholder="HCP"
                      aria-label="High card points"
                      className="text-center font-mono text-lg h-12"
                    />
                    <Button
                      type="submit"
                      size="lg"
                      disabled={!userInput.trim()}
                    >
                      Submit
                    </Button>
                  </form>
                )}
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
                      Correct! {feedback.correct} HCP
                    </>
                  ) : (
                    <>
                      <X className="w-4 h-4" />
                      {feedback.user === "-1"
                        ? "Time's up!"
                        : `You said ${feedback.user}`}{" "}
                      — correct answer: {feedback.correct} HCP
                    </>
                  )}
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
        </CardContent>
      </Card>
    </GameShell>
  );
}
