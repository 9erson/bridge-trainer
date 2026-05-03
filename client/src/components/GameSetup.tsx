// ============================================================
// GameSetup — shared pre-game configuration panel
// Each game can extend with custom settings via children
// ============================================================

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Play, Settings2 } from "lucide-react";
import type { GameConfig, GameSettings } from "@/lib/gameRegistry";

interface GameSetupProps {
  config: GameConfig;
  onStart: (settings: GameSettings) => void;
  extraSettings?: React.ReactNode;
  extraDefaults?: Record<string, unknown>;
}

export default function GameSetup({
  config,
  onStart,
  extraSettings,
  extraDefaults,
}: GameSetupProps) {
  const [difficulty, setDifficulty] = useState(config.defaultDifficulty);
  const [handCount, setHandCount] = useState(config.defaultHandCount);
  const [timerEnabled, setTimerEnabled] = useState(
    config.defaultTimerSeconds !== null
  );
  const [timerSeconds, setTimerSeconds] = useState(
    config.defaultTimerSeconds ?? 15
  );
  const [feedbackMode, setFeedbackMode] = useState<"immediate" | "end">(
    config.defaultFeedbackMode
  );
  const [displayMode, setDisplayMode] = useState<"text" | "graphic">("text");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleStart = () => {
    onStart({
      gameId: config.id,
      difficulty,
      handCount,
      timerSeconds: timerEnabled ? timerSeconds : null,
      feedbackMode,
      displayMode,
      extra: extraDefaults ?? {},
    });
  };

  return (
    <Card className="w-full max-w-lg mx-auto border-border/50 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl">{config.name}</CardTitle>
        <CardDescription className="font-serif">
          {config.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Difficulty */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Difficulty</Label>
          <Select value={difficulty} onValueChange={setDifficulty}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {config.difficulties.map(d => (
                <SelectItem key={d.id} value={d.id}>
                  <div>
                    <span className="font-medium">{d.label}</span>
                    <span className="text-muted-foreground text-xs ml-2">
                      {d.description}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Hand count */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Hands per session</Label>
            <span className="font-mono text-sm text-muted-foreground">
              {handCount}
            </span>
          </div>
          <Slider
            value={[handCount]}
            onValueChange={([v]) => setHandCount(v)}
            min={5}
            max={30}
            step={5}
            className="w-full"
          />
        </div>

        {/* Display mode */}
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Card display</Label>
          <Select
            value={displayMode}
            onValueChange={v => setDisplayMode(v as "text" | "graphic")}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="text">Text</SelectItem>
              <SelectItem value="graphic">Cards</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Extra game-specific settings */}
        {extraSettings}

        {/* Advanced settings toggle */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <Settings2 className="w-3.5 h-3.5" />
          {showAdvanced ? "Hide" : "Show"} advanced settings
        </button>

        {showAdvanced && (
          <div className="space-y-4 pl-2 border-l-2 border-border/50">
            {/* Timer */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Timer</Label>
                <Switch
                  checked={timerEnabled}
                  onCheckedChange={setTimerEnabled}
                />
              </div>
              {timerEnabled && (
                <div className="flex items-center gap-3">
                  <Slider
                    value={[timerSeconds]}
                    onValueChange={([v]) => setTimerSeconds(v)}
                    min={5}
                    max={60}
                    step={5}
                    className="flex-1"
                  />
                  <span className="font-mono text-sm text-muted-foreground min-w-[3rem] text-right">
                    {timerSeconds}s
                  </span>
                </div>
              )}
            </div>

            {/* Feedback mode */}
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Feedback</Label>
              <Select
                value={feedbackMode}
                onValueChange={v => setFeedbackMode(v as "immediate" | "end")}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediate">After each hand</SelectItem>
                  <SelectItem value="end">End of session</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Start button */}
        <Button onClick={handleStart} className="w-full mt-2" size="lg">
          <Play className="w-4 h-4 mr-2" />
          Start Session
        </Button>
      </CardContent>
    </Card>
  );
}
