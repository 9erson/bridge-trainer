// ============================================================
// Hand generation for bidding practice
// Generates random hands that produce a valid bid for a given
// convention/difficulty. Yields to the main thread periodically
// to keep the UI responsive.
// ============================================================

import {
  type BridgeHand,
  type SeatPosition,
  type Vulnerability,
  generateRandomHand,
} from "./bridge";
import { getCorrectBid } from "./conventions";
import { yieldToMainThread } from "./scheduler";

const SEATS: SeatPosition[] = ["1st", "2nd", "3rd", "4th"];
const VULNS: Vulnerability[] = ["none", "ns", "ew", "both"];

function getRandomSeat(difficulty: string): SeatPosition {
  if (difficulty === "easy") return "1st";
  return SEATS[Math.floor(Math.random() * SEATS.length)];
}

function getRandomVuln(difficulty: string): Vulnerability {
  if (difficulty === "easy" || difficulty === "medium") return "none";
  return VULNS[Math.floor(Math.random() * VULNS.length)];
}

/** Number of iterations between yields to the main thread */
const YIELD_INTERVAL = 10;

export interface HandGenerationResult {
  hand: BridgeHand;
  bid: string;
  description: string;
  seat: SeatPosition;
  vuln: Vulnerability;
}

/**
 * Generate a random hand that produces a bid matching one of the
 * available bids for the given convention and difficulty.
 *
 * Yields to the main thread every `YIELD_INTERVAL` iterations so
 * the browser can process events and repaint.
 */
export async function generateHandForBidding(
  conventionId: string,
  difficulty: string,
  availableBids: string[],
  maxAttempts: number = 200
): Promise<HandGenerationResult> {
  const seat = getRandomSeat(difficulty);
  const vuln = getRandomVuln(difficulty);

  for (let i = 0; i < maxAttempts; i++) {
    if (i > 0 && i % YIELD_INTERVAL === 0) {
      await yieldToMainThread();
    }

    const hand = generateRandomHand();
    const result = getCorrectBid(hand, conventionId, seat, vuln);
    if (result && availableBids.includes(result.bid)) {
      return {
        hand,
        bid: result.bid,
        description: result.description,
        seat,
        vuln,
      };
    }
  }

  // Fallback: return a hand even if its bid isn't in availableBids
  const hand = generateRandomHand();
  const result = getCorrectBid(hand, conventionId, seat, vuln);
  return { hand, bid: result.bid, description: result.description, seat, vuln };
}
