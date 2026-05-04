// ============================================================
// PointCountingSetup — config panel before starting a session
// Mode toggle: High Card Points vs Support Points (ACBL)
// ============================================================

import { useState } from "react";
import GameSetup from "@/components/GameSetup";
import { pointCountingConfig } from "./index";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { GameSettings } from "@/lib/gameRegistry";

type PointMode = "hcp" | "support";

interface Props {
  onStart: (settings: GameSettings) => void;
}

export default function PointCountingSetup({ onStart }: Props) {
  const [mode, setMode] = useState<PointMode>("hcp");

  const handleStart = (settings: GameSettings) => {
    onStart({
      ...settings,
      extra: { ...settings.extra, mode },
    });
  };

  const extraSettings = (
    <div className="space-y-2">
      <Label className="text-sm font-medium">Point Valuation</Label>
      <Select
        value={mode}
        onValueChange={v => setMode(v as PointMode)}
      >
        <SelectTrigger aria-label="Point Valuation">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="hcp">
            <div>
              <span className="font-medium">High Card Points</span>
              <span className="text-muted-foreground text-xs ml-2">
                A=4 K=3 Q=2 J=1
              </span>
            </div>
          </SelectItem>
          <SelectItem value="support">
            <div>
              <span className="font-medium">Support Points (ACBL)</span>
              <span className="text-muted-foreground text-xs ml-2">
                Void=5 Singleton=3 Doubleton=1
              </span>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <GameSetup
      config={pointCountingConfig}
      onStart={handleStart}
      extraSettings={extraSettings}
      extraDefaults={{ mode }}
    />
  );
}
