// ============================================================
// Timer — countdown timer with visual progress bar
// Updates React state once per second (not 10x/sec) to
// avoid unnecessary re-renders through the game component tree.
// ============================================================

import { useEffect, useState, useCallback, useRef } from "react";
import { Progress } from "@/components/ui/progress";

interface TimerProps {
  seconds: number;
  isRunning: boolean;
  onTimeUp: () => void;
}

export default function Timer({ seconds, isRunning, onTimeUp }: TimerProps) {
  const [remaining, setRemaining] = useState(seconds * 1000);
  const onTimeUpRef = useRef(onTimeUp);
  onTimeUpRef.current = onTimeUp;

  const reset = useCallback(() => {
    setRemaining(seconds * 1000);
  }, [seconds]);

  useEffect(() => {
    reset();
  }, [seconds, reset]);

  useEffect(() => {
    if (!isRunning) return;

    // Use wall-clock time to avoid drift from accumulated tick errors.
    // The interval fires once per second, and setState only triggers
    // when the displayed second actually changes.
    const endMs = Date.now() + remaining;

    const interval = setInterval(() => {
      const now = Date.now();
      const newRemaining = Math.max(0, endMs - now);

      if (newRemaining <= 0) {
        clearInterval(interval);
        setRemaining(0);
        onTimeUpRef.current();
      } else {
        setRemaining(newRemaining);
      }
    }, 1000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning]);

  const progress = (remaining / (seconds * 1000)) * 100;
  const displaySeconds = Math.ceil(remaining / 1000);
  const isUrgent = remaining < 5000;

  return (
    <div className="flex items-center gap-3 w-full">
      <Progress
        value={progress}
        className={`h-2 flex-1 ${isUrgent ? "[&>div]:bg-destructive" : "[&>div]:bg-primary"}`}
      />
      <span
        className={`font-mono text-sm font-semibold min-w-[2.5rem] text-right tabular-nums
          ${isUrgent ? "text-destructive" : "text-muted-foreground"}`}
      >
        {displaySeconds}s
      </span>
    </div>
  );
}

export { Timer };
