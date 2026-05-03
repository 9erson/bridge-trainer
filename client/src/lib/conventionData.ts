// ============================================================
// Convention Definitions
// Each convention is a priority-ordered list of rules.
// Rules are evaluated top-to-bottom; first match wins.
// To add a new convention: create a new object and register it.
// ============================================================

import { registerConvention, type Convention } from "./conventions";

// ---- Standard American Yellow Card (SAYC) ----

const standardAmerican: Convention = {
  id: "sayc",
  name: "Standard American (SAYC)",
  description:
    "Standard American Yellow Card — the most common convention in North America. 5-card majors, strong NT (15-17), strong 2♣.",
  rules: [
    // Strong 2C: 22+ HCP (or 20-21 unbalanced with a good suit)
    {
      bid: "2C",
      description: "22+ HCP, strong artificial forcing bid",
      conditions: [{ type: "hcp_min", min: 22 }],
    },
    // 2NT: 20-21 HCP, balanced
    {
      bid: "2NT",
      description: "20-21 HCP, balanced hand",
      conditions: [
        { type: "hcp_range", min: 20, max: 21 },
        { type: "balanced" },
      ],
    },
    // 1NT: 15-17 HCP, balanced
    {
      bid: "1NT",
      description: "15-17 HCP, balanced hand",
      conditions: [
        { type: "hcp_range", min: 15, max: 17 },
        { type: "balanced" },
      ],
    },
    // Weak 2H: 5-11 HCP, 6+ hearts
    {
      bid: "2H",
      description: "5-11 HCP, 6-card heart suit, weak two bid",
      conditions: [
        { type: "hcp_range", min: 5, max: 11 },
        { type: "suit_length_min", suit: "H", length: 6 },
      ],
    },
    // Weak 2S: 5-11 HCP, 6+ spades
    {
      bid: "2S",
      description: "5-11 HCP, 6-card spade suit, weak two bid",
      conditions: [
        { type: "hcp_range", min: 5, max: 11 },
        { type: "suit_length_min", suit: "S", length: 6 },
      ],
    },
    // Weak 2D: 5-11 HCP, 6+ diamonds
    {
      bid: "2D",
      description: "5-11 HCP, 6-card diamond suit, weak two bid",
      conditions: [
        { type: "hcp_range", min: 5, max: 11 },
        { type: "suit_length_min", suit: "D", length: 6 },
      ],
    },
    // 3-level preempts: 5-10 HCP, 7+ card suit
    {
      bid: "3S",
      description: "5-10 HCP, 7-card spade suit, preemptive bid",
      conditions: [
        { type: "hcp_range", min: 5, max: 10 },
        { type: "suit_length_min", suit: "S", length: 7 },
      ],
    },
    {
      bid: "3H",
      description: "5-10 HCP, 7-card heart suit, preemptive bid",
      conditions: [
        { type: "hcp_range", min: 5, max: 10 },
        { type: "suit_length_min", suit: "H", length: 7 },
      ],
    },
    {
      bid: "3D",
      description: "5-10 HCP, 7-card diamond suit, preemptive bid",
      conditions: [
        { type: "hcp_range", min: 5, max: 10 },
        { type: "suit_length_min", suit: "D", length: 7 },
      ],
    },
    {
      bid: "3C",
      description: "5-10 HCP, 7-card club suit, preemptive bid",
      conditions: [
        { type: "hcp_range", min: 5, max: 10 },
        { type: "suit_length_min", suit: "C", length: 7 },
      ],
    },
    // 1S: 12+ HCP, 5+ spades (bid spades before hearts with 5-5)
    {
      bid: "1S",
      description: "12+ HCP, 5+ spades",
      conditions: [
        { type: "hcp_range", min: 12, max: 21 },
        { type: "suit_length_min", suit: "S", length: 5 },
      ],
    },
    // 1H: 12+ HCP, 5+ hearts
    {
      bid: "1H",
      description: "12+ HCP, 5+ hearts",
      conditions: [
        { type: "hcp_range", min: 12, max: 21 },
        { type: "suit_length_min", suit: "H", length: 5 },
      ],
    },
    // 1D: 12+ HCP, 3+ diamonds (longer minor, or diamonds with 4-4)
    {
      bid: "1D",
      description: "12+ HCP, 3+ diamonds, no 5-card major",
      conditions: [
        { type: "hcp_range", min: 12, max: 21 },
        { type: "no_5card_major" },
        { type: "suit_length_min", suit: "D", length: 3 },
      ],
    },
    // 1C: 12+ HCP, 3+ clubs, no 5-card major, shorter diamonds
    {
      bid: "1C",
      description: "12+ HCP, 3+ clubs, no 5-card major",
      conditions: [
        { type: "hcp_range", min: 12, max: 21 },
        { type: "no_5card_major" },
        { type: "suit_length_min", suit: "C", length: 3 },
      ],
    },
    // Pass: everything else
    {
      bid: "Pass",
      description: "Does not meet opening requirements",
      conditions: [{ type: "hcp_range", min: 0, max: 37 }],
    },
  ],
};

// ---- Two Over One Game Forcing (2/1) ----

const twoOverOne: Convention = {
  id: "2over1",
  name: "Two Over One (2/1)",
  description:
    "2/1 Game Forcing system. Similar to SAYC but with 1NT forcing response. 5-card majors, 15-17 NT, strong 2♣.",
  rules: [
    // Strong 2C
    {
      bid: "2C",
      description: "22+ HCP, strong artificial forcing bid",
      conditions: [{ type: "hcp_min", min: 22 }],
    },
    // 2NT: 20-21 balanced
    {
      bid: "2NT",
      description: "20-21 HCP, balanced hand",
      conditions: [
        { type: "hcp_range", min: 20, max: 21 },
        { type: "balanced" },
      ],
    },
    // 1NT: 15-17 balanced
    {
      bid: "1NT",
      description: "15-17 HCP, balanced hand",
      conditions: [
        { type: "hcp_range", min: 15, max: 17 },
        { type: "balanced" },
      ],
    },
    // Weak 2s
    {
      bid: "2H",
      description: "5-11 HCP, 6-card heart suit, weak two bid",
      conditions: [
        { type: "hcp_range", min: 5, max: 11 },
        { type: "suit_length_min", suit: "H", length: 6 },
      ],
    },
    {
      bid: "2S",
      description: "5-11 HCP, 6-card spade suit, weak two bid",
      conditions: [
        { type: "hcp_range", min: 5, max: 11 },
        { type: "suit_length_min", suit: "S", length: 6 },
      ],
    },
    {
      bid: "2D",
      description: "5-11 HCP, 6-card diamond suit, weak two bid",
      conditions: [
        { type: "hcp_range", min: 5, max: 11 },
        { type: "suit_length_min", suit: "D", length: 6 },
      ],
    },
    // 3-level preempts
    {
      bid: "3S",
      description: "5-10 HCP, 7-card spade suit, preemptive bid",
      conditions: [
        { type: "hcp_range", min: 5, max: 10 },
        { type: "suit_length_min", suit: "S", length: 7 },
      ],
    },
    {
      bid: "3H",
      description: "5-10 HCP, 7-card heart suit, preemptive bid",
      conditions: [
        { type: "hcp_range", min: 5, max: 10 },
        { type: "suit_length_min", suit: "H", length: 7 },
      ],
    },
    {
      bid: "3D",
      description: "5-10 HCP, 7-card diamond suit, preemptive bid",
      conditions: [
        { type: "hcp_range", min: 5, max: 10 },
        { type: "suit_length_min", suit: "D", length: 7 },
      ],
    },
    {
      bid: "3C",
      description: "5-10 HCP, 7-card club suit, preemptive bid",
      conditions: [
        { type: "hcp_range", min: 5, max: 10 },
        { type: "suit_length_min", suit: "C", length: 7 },
      ],
    },
    // 1S: 12+ HCP, 5+ spades
    {
      bid: "1S",
      description: "12+ HCP, 5+ spades",
      conditions: [
        { type: "hcp_range", min: 12, max: 21 },
        { type: "suit_length_min", suit: "S", length: 5 },
      ],
    },
    // 1H: 12+ HCP, 5+ hearts
    {
      bid: "1H",
      description: "12+ HCP, 5+ hearts",
      conditions: [
        { type: "hcp_range", min: 12, max: 21 },
        { type: "suit_length_min", suit: "H", length: 5 },
      ],
    },
    // 1D: 12+ HCP, 3+ diamonds
    {
      bid: "1D",
      description: "12+ HCP, 3+ diamonds, no 5-card major",
      conditions: [
        { type: "hcp_range", min: 12, max: 21 },
        { type: "no_5card_major" },
        { type: "suit_length_min", suit: "D", length: 3 },
      ],
    },
    // 1C: 12+ HCP, 3+ clubs
    {
      bid: "1C",
      description: "12+ HCP, 3+ clubs, no 5-card major",
      conditions: [
        { type: "hcp_range", min: 12, max: 21 },
        { type: "no_5card_major" },
        { type: "suit_length_min", suit: "C", length: 3 },
      ],
    },
    // Pass
    {
      bid: "Pass",
      description: "Does not meet opening requirements",
      conditions: [{ type: "hcp_range", min: 0, max: 37 }],
    },
  ],
};

// ---- Precision Club ----

const precision: Convention = {
  id: "precision",
  name: "Precision Club",
  description:
    "Precision Club system. 1♣ is artificial showing 16+ HCP. 1♦ is catch-all 11-15. 1NT is 13-15 balanced.",
  rules: [
    // 1C: 16+ HCP (artificial, forcing)
    {
      bid: "1C",
      description: "16+ HCP, artificial strong forcing opening",
      conditions: [{ type: "hcp_min", min: 16 }],
    },
    // 1NT: 13-15 balanced
    {
      bid: "1NT",
      description: "13-15 HCP, balanced hand",
      conditions: [
        { type: "hcp_range", min: 13, max: 15 },
        { type: "balanced" },
      ],
    },
    // Weak 2s: 5-11 HCP, 6+ card suit
    {
      bid: "2H",
      description: "5-11 HCP, 6-card heart suit, weak two bid",
      conditions: [
        { type: "hcp_range", min: 5, max: 11 },
        { type: "suit_length_min", suit: "H", length: 6 },
      ],
    },
    {
      bid: "2S",
      description: "5-11 HCP, 6-card spade suit, weak two bid",
      conditions: [
        { type: "hcp_range", min: 5, max: 11 },
        { type: "suit_length_min", suit: "S", length: 6 },
      ],
    },
    // 2D: 11-15, 3-suited short diamond (or 4-4-1-4 / 4-4-0-5 type)
    {
      bid: "2D",
      description: "11-15 HCP, short diamonds (4-4-1-4 or similar)",
      conditions: [
        { type: "hcp_range", min: 11, max: 15 },
        { type: "suit_length_min", suit: "H", length: 4 },
        { type: "suit_length_min", suit: "S", length: 4 },
      ],
    },
    // 3-level preempts
    {
      bid: "3S",
      description: "5-10 HCP, 7-card spade suit, preemptive bid",
      conditions: [
        { type: "hcp_range", min: 5, max: 10 },
        { type: "suit_length_min", suit: "S", length: 7 },
      ],
    },
    {
      bid: "3H",
      description: "5-10 HCP, 7-card heart suit, preemptive bid",
      conditions: [
        { type: "hcp_range", min: 5, max: 10 },
        { type: "suit_length_min", suit: "H", length: 7 },
      ],
    },
    {
      bid: "3D",
      description: "5-10 HCP, 7-card diamond suit, preemptive bid",
      conditions: [
        { type: "hcp_range", min: 5, max: 10 },
        { type: "suit_length_min", suit: "D", length: 7 },
      ],
    },
    {
      bid: "3C",
      description: "5-10 HCP, 7-card club suit, preemptive bid",
      conditions: [
        { type: "hcp_range", min: 5, max: 10 },
        { type: "suit_length_min", suit: "C", length: 7 },
      ],
    },
    // 2C: 11-15, 6+ clubs
    {
      bid: "2C",
      description: "11-15 HCP, 6+ clubs",
      conditions: [
        { type: "hcp_range", min: 11, max: 15 },
        { type: "suit_length_min", suit: "C", length: 6 },
      ],
    },
    // 1S: 11-15, 5+ spades
    {
      bid: "1S",
      description: "11-15 HCP, 5+ spades",
      conditions: [
        { type: "hcp_range", min: 11, max: 15 },
        { type: "suit_length_min", suit: "S", length: 5 },
      ],
    },
    // 1H: 11-15, 5+ hearts
    {
      bid: "1H",
      description: "11-15 HCP, 5+ hearts",
      conditions: [
        { type: "hcp_range", min: 11, max: 15 },
        { type: "suit_length_min", suit: "H", length: 5 },
      ],
    },
    // 1D: 11-15, catch-all (no 5-card major, not balanced enough for 1NT)
    {
      bid: "1D",
      description: "11-15 HCP, catch-all opening (may be short)",
      conditions: [{ type: "hcp_range", min: 11, max: 15 }],
    },
    // Pass
    {
      bid: "Pass",
      description: "Does not meet opening requirements",
      conditions: [{ type: "hcp_range", min: 0, max: 37 }],
    },
  ],
};

// Register all conventions
registerConvention(standardAmerican);
registerConvention(twoOverOne);
registerConvention(precision);

// ---- Modern Acol (Three Weak Twos) ----

const acol: Convention = {
  id: "acol",
  name: "Acol",
  description:
    "Modern Acol with three weak twos. 4-card majors, weak NT (12-14), strong 2♣ (23+). The dominant system in British tournament play.",
  rules: [
    // 2C: 23+ HCP, game-forcing artificial
    {
      bid: "2C",
      description: "23+ HCP, strong artificial game-forcing bid",
      conditions: [{ type: "hcp_min", min: 23 }],
    },
    // 2NT: 20-22 balanced
    {
      bid: "2NT",
      description: "20-22 HCP, balanced hand",
      conditions: [
        { type: "hcp_range", min: 20, max: 22 },
        { type: "balanced" },
      ],
    },
    // 1NT: 12-14 balanced, no 4-card major
    {
      bid: "1NT",
      description: "12-14 HCP, balanced hand, no 4-card major",
      conditions: [
        { type: "hcp_range", min: 12, max: 14 },
        { type: "balanced" },
        { type: "no_4card_major" },
      ],
    },
    // Weak 2D: 5-10 HCP, 6+ diamonds
    {
      bid: "2D",
      description: "5-10 HCP, 6-card diamond suit, weak two bid",
      conditions: [
        { type: "hcp_range", min: 5, max: 10 },
        { type: "suit_length_min", suit: "D", length: 6 },
      ],
    },
    // Weak 2H: 5-10 HCP, 6+ hearts
    {
      bid: "2H",
      description: "5-10 HCP, 6-card heart suit, weak two bid",
      conditions: [
        { type: "hcp_range", min: 5, max: 10 },
        { type: "suit_length_min", suit: "H", length: 6 },
      ],
    },
    // Weak 2S: 5-10 HCP, 6+ spades
    {
      bid: "2S",
      description: "5-10 HCP, 6-card spade suit, weak two bid",
      conditions: [
        { type: "hcp_range", min: 5, max: 10 },
        { type: "suit_length_min", suit: "S", length: 6 },
      ],
    },
    // 3-level preempts: 5-10 HCP, 7+ card suit
    {
      bid: "3S",
      description: "5-10 HCP, 7-card spade suit, preemptive bid",
      conditions: [
        { type: "hcp_range", min: 5, max: 10 },
        { type: "suit_length_min", suit: "S", length: 7 },
      ],
    },
    {
      bid: "3H",
      description: "5-10 HCP, 7-card heart suit, preemptive bid",
      conditions: [
        { type: "hcp_range", min: 5, max: 10 },
        { type: "suit_length_min", suit: "H", length: 7 },
      ],
    },
    {
      bid: "3D",
      description: "5-10 HCP, 7-card diamond suit, preemptive bid",
      conditions: [
        { type: "hcp_range", min: 5, max: 10 },
        { type: "suit_length_min", suit: "D", length: 7 },
      ],
    },
    {
      bid: "3C",
      description: "5-10 HCP, 7-card club suit, preemptive bid",
      conditions: [
        { type: "hcp_range", min: 5, max: 10 },
        { type: "suit_length_min", suit: "C", length: 7 },
      ],
    },
    // 1S: 12-22 HCP, 4+ spades (bid higher suit first with equal length)
    {
      bid: "1S",
      description: "12-22 HCP, 4+ spades",
      conditions: [
        { type: "hcp_range", min: 12, max: 22 },
        { type: "suit_length_min", suit: "S", length: 4 },
      ],
    },
    // 1H: 12-22 HCP, 4+ hearts
    {
      bid: "1H",
      description: "12-22 HCP, 4+ hearts",
      conditions: [
        { type: "hcp_range", min: 12, max: 22 },
        { type: "suit_length_min", suit: "H", length: 4 },
      ],
    },
    // 1D: 12-22 HCP, no 4-card major, diamonds longer or equal to clubs
    {
      bid: "1D",
      description: "12-22 HCP, no 4-card major, longer or equal diamonds",
      conditions: [
        { type: "hcp_range", min: 12, max: 22 },
        { type: "no_4card_major" },
        { type: "longer_minor", suit: "D" },
      ],
    },
    {
      bid: "1D",
      description: "12-22 HCP, no 4-card major, equal minors prefer diamonds",
      conditions: [
        { type: "hcp_range", min: 12, max: 22 },
        { type: "no_4card_major" },
        { type: "equal_minors_prefer", suit: "D", value: "D" },
      ],
    },
    // 1C: 12-22 HCP, no 4-card major, clubs longer than diamonds
    {
      bid: "1C",
      description: "12-22 HCP, no 4-card major, longer clubs",
      conditions: [
        { type: "hcp_range", min: 12, max: 22 },
        { type: "no_4card_major" },
        { type: "longer_minor", suit: "C" },
      ],
    },
    // Pass: everything else
    {
      bid: "Pass",
      description: "Does not meet opening requirements",
      conditions: [{ type: "hcp_range", min: 0, max: 37 }],
    },
  ],
};

registerConvention(acol);

// ---- SAYC Responses to 1-Level Suit Openings ----

const saycResponses: Convention = {
  id: "sayc-responses",
  name: "SAYC Responses",
  description:
    "SAYC responses to 1-level suit openings (1C, 1D, 1H, 1S). Priority-ordered: first matching rule wins.",
  rules: [
    // ============================================================
    // Responses to 1H
    // ============================================================

    // Jump raise: 13+ HCP, 4+ heart support — limit raise
    {
      bid: "3H",
      description: "13+ HCP, 4+ heart support — limit raise",
      conditions: [
        { type: "partner_bid", value: "1H" },
        { type: "hcp_min", min: 13 },
        { type: "support_count", min: 4 },
      ],
    },
    // Invitational raise: 10-12 HCP, 3+ heart support
    {
      bid: "3H",
      description: "10-12 HCP, 3 heart support — invitational raise",
      conditions: [
        { type: "partner_bid", value: "1H" },
        { type: "hcp_range", min: 10, max: 12 },
        { type: "fit_with_partner", value: true },
      ],
    },
    // Simple raise: 6-9 HCP, 3+ heart support
    {
      bid: "2H",
      description: "6-9 HCP, 3+ heart support — simple raise",
      conditions: [
        { type: "partner_bid", value: "1H" },
        { type: "hcp_range", min: 6, max: 9 },
        { type: "fit_with_partner", value: true },
      ],
    },
    // New suit 1S: 6+ HCP, 4+ spades (over 1H)
    {
      bid: "1S",
      description: "6+ HCP, 4+ spades — new suit at 1-level",
      conditions: [
        { type: "partner_bid", value: "1H" },
        { type: "hcp_min", min: 6 },
        { type: "suit_length_min", suit: "S", length: 4 },
      ],
    },
    // 1NT response to 1H: 6-10 HCP, no heart fit, no 4+ spade
    {
      bid: "1NT",
      description: "6-10 HCP, no heart fit, no 4-card spade — 1NT response",
      conditions: [
        { type: "partner_bid", value: "1H" },
        { type: "hcp_range", min: 6, max: 10 },
        { type: "fit_with_partner", value: false },
        { type: "no_4card_major" },
      ],
    },
    // 2NT response to 1H: 11-12 HCP, no fit (Hard)
    {
      bid: "2NT",
      description: "11-12 HCP, no heart fit — invitational NT",
      conditions: [
        { type: "partner_bid", value: "1H" },
        { type: "hcp_range", min: 11, max: 12 },
        { type: "fit_with_partner", value: false },
        { type: "no_4card_major" },
      ],
    },
    // 2C over 1H: 10+ HCP, 4+ clubs
    {
      bid: "2C",
      description: "10+ HCP, 4+ clubs — new suit at 2-level",
      conditions: [
        { type: "partner_bid", value: "1H" },
        { type: "hcp_min", min: 10 },
        { type: "suit_length_min", suit: "C", length: 4 },
        { type: "fit_with_partner", value: false },
      ],
    },
    // 2D over 1H: 10+ HCP, 4+ diamonds
    {
      bid: "2D",
      description: "10+ HCP, 4+ diamonds — new suit at 2-level",
      conditions: [
        { type: "partner_bid", value: "1H" },
        { type: "hcp_min", min: 10 },
        { type: "suit_length_min", suit: "D", length: 4 },
        { type: "fit_with_partner", value: false },
      ],
    },

    // ============================================================
    // Responses to 1S
    // ============================================================

    // Jump raise: 13+ HCP, 4+ spade support — limit raise
    {
      bid: "3S",
      description: "13+ HCP, 4+ spade support — limit raise",
      conditions: [
        { type: "partner_bid", value: "1S" },
        { type: "hcp_min", min: 13 },
        { type: "support_count", min: 4 },
      ],
    },
    // Invitational raise: 10-12 HCP, 3 spade support
    {
      bid: "3S",
      description: "10-12 HCP, 3 spade support — invitational raise",
      conditions: [
        { type: "partner_bid", value: "1S" },
        { type: "hcp_range", min: 10, max: 12 },
        { type: "fit_with_partner", value: true },
      ],
    },
    // Simple raise: 6-9 HCP, 3+ spade support
    {
      bid: "2S",
      description: "6-9 HCP, 3+ spade support — simple raise",
      conditions: [
        { type: "partner_bid", value: "1S" },
        { type: "hcp_range", min: 6, max: 9 },
        { type: "fit_with_partner", value: true },
      ],
    },
    // 1NT response to 1S: 6-10 HCP, no spade fit
    {
      bid: "1NT",
      description: "6-10 HCP, no spade fit — 1NT response",
      conditions: [
        { type: "partner_bid", value: "1S" },
        { type: "hcp_range", min: 6, max: 10 },
        { type: "fit_with_partner", value: false },
        { type: "no_5card_major" },
      ],
    },
    // 2NT response to 1S: 11-12 HCP, no fit (Hard)
    {
      bid: "2NT",
      description: "11-12 HCP, no spade fit — invitational NT",
      conditions: [
        { type: "partner_bid", value: "1S" },
        { type: "hcp_range", min: 11, max: 12 },
        { type: "fit_with_partner", value: false },
        { type: "no_5card_major" },
      ],
    },
    // 2H over 1S: 10+ HCP, 5+ hearts
    {
      bid: "2H",
      description: "10+ HCP, 5+ hearts — new suit at 2-level",
      conditions: [
        { type: "partner_bid", value: "1S" },
        { type: "hcp_min", min: 10 },
        { type: "suit_length_min", suit: "H", length: 5 },
        { type: "fit_with_partner", value: false },
      ],
    },
    // 2C over 1S: 10+ HCP, 4+ clubs
    {
      bid: "2C",
      description: "10+ HCP, 4+ clubs — new suit at 2-level",
      conditions: [
        { type: "partner_bid", value: "1S" },
        { type: "hcp_min", min: 10 },
        { type: "suit_length_min", suit: "C", length: 4 },
        { type: "fit_with_partner", value: false },
        { type: "no_5card_major" },
      ],
    },
    // 2D over 1S: 10+ HCP, 4+ diamonds
    {
      bid: "2D",
      description: "10+ HCP, 4+ diamonds — new suit at 2-level",
      conditions: [
        { type: "partner_bid", value: "1S" },
        { type: "hcp_min", min: 10 },
        { type: "suit_length_min", suit: "D", length: 4 },
        { type: "fit_with_partner", value: false },
        { type: "no_5card_major" },
      ],
    },

    // ============================================================
    // Responses to 1H or 1S — catch-all with fit and high HCP
    // ============================================================

    // 3H: 13+ HCP, 3 hearts — game-forcing raise (catch-all for 3-card support)
    {
      bid: "3H",
      description: "13+ HCP, 3 heart support — game-forcing raise",
      conditions: [
        { type: "partner_bid", value: "1H" },
        { type: "hcp_min", min: 13 },
        { type: "fit_with_partner", value: true },
      ],
    },
    // 3S: 13+ HCP, 3 spades — game-forcing raise (catch-all for 3-card support)
    {
      bid: "3S",
      description: "13+ HCP, 3 spade support — game-forcing raise",
      conditions: [
        { type: "partner_bid", value: "1S" },
        { type: "hcp_min", min: 13 },
        { type: "fit_with_partner", value: true },
      ],
    },

    // ============================================================
    // Responses to 1D
    // ============================================================

    // 1H over 1D: 6+ HCP, 4+ hearts
    {
      bid: "1H",
      description: "6+ HCP, 4+ hearts — new major at 1-level",
      conditions: [
        { type: "partner_bid", value: "1D" },
        { type: "hcp_min", min: 6 },
        { type: "suit_length_min", suit: "H", length: 4 },
      ],
    },
    // 1S over 1D: 6+ HCP, 4+ spades
    {
      bid: "1S",
      description: "6+ HCP, 4+ spades — new major at 1-level",
      conditions: [
        { type: "partner_bid", value: "1D" },
        { type: "hcp_min", min: 6 },
        { type: "suit_length_min", suit: "S", length: 4 },
      ],
    },
    // Raise 1D→2D: 6-9 HCP, 4+ diamond support
    {
      bid: "2D",
      description: "6-9 HCP, 4+ diamond support — simple raise",
      conditions: [
        { type: "partner_bid", value: "1D" },
        { type: "hcp_range", min: 6, max: 9 },
        { type: "support_count", min: 4 },
      ],
    },
    // 1NT response to 1D: 6-10 HCP, no 4-card major
    {
      bid: "1NT",
      description: "6-10 HCP, no 4-card major — 1NT response",
      conditions: [
        { type: "partner_bid", value: "1D" },
        { type: "hcp_range", min: 6, max: 10 },
        { type: "no_4card_major" },
      ],
    },
    // 2C over 1D: 10+ HCP, 4+ clubs
    {
      bid: "2C",
      description: "10+ HCP, 4+ clubs — new suit at 2-level",
      conditions: [
        { type: "partner_bid", value: "1D" },
        { type: "hcp_min", min: 10 },
        { type: "suit_length_min", suit: "C", length: 4 },
        { type: "no_4card_major" },
      ],
    },
    // Jump raise 1D→3D: 10-12 HCP, 4+ diamonds
    {
      bid: "3D",
      description: "10-12 HCP, 4+ diamond support — invitational raise",
      conditions: [
        { type: "partner_bid", value: "1D" },
        { type: "hcp_range", min: 10, max: 12 },
        { type: "support_count", min: 4 },
      ],
    },

    // ============================================================
    // Responses to 1C
    // ============================================================

    // 1H over 1C: 6+ HCP, 4+ hearts
    {
      bid: "1H",
      description: "6+ HCP, 4+ hearts — new major at 1-level",
      conditions: [
        { type: "partner_bid", value: "1C" },
        { type: "hcp_min", min: 6 },
        { type: "suit_length_min", suit: "H", length: 4 },
      ],
    },
    // 1S over 1C: 6+ HCP, 4+ spades
    {
      bid: "1S",
      description: "6+ HCP, 4+ spades — new major at 1-level",
      conditions: [
        { type: "partner_bid", value: "1C" },
        { type: "hcp_min", min: 6 },
        { type: "suit_length_min", suit: "S", length: 4 },
      ],
    },
    // 1D over 1C: 6+ HCP, 4+ diamonds (prefer 1D over 1C response)
    {
      bid: "1D",
      description: "6+ HCP, 4+ diamonds — new suit at 1-level",
      conditions: [
        { type: "partner_bid", value: "1C" },
        { type: "hcp_min", min: 6 },
        { type: "suit_length_min", suit: "D", length: 4 },
        { type: "no_4card_major" },
      ],
    },
    // 1NT response to 1C: 6-10 HCP, no 4-card major
    {
      bid: "1NT",
      description: "6-10 HCP, no 4-card major — 1NT response",
      conditions: [
        { type: "partner_bid", value: "1C" },
        { type: "hcp_range", min: 6, max: 10 },
        { type: "no_4card_major" },
      ],
    },
    // Raise 1C→2C: 6-9 HCP, 4+ club support
    {
      bid: "2C",
      description: "6-9 HCP, 4+ club support — simple raise",
      conditions: [
        { type: "partner_bid", value: "1C" },
        { type: "hcp_range", min: 6, max: 9 },
        { type: "support_count", min: 4 },
      ],
    },
    // Jump raise 1C→3C: 10-12 HCP, 4+ clubs
    {
      bid: "3C",
      description: "10-12 HCP, 4+ club support — invitational raise",
      conditions: [
        { type: "partner_bid", value: "1C" },
        { type: "hcp_range", min: 10, max: 12 },
        { type: "support_count", min: 4 },
      ],
    },

    // ============================================================
    // Catch-all Pass: weak hands that can't respond
    // ============================================================
    {
      bid: "Pass",
      description: "Less than 6 HCP, no suitable response",
      conditions: [{ type: "hcp_range", min: 0, max: 37 }],
    },
  ],
};

registerConvention(saycResponses);
