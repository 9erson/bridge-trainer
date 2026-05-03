// ============================================================
// PointCountingSetup — config panel before starting a session
// ============================================================

import GameSetup from "@/components/GameSetup";
import { pointCountingConfig } from "./index";
import type { GameSettings } from "@/lib/gameRegistry";

interface Props {
  onStart: (settings: GameSettings) => void;
}

export default function PointCountingSetup({ onStart }: Props) {
  return <GameSetup config={pointCountingConfig} onStart={onStart} />;
}
