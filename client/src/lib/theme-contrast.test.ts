import { describe, it, expect } from "vitest";
import { wcagContrast, type OklchColor } from "culori";

/**
 * WCAG 1.4.3 AA requires a minimum contrast ratio of 4.5:1 for normal text
 * and 3:1 for large text against the background.
 *
 * These tests verify that the --muted-foreground CSS variable meets
 * the 4.5:1 threshold against every background-like surface token.
 *
 * Uses `culori` for color space math — battle-tested, matches browser output.
 */

// --- Theme tokens (single source of truth from index.css) ---

const MUTED_FG: OklchColor = { mode: "oklch", l: 0.5, c: 0.02, h: 60 };

const BACKGROUND_SURFACES: Record<string, OklchColor> = {
  "--background": { mode: "oklch", l: 0.97, c: 0.008, h: 90 },
  "--card": { mode: "oklch", l: 0.99, c: 0.005, h: 90 },
  "--popover": { mode: "oklch", l: 0.99, c: 0.005, h: 90 },
  "--secondary": { mode: "oklch", l: 0.94, c: 0.01, h: 90 },
  "--muted": { mode: "oklch", l: 0.93, c: 0.008, h: 90 },
  "--accent": { mode: "oklch", l: 0.94, c: 0.015, h: 165 },
};

const WCAG_AA_NORMAL_MIN = 4.5;

describe("Theme contrast: --muted-foreground", () => {
  it.each(Object.entries(BACKGROUND_SURFACES))(
    "meets WCAG AA 4.5:1 against %s",
    (token, bg) => {
      const ratio = wcagContrast(MUTED_FG, bg);
      expect(ratio).toBeGreaterThanOrEqual(WCAG_AA_NORMAL_MIN);
    },
  );
});
