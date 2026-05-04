import { describe, expect, it } from "vitest";
import {
  SUIT_COLORS,
  calculateDummyPoints,
  generateSupportPointChoices,
  generateRandomTrumpSuit,
  SUITS,
  type BridgeHand,
} from "./bridge";

describe("SUIT_COLORS", () => {
  it("returns CSS variable references instead of raw hex values", () => {
    expect(SUIT_COLORS.S).toBe("var(--suit-black)");
    expect(SUIT_COLORS.H).toBe("var(--suit-red)");
    expect(SUIT_COLORS.D).toBe("var(--suit-red)");
    expect(SUIT_COLORS.C).toBe("var(--suit-black)");
  });

  it("covers all four suits", () => {
    const keys = Object.keys(SUIT_COLORS).sort();
    expect(keys).toEqual(["C", "D", "H", "S"]);
  });

  it("contains no raw hex values", () => {
    const values = Object.values(SUIT_COLORS);
    for (const v of values) {
      expect(v).not.toMatch(/^#/);
    }
  });
});

describe("calculateDummyPoints", () => {
  // Helper to build a hand with an exact suit distribution
  function makeHand(
    dist: Record<string, number>,
    ranks = ["A", "K", "Q", "J", "T", "9", "8", "7", "6", "5", "4", "3", "2"]
  ): BridgeHand {
    const cards: { suit: "S" | "H" | "D" | "C"; rank: string }[] = [];
    let ri = 0;
    for (const [suit, count] of Object.entries(dist)) {
      for (let i = 0; i < count; i++) {
        cards.push({ suit: suit as "S" | "H" | "D" | "C", rank: ranks[ri++] });
      }
    }
    return { cards };
  }

  it("returns 0 for a flat 4-3-3-3 hand with no trump suit", () => {
    const hand = makeHand({ S: 4, H: 3, D: 3, C: 3 });
    expect(calculateDummyPoints(hand)).toBe(0);
  });

  it("awards 5 points for a void in a non-trump suit", () => {
    // 5-5-3-0 with hearts as trump: void in clubs = 5 points
    const hand = makeHand({ S: 5, H: 5, D: 3, C: 0 });
    expect(calculateDummyPoints(hand, "H")).toBe(5);
  });

  it("awards 3 points for a singleton in a non-trump suit", () => {
    // 5-4-3-1 with spades as trump: singleton clubs = 3 points
    const hand = makeHand({ S: 5, H: 4, D: 3, C: 1 });
    expect(calculateDummyPoints(hand, "S")).toBe(3);
  });

  it("awards 1 point per doubleton in non-trump suits", () => {
    // 5-4-2-2 with spades as trump: two doubletons in D and C = 2 points
    const hand = makeHand({ S: 5, H: 4, D: 2, C: 2 });
    expect(calculateDummyPoints(hand, "S")).toBe(2);
  });

  it("sums multiple singletons across non-trump suits", () => {
    // 6-5-1-1 with spades as trump: singleton H + singleton D = 6 points
    const hand = makeHand({ S: 6, H: 1, D: 1, C: 5 });
    expect(calculateDummyPoints(hand, "S")).toBe(6);
  });

  it("sums multiple voids across non-trump suits", () => {
    // 7-6-0-0 with spades as trump: void H + void D = 10 points
    const hand = makeHand({ S: 7, H: 0, D: 6, C: 0 });
    expect(calculateDummyPoints(hand, "S")).toBe(10);
  });

  it("counts shortness in all suits when no trump suit is specified", () => {
    // 5-4-2-2 no trump: two doubletons across all four suits = 2 points
    const hand = makeHand({ S: 5, H: 4, D: 2, C: 2 });
    expect(calculateDummyPoints(hand)).toBe(2);
  });

  it("excludes trump suit from shortness count", () => {
    // 0-5-4-4 with spades as trump: void in spades (trump) = 0 points
    const hand = makeHand({ S: 0, H: 5, D: 4, C: 4 });
    expect(calculateDummyPoints(hand, "S")).toBe(0);
  });

  it("sums mixed shortness across non-trump suits", () => {
    // 0-1-7-5 with diamonds as trump: void in S (5) + singleton in H (3) = 8
    const hand = makeHand({ S: 0, H: 1, D: 7, C: 5 });
    expect(calculateDummyPoints(hand, "D")).toBe(8);
  });
});

describe("generateSupportPointChoices", () => {
  it("returns 5 unique sorted choices that include the correct answer", () => {
    const choices = generateSupportPointChoices(4);
    expect(choices).toHaveLength(5);
    expect(new Set(choices).size).toBe(5);
    expect(choices).toEqual([...choices].sort((a, b) => a - b));
    expect(choices).toContain(4);
  });

  it("keeps all choices within 0–10 range", () => {
    for (let correct = 0; correct <= 10; correct++) {
      const choices = generateSupportPointChoices(correct);
      for (const c of choices) {
        expect(c).toBeGreaterThanOrEqual(0);
        expect(c).toBeLessThanOrEqual(10);
      }
    }
  });

  it("never produces negative choices when correct answer is 0", () => {
    const choices = generateSupportPointChoices(0);
    expect(choices.every(c => c >= 0)).toBe(true);
    expect(choices).toContain(0);
  });

  it("never exceeds 10 when correct answer is 10", () => {
    const choices = generateSupportPointChoices(10);
    expect(choices.every(c => c <= 10)).toBe(true);
    expect(choices).toContain(10);
  });
});

describe("generateRandomTrumpSuit", () => {
  it("returns a valid suit", () => {
    for (let i = 0; i < 20; i++) {
      const suit = generateRandomTrumpSuit();
      expect(SUITS).toContain(suit);
    }
  });
});
