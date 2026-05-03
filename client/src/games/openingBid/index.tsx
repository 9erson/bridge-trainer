// ============================================================
// Opening Bid Game Module
// Practice opening bids with different conventions
// ============================================================

import { registerGame } from "@/lib/gameRegistry";
import OpeningBidSetup from "./OpeningBidSetup";
import OpeningBidPlay from "./OpeningBidPlay";
import OpeningBidResults from "./OpeningBidResults";

const BIDDING_ICON = "/manus-storage/bidding-icon_dbbe21b4.png";

export const openingBidConfig = {
  id: "opening-bid",
  name: "Opening Bid",
  description:
    "Practice choosing the correct opening bid for a given hand and convention.",
  icon: BIDDING_ICON,
  difficulties: [
    { id: "easy", label: "Easy", description: "1st seat, no vuln, basic bids" },
    {
      id: "medium",
      label: "Medium",
      description: "Any seat, no vuln, full bids",
    },
    { id: "hard", label: "Hard", description: "Any seat, any vuln, full bids" },
  ],
  defaultHandCount: 10,
  defaultTimerSeconds: null,
  defaultDifficulty: "easy",
  defaultFeedbackMode: "immediate" as const,
};

registerGame({
  config: openingBidConfig,
  SetupComponent: OpeningBidSetup,
  PlayComponent: OpeningBidPlay,
  ResultsComponent: OpeningBidResults,
});
