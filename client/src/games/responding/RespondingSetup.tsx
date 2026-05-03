import { useState } from "react";
import GameSetup from "@/components/GameSetup";
import { respondingConfig } from "./index";
import { Label } from "@/components/ui/label";
import type { GameSettings } from "@/lib/gameRegistry";

interface Props {
  onStart: (settings: GameSettings) => void;
}

export default function RespondingSetup({ onStart }: Props) {
  const [conventionId] = useState("sayc-responses");

  const handleStart = (settings: GameSettings) => {
    onStart({
      ...settings,
      feedbackMode: "end",
      extra: { ...settings.extra, conventionId },
    });
  };

  const extraSettings = (
    <div className="space-y-2">
      <Label className="text-sm font-medium">Convention</Label>
      <div className="px-3 py-2 bg-muted/50 rounded-md text-sm text-muted-foreground">
        Standard American (SAYC) Responses
      </div>
      <p className="text-xs text-muted-foreground font-serif">
        Responses to 1-level suit openings. More convention systems coming soon.
      </p>
    </div>
  );

  return (
    <GameSetup
      config={respondingConfig}
      onStart={handleStart}
      extraSettings={extraSettings}
      extraDefaults={{ conventionId }}
    />
  );
}
