import { describe, it, expect } from "vitest";
import { wcagContrast, type OklchColor } from "culori";
import fs from "node:fs";
import path from "node:path";

/**
 * WCAG 1.4.3 AA requires a minimum contrast ratio of 4.5:1 for normal text
 * and 3:1 for large text against the background.
 *
 * These tests verify that the planned dark-mode palette (from .impeccable.md)
 * meets WCAG AA before any CSS is written.
 *
 * Uses `culori` for color space math — same library as light-mode contrast tests.
 */

// --- Dark palette tokens (from .impeccable.md Color Direction) ---

const DARK_BG: OklchColor = { mode: "oklch", l: 0.15, c: 0.03, h: 165 };
const DARK_FG: OklchColor = { mode: "oklch", l: 0.92, c: 0.01, h: 90 };
const DARK_CARD: OklchColor = { mode: "oklch", l: 0.19, c: 0.03, h: 165 };
const DARK_MUTED_FG: OklchColor = { mode: "oklch", l: 0.65, c: 0.02, h: 165 };
const DARK_MUTED_BG: OklchColor = { mode: "oklch", l: 0.2, c: 0.02, h: 165 };
const DARK_PRIMARY: OklchColor = { mode: "oklch", l: 0.5, c: 0.1, h: 165 };
const DARK_PRIMARY_FG: OklchColor = { mode: "oklch", l: 0.99, c: 0.005, h: 90 };
const DARK_SIDEBAR: OklchColor = { mode: "oklch", l: 0.13, c: 0.03, h: 165 };
const DARK_SIDEBAR_FG: OklchColor = { mode: "oklch", l: 0.92, c: 0.01, h: 90 };

const WCAG_AA_NORMAL_MIN = 4.5;

describe("Dark theme contrast: foreground vs background", () => {
  it("foreground meets WCAG AA against background", () => {
    const ratio = wcagContrast(DARK_FG, DARK_BG);
    expect(ratio).toBeGreaterThanOrEqual(WCAG_AA_NORMAL_MIN);
  });

  it("foreground meets WCAG AA against card", () => {
    const ratio = wcagContrast(DARK_FG, DARK_CARD);
    expect(ratio).toBeGreaterThanOrEqual(WCAG_AA_NORMAL_MIN);
  });

  it("muted-foreground meets WCAG AA against background", () => {
    const ratio = wcagContrast(DARK_MUTED_FG, DARK_BG);
    expect(ratio).toBeGreaterThanOrEqual(WCAG_AA_NORMAL_MIN);
  });

  it("muted-foreground meets WCAG AA against card", () => {
    const ratio = wcagContrast(DARK_MUTED_FG, DARK_CARD);
    expect(ratio).toBeGreaterThanOrEqual(WCAG_AA_NORMAL_MIN);
  });

  it("muted-foreground meets WCAG AA against muted surface", () => {
    const ratio = wcagContrast(DARK_MUTED_FG, DARK_MUTED_BG);
    expect(ratio).toBeGreaterThanOrEqual(WCAG_AA_NORMAL_MIN);
  });

  it("primary-foreground meets WCAG AA against primary", () => {
    const ratio = wcagContrast(DARK_PRIMARY_FG, DARK_PRIMARY);
    expect(ratio).toBeGreaterThanOrEqual(WCAG_AA_NORMAL_MIN);
  });

  it("sidebar-foreground meets WCAG AA against sidebar", () => {
    const ratio = wcagContrast(DARK_SIDEBAR_FG, DARK_SIDEBAR);
    expect(ratio).toBeGreaterThanOrEqual(WCAG_AA_NORMAL_MIN);
  });
});

describe("Dark theme CSS: .dark selector block exists", () => {
  it("index.css contains a .dark selector with variable overrides", () => {
    const css = fs.readFileSync(
      path.resolve(import.meta.dirname, "../index.css"),
      "utf-8"
    );
    expect(css).toContain(".dark {");
    // At minimum, the dark block must override background and foreground
    expect(css).toMatch(/\.dark\s*\{[^}]*--background/);
    expect(css).toMatch(/\.dark\s*\{[^}]*--foreground/);
  });
});
