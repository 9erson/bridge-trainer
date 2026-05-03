import { describe, expect, it } from "vitest";
import { formatBid } from "./conventions";

describe("formatBid", () => {
  it("returns CSS variable for Pass bids", () => {
    const result = formatBid("Pass");
    expect(result.text).toBe("Pass");
    expect(result.color).toBe("var(--bid-pass)");
  });

  it("returns CSS variable for NT bids", () => {
    const result = formatBid("1NT");
    expect(result.text).toBe("1NT");
    expect(result.color).toBe("var(--suit-black)");
  });

  it("returns red suit variable for heart bids", () => {
    const result = formatBid("1H");
    expect(result.color).toBe("var(--suit-red)");
  });

  it("returns red suit variable for diamond bids", () => {
    const result = formatBid("2D");
    expect(result.color).toBe("var(--suit-red)");
  });

  it("returns black suit variable for spade bids", () => {
    const result = formatBid("1S");
    expect(result.color).toBe("var(--suit-black)");
  });

  it("returns black suit variable for club bids", () => {
    const result = formatBid("3C");
    expect(result.color).toBe("var(--suit-black)");
  });

  it("never returns raw hex color values", () => {
    const bids = ["Pass", "1NT", "1S", "1H", "1D", "1C", "2NT", "3S"];
    for (const bid of bids) {
      expect(formatBid(bid).color).not.toMatch(/^#/);
    }
  });
});
