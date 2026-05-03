// ============================================================
// GameShell — common wrapper for all game sessions
// Provides progress bar, timer, quit button, display toggle
// Handles Escape key for quitting
// ============================================================

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Timer from "@/components/Timer";
import { X } from "lucide-react";
import type { GameSettings } from "@/lib/gameRegistry";

interface GameShellProps {
  settings: GameSettings;
  currentHand: number;
  totalHands: number;
  onQuit: () => void;
  onTimeUp: () => void;
  timerKey: number; // change to reset timer
  isTimerRunning: boolean;
  children: React.ReactNode;
}

export default function GameShell({
  settings,
  currentHand,
  totalHands,
  onQuit,
  onTimeUp,
  timerKey,
  isTimerRunning,
  children,
}: GameShellProps) {
  // Escape to quit
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        const target = e.target as HTMLElement;
        if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;
        e.preventDefault();
        onQuit();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onQuit]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="font-mono text-sm font-semibold text-muted-foreground">
            {currentHand} / {totalHands}
          </span>
          <Progress
            value={(currentHand / totalHands) * 100}
            className="w-32 h-1.5"
          />
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onQuit}
          className="text-muted-foreground hover:text-destructive"
        >
          <X className="w-4 h-4 mr-1" />
          Quit
          <kbd className="ml-1.5 px-1 py-0.5 bg-muted border border-border rounded text-[9px] font-mono text-muted-foreground/60">
            Esc
          </kbd>
        </Button>
      </div>

      {/* Timer */}
      {settings.timerSeconds && (
        <div className="mb-4" key={timerKey}>
          <Timer
            seconds={settings.timerSeconds}
            isRunning={isTimerRunning}
            onTimeUp={onTimeUp}
          />
        </div>
      )}

      {/* Game content */}
      {children}
    </div>
  );
}
