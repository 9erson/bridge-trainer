// ============================================================
// OpeningBidSetup — config panel with convention selector
// ============================================================

import { useState } from "react";
import GameSetup from "@/components/GameSetup";
import { openingBidConfig } from "./index";
import { getAllConventions } from "@/lib/conventions";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { GameSettings } from "@/lib/gameRegistry";

interface Props {
  onStart: (settings: GameSettings) => void;
}

export default function OpeningBidSetup({ onStart }: Props) {
  const conventions = getAllConventions();
  const [conventionId, setConventionId] = useState(
    conventions[0]?.id ?? "sayc"
  );

  const handleStart = (settings: GameSettings) => {
    onStart({
      ...settings,
      extra: { ...settings.extra, conventionId },
    });
  };

  const extraSettings = (
    <div className="space-y-2">
      <Label className="text-sm font-medium">Convention</Label>
      <Select value={conventionId} onValueChange={setConventionId}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {conventions.map(c => (
            <SelectItem key={c.id} value={c.id}>
              <div>
                <span className="font-medium">{c.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {conventions.find(c => c.id === conventionId) && (
        <p className="text-xs text-muted-foreground font-serif">
          {conventions.find(c => c.id === conventionId)?.description}
        </p>
      )}
    </div>
  );

  return (
    <GameSetup
      config={openingBidConfig}
      onStart={handleStart}
      extraSettings={extraSettings}
      extraDefaults={{ conventionId }}
    />
  );
}
