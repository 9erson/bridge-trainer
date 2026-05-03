// ============================================================
// Point Counting Game Module
// Practice counting high card points (A=4, K=3, Q=2, J=1)
// ============================================================

import { registerGame } from "@/lib/gameRegistry";
import PointCountingSetup from "./PointCountingSetup";
import PointCountingPlay from "./PointCountingPlay";
import PointCountingResults from "./PointCountingResults";

const POINT_COUNTING_ICON = "/manus-storage/point-counting-icon_3c22357d.png";

export const pointCountingConfig = {
  id: "point-counting",
  name: "Point Counting",
  description:
    "Practice counting high card points quickly and accurately. A=4, K=3, Q=2, J=1.",
  icon: POINT_COUNTING_ICON,
  difficulties: [
    { id: "easy", label: "Easy", description: "Multiple choice" },
    { id: "hard", label: "Hard", description: "Type the answer" },
  ],
  defaultHandCount: 10,
  defaultTimerSeconds: null,
  defaultDifficulty: "easy",
  defaultFeedbackMode: "immediate" as const,
};

registerGame({
  config: pointCountingConfig,
  SetupComponent: PointCountingSetup,
  PlayComponent: PointCountingPlay,
  ResultsComponent: PointCountingResults,
});
