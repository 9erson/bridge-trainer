// ============================================================
// Convention System — rule-based opening bid evaluation
// Each convention is a priority-ordered list of rules.
// Rules are evaluated top-to-bottom; first match wins.
// ============================================================

import {
  type BridgeHand,
  type Suit,
  type SeatPosition,
  type Vulnerability,
  SUITS,
  calculateHCP,
  getSuitLength,
  isBalanced,
  isSemiBalanced,
  getLongestSuits,
  getDistribution,
  generateRandomHand,
} from "./bridge";

// ---- Types ----

export interface BidRule {
  bid: string;
  description: string;
  conditions: RuleCondition[];
}

export interface RuleCondition {
  type:
    | "hcp_range"
    | "balanced"
    | "semi_balanced"
    | "suit_length"
    | "suit_length_min"
    | "longest_suit"
    | "not_balanced"
    | "hcp_min"
    | "any_suit_length_min"
    | "no_5card_major"
    | "has_5card_major"
    | "no_4card_major"
    | "has_4card_major"
    | "longer_minor"
    | "equal_minors_prefer"
    | "partner_bid"
    | "fit_with_partner"
    | "support_count";
  // Parameters vary by type
  min?: number;
  max?: number;
  suit?: Suit | "longest" | "any";
  length?: number;
  value?: boolean | string;
}

export interface Convention {
  id: string;
  name: string;
  description: string;
  rules: BidRule[];
}

// ---- Convention Registry ----

const conventions = new Map<string, Convention>();

export function registerConvention(convention: Convention): void {
  conventions.set(convention.id, convention);
}

export function getConvention(id: string): Convention | undefined {
  return conventions.get(id);
}

export function getAllConventions(): Convention[] {
  return Array.from(conventions.values());
}

// ---- Responder Context ----

export interface ResponderContext {
  partnerBid: string; // e.g. "1H", "1S", "1C", "1D"
}

// ---- Rule Evaluator ----

function evaluateCondition(
  hand: BridgeHand,
  condition: RuleCondition,
  _seat: SeatPosition,
  _vuln: Vulnerability,
  _responderCtx?: ResponderContext
): boolean {
  const hcp = calculateHCP(hand);

  switch (condition.type) {
    case "hcp_range":
      return hcp >= (condition.min ?? 0) && hcp <= (condition.max ?? 37);

    case "hcp_min":
      return hcp >= (condition.min ?? 0);

    case "balanced":
      return isBalanced(hand);

    case "semi_balanced":
      return isSemiBalanced(hand);

    case "not_balanced":
      return !isBalanced(hand);

    case "suit_length": {
      if (!condition.suit || condition.length == null) return false;
      const reqLen = condition.length;
      if (condition.suit === "longest") {
        const longest = getLongestSuits(hand);
        return longest.some(s => getSuitLength(hand, s) === reqLen);
      }
      return getSuitLength(hand, condition.suit as Suit) === reqLen;
    }

    case "suit_length_min": {
      if (!condition.suit || condition.length == null) return false;
      const minLen = condition.length;
      if (condition.suit === "any") {
        return SUITS.some(s => getSuitLength(hand, s) >= minLen);
      }
      return getSuitLength(hand, condition.suit as Suit) >= minLen;
    }

    case "any_suit_length_min": {
      if (condition.length == null) return false;
      const anyMinLen = condition.length;
      return SUITS.some(s => getSuitLength(hand, s) >= anyMinLen);
    }

    case "has_5card_major":
      return getSuitLength(hand, "S") >= 5 || getSuitLength(hand, "H") >= 5;

    case "no_5card_major":
      return getSuitLength(hand, "S") < 5 && getSuitLength(hand, "H") < 5;

    case "has_4card_major":
      return getSuitLength(hand, "S") >= 4 || getSuitLength(hand, "H") >= 4;

    case "no_4card_major":
      return getSuitLength(hand, "S") < 4 && getSuitLength(hand, "H") < 4;

    case "longest_suit": {
      if (!condition.suit) return false;
      const longest = getLongestSuits(hand);
      return longest.includes(condition.suit as Suit);
    }

    case "longer_minor": {
      const cLen = getSuitLength(hand, "C");
      const dLen = getSuitLength(hand, "D");
      if (condition.suit === "D") return dLen > cLen;
      if (condition.suit === "C") return cLen > dLen;
      return false;
    }

    case "equal_minors_prefer": {
      const cLen = getSuitLength(hand, "C");
      const dLen = getSuitLength(hand, "D");
      if (cLen !== dLen) return false;
      return condition.suit === condition.value;
    }

    case "partner_bid": {
      if (!_responderCtx) return false;
      return _responderCtx.partnerBid === (condition.value as string);
    }

    case "fit_with_partner": {
      if (!_responderCtx) return false;
      const partnerSuit = _responderCtx.partnerBid[1] as Suit;
      if (!SUITS.includes(partnerSuit)) return false;
      const supportLen = getSuitLength(hand, partnerSuit);
      return condition.value === true ? supportLen >= 3 : supportLen < 3;
    }

    case "support_count": {
      if (!_responderCtx) return false;
      const partnerSuit = _responderCtx.partnerBid[1] as Suit;
      if (!SUITS.includes(partnerSuit)) return false;
      const supportLen = getSuitLength(hand, partnerSuit);
      const minVal = condition.min ?? 0;
      const maxVal = condition.max ?? 13;
      return supportLen >= minVal && supportLen <= maxVal;
    }

    default:
      return false;
  }
}

export function evaluateOpeningBid(
  hand: BridgeHand,
  conventionId: string,
  seat: SeatPosition = "1st",
  vulnerability: Vulnerability = "none",
  responderCtx?: ResponderContext
): { bid: string; description: string } | null {
  const convention = getConvention(conventionId);
  if (!convention) return null;

  for (const rule of convention.rules) {
    const allMatch = rule.conditions.every(cond =>
      evaluateCondition(hand, cond, seat, vulnerability, responderCtx)
    );
    if (allMatch) {
      return { bid: rule.bid, description: rule.description };
    }
  }

  return { bid: "Pass", description: "Does not meet any requirements" };
}

// ---- Determine the correct opening bid for a hand ----
// Returns the bid string and explanation

export function getCorrectBid(
  hand: BridgeHand,
  conventionId: string,
  seat: SeatPosition = "1st",
  vulnerability: Vulnerability = "none",
  responderCtx?: ResponderContext
): { bid: string; description: string } {
  const result = evaluateOpeningBid(
    hand,
    conventionId,
    seat,
    vulnerability,
    responderCtx
  );
  return result ?? { bid: "Pass", description: "No matching rule found" };
}

// ---- Generate a hand with an unambiguous opening bid ----

export function generateUnambiguousHand(
  conventionId: string,
  seat: SeatPosition = "1st",
  vulnerability: Vulnerability = "none",
  maxAttempts: number = 100
): { hand: BridgeHand; bid: string; description: string } | null {
  for (let i = 0; i < maxAttempts; i++) {
    const hand = generateRandomHand();
    const result = getCorrectBid(hand, conventionId, seat, vulnerability);
    if (result) {
      return { hand, ...result };
    }
  }
  return null;
}

// ---- Get available bids for difficulty level ----

export function getBidsForDifficulty(difficulty: string): string[] {
  switch (difficulty) {
    case "easy":
      return ["Pass", "1C", "1D", "1H", "1S", "1NT"];
    case "medium":
      return [
        "Pass",
        "1C",
        "1D",
        "1H",
        "1S",
        "1NT",
        "2C",
        "2D",
        "2H",
        "2S",
        "2NT",
      ];
    case "hard":
      return [
        "Pass",
        "1C",
        "1D",
        "1H",
        "1S",
        "1NT",
        "2C",
        "2D",
        "2H",
        "2S",
        "2NT",
        "3C",
        "3D",
        "3H",
        "3S",
      ];
    default:
      return ["Pass", "1C", "1D", "1H", "1S", "1NT"];
  }
}

// ---- Format bid for display ----

const SUIT_BID_SYMBOLS: Record<string, string> = {
  C: "\u2663",
  D: "\u2666",
  H: "\u2665",
  S: "\u2660",
};

export function formatBid(bid: string): { text: string; color: string } {
  if (bid === "Pass") return { text: "Pass", color: "var(--bid-pass)" };
  if (bid.endsWith("NT")) return { text: bid, color: "var(--suit-black)" };

  const level = bid[0];
  const suitChar = bid[1];
  const symbol = SUIT_BID_SYMBOLS[suitChar];
  const color =
    suitChar === "H" || suitChar === "D"
      ? "var(--suit-red)"
      : "var(--suit-black)";

  return { text: `${level}${symbol}`, color };
}

// ---- Get the correct response bid for a hand ----

export function getCorrectResponse(
  hand: BridgeHand,
  conventionId: string,
  partnerBid: string
): { bid: string; description: string } {
  const ctx: ResponderContext = { partnerBid };
  return getCorrectBid(hand, conventionId, "1st", "none", ctx);
}

// ---- Get available response bids for difficulty level ----

export function getResponseBidsForDifficulty(difficulty: string): string[] {
  switch (difficulty) {
    case "easy":
      return ["Pass", "1NT", "2C", "2D", "2H", "2S"];
    case "medium":
      return ["Pass", "1C", "1D", "1H", "1S", "1NT", "2C", "2D", "2H", "2S"];
    case "hard":
      return [
        "Pass",
        "1C",
        "1D",
        "1H",
        "1S",
        "1NT",
        "2C",
        "2D",
        "2H",
        "2S",
        "2NT",
        "3C",
        "3D",
        "3H",
        "3S",
        "3NT",
      ];
    default:
      return ["Pass", "1NT", "2C", "2D", "2H", "2S"];
  }
}

// ---- Generate a responder scenario ----

const PARTNER_OPENINGS = ["1C", "1D", "1H", "1S"];

export interface ResponderScenario {
  hand: BridgeHand;
  partnerBid: string;
  correctBid: string;
  description: string;
}

export function generateResponderScenario(
  conventionId: string,
  difficulty: string,
  availableBids: string[],
  maxAttempts: number = 300
): ResponderScenario | null {
  for (let i = 0; i < maxAttempts; i++) {
    const hand = generateRandomHand();
    const partnerBid =
      PARTNER_OPENINGS[Math.floor(Math.random() * PARTNER_OPENINGS.length)];
    const result = getCorrectResponse(hand, conventionId, partnerBid);

    if (result.bid !== "Pass" && availableBids.includes(result.bid)) {
      return {
        hand,
        partnerBid,
        correctBid: result.bid,
        description: result.description,
      };
    }
  }
  return null;
}
