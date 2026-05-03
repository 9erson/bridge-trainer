// ============================================================
// GamePage — orchestrates setup → play → results flow
// Loads the correct game module based on URL param
// Global keyboard shortcuts: Escape, ?, R (results)
// ============================================================

import { useState, useEffect, useCallback } from "react";
import { useParams, useLocation } from "wouter";
import {
  getGame,
  type GameSettings,
  type GameResults,
} from "@/lib/gameRegistry";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import KeyboardShortcutsOverlay from "@/components/KeyboardShortcutsOverlay";

type Phase = "setup" | "play" | "results";

export default function GamePage() {
  const params = useParams<{ gameId: string }>();
  const [, navigate] = useLocation();
  const [phase, setPhase] = useState<Phase>("setup");
  const [settings, setSettings] = useState<GameSettings | null>(null);
  const [results, setResults] = useState<GameResults | null>(null);
  const [showShortcuts, setShowShortcuts] = useState(false);

  const game = getGame(params.gameId ?? "");

  const handlePlayAgain = useCallback(() => {
    setPhase("setup");
    setResults(null);
  }, []);

  const handleBackToMenu = useCallback(() => {
    navigate("/");
  }, [navigate]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;

      // ? to toggle shortcuts overlay
      if (e.key === "?") {
        e.preventDefault();
        setShowShortcuts(prev => !prev);
        return;
      }

      // Escape — context-dependent
      if (e.key === "Escape") {
        if (showShortcuts) {
          setShowShortcuts(false);
          return;
        }
        if (phase === "results") {
          e.preventDefault();
          handleBackToMenu();
          return;
        }
        // During play, Escape is handled by the game component (quit)
        return;
      }

      // R to replay on results screen
      if (e.key.toLowerCase() === "r" && phase === "results") {
        e.preventDefault();
        handlePlayAgain();
        return;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [phase, showShortcuts, handleBackToMenu, handlePlayAgain]);

  if (!game) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <p className="text-muted-foreground font-serif">Game not found.</p>
        <Button variant="outline" onClick={() => navigate("/")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Games
        </Button>
      </div>
    );
  }

  const { SetupComponent, PlayComponent, ResultsComponent } = game;

  const handleStart = (s: GameSettings) => {
    setSettings(s);
    setPhase("play");
  };

  const handleComplete = (r: GameResults) => {
    setResults(r);
    setPhase("results");
  };

  const handleQuit = () => {
    setPhase("setup");
  };

  // Determine context for shortcuts overlay
  const shortcutContext =
    params.gameId === "point-counting"
      ? ("point-counting" as const)
      : params.gameId === "opening-bid"
        ? ("opening-bid" as const)
        : ("general" as const);

  return (
    <div>
      {/* Keyboard shortcuts overlay */}
      <KeyboardShortcutsOverlay
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
        context={shortcutContext}
      />

      {/* Back button during setup */}
      {phase === "setup" && (
        <Button
          variant="ghost"
          size="sm"
          className="mb-4 text-muted-foreground"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          All Games
        </Button>
      )}

      {phase === "setup" && <SetupComponent onStart={handleStart} />}
      {phase === "play" && settings && (
        <PlayComponent
          settings={settings}
          onComplete={handleComplete}
          onQuit={handleQuit}
        />
      )}
      {phase === "results" && results && (
        <ResultsComponent
          results={results}
          onPlayAgain={handlePlayAgain}
          onBackToMenu={handleBackToMenu}
        />
      )}

      {/* Keyboard hint footer */}
      {phase !== "setup" && (
        <div className="mt-6 text-center">
          <span className="text-[10px] text-muted-foreground/50">
            Press{" "}
            <kbd className="px-1 py-0.5 bg-muted/50 border border-border/50 rounded text-[9px] font-mono">
              ?
            </kbd>{" "}
            for keyboard shortcuts
          </span>
        </div>
      )}
    </div>
  );
}
