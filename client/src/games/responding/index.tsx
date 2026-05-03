import { registerGame } from "@/lib/gameRegistry";
import RespondingSetup from "./RespondingSetup";
import RespondingPlay from "./RespondingPlay";
import RespondingResults from "./RespondingResults";

const RESPONDING_ICON = "/manus-storage/bidding-icon_dbbe21b4.png";

export const respondingConfig = {
  id: "responding",
  name: "Responding",
  description:
    "Practice responding to partner's 1-level suit opening bid (1C, 1D, 1H, 1S) using SAYC conventions.",
  icon: RESPONDING_ICON,
  difficulties: [
    { id: "easy", label: "Easy", description: "Simple raises + 1NT response" },
    { id: "medium", label: "Medium", description: "+ new suits at 1-level" },
    { id: "hard", label: "Hard", description: "+ jump raises, 2NT, full grid" },
  ],
  defaultHandCount: 10,
  defaultTimerSeconds: null,
  defaultDifficulty: "easy",
  defaultFeedbackMode: "end" as const,
};

registerGame({
  config: respondingConfig,
  SetupComponent: RespondingSetup,
  PlayComponent: RespondingPlay,
  ResultsComponent: RespondingResults,
});
