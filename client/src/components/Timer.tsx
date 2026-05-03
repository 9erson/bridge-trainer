// ============================================================
// Timer — countdown timer with visual progress bar
// ============================================================

import { useEffect, useState, useCallback, useRef } from 'react';
import { Progress } from '@/components/ui/progress';

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

    const interval = setInterval(() => {
      setRemaining((prev) => {
        const next = prev - 100;
        if (next <= 0) {
          clearInterval(interval);
          onTimeUpRef.current();
          return 0;
        }
        return next;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isRunning]);

  const progress = (remaining / (seconds * 1000)) * 100;
  const displaySeconds = Math.ceil(remaining / 1000);
  const isUrgent = remaining < 5000;

  return (
    <div className="flex items-center gap-3 w-full">
      <Progress
        value={progress}
        className={`h-2 flex-1 ${isUrgent ? '[&>div]:bg-destructive' : '[&>div]:bg-primary'}`}
      />
      <span
        className={`font-mono text-sm font-semibold min-w-[2.5rem] text-right tabular-nums
          ${isUrgent ? 'text-destructive' : 'text-muted-foreground'}`}
      >
        {displaySeconds}s
      </span>
    </div>
  );
}

export { Timer };
