import { describe, it, expect, vi } from "vitest";
import type { BridgeHand, SeatPosition, Vulnerability } from "./bridge";

// We'll re-mock per test via vi.resetModules + vi.mock, so tests are isolated.
// The default mock just resolves immediately.
vi.mock("./scheduler", () => ({
  yieldToMainThread: vi.fn(() => Promise.resolve()),
}));

describe("generateHandForBidding", () => {
  it("returns a valid hand with all required fields", async () => {
    const { generateHandForBidding } = await import("./handGeneration");
    const result = await generateHandForBidding("sayc", "easy", [
      "1C",
      "1D",
      "1H",
      "1S",
      "1NT",
      "Pass",
    ]);

    expect(result).toBeDefined();
    expect(result.hand).toBeDefined();
    expect(result.hand.cards).toBeInstanceOf(Array);
    expect(result.hand.cards.length).toBe(13);
    expect(result.bid).toBeDefined();
    expect(typeof result.bid).toBe("string");
    expect(result.description).toBeDefined();
    expect(typeof result.description).toBe("string");
    expect(result.seat).toBeDefined();
    expect(["1st", "2nd", "3rd", "4th"]).toContain(result.seat);
    expect(result.vuln).toBeDefined();
    expect(["none", "ns", "ew", "both"]).toContain(result.vuln);
  });

  it("yields to the main thread during generation", async () => {
    // Use a maxAttempts high enough to guarantee multiple yield points.
    // Since YIELD_INTERVAL is 10, we need at least 20 attempts to get 2 yields.
    // But hands are random so we may match early — use a very unlikely bid
    // to force many iterations. Or simply use a high maxAttempts and verify
    // at least one call happened.
    const { generateHandForBidding } = await import("./handGeneration");
    const { yieldToMainThread } = await import("./scheduler");

    // Use a bid list that's unlikely to match quickly ("7NT" is not a common
    // opening bid) to force more iterations and thus more yields.
    await generateHandForBidding("sayc", "easy", ["7NT"], 50);

    expect(yieldToMainThread).toHaveBeenCalled();
  });

  it("still returns a valid hand when no iteration matches available bids", async () => {
    const { generateHandForBidding } = await import("./handGeneration");

    // "Z9" is an impossible bid — no iteration will ever match,
    // forcing the fallback path after maxAttempts.
    const result = await generateHandForBidding("sayc", "easy", ["Z9"], 5);

    // Fallback must still return a complete hand object
    expect(result).toBeDefined();
    expect(result.hand.cards.length).toBe(13);
    expect(typeof result.bid).toBe("string");
    expect(typeof result.description).toBe("string");
    expect(["1st", "2nd", "3rd", "4th"]).toContain(result.seat);
    expect(["none", "ns", "ew", "both"]).toContain(result.vuln);
  });
});
