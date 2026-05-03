import { describe, expect, it } from "vitest";
import { SUIT_COLORS } from "./bridge";

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
