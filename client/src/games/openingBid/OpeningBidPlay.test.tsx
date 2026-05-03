import { describe, it, expect, vi } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { render, screen } from "@testing-library/react";
import OpeningBidPlay from "./OpeningBidPlay";
import type { GameSettings } from "@/lib/gameRegistry";

// Read source file for static class analysis (matches History.test.tsx pattern)
const source = readFileSync(
  resolve(import.meta.dirname, "OpeningBidPlay.tsx"),
  "utf-8"
);

// Mock ResizeObserver — required by Radix/UI components in jsdom
global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock framer-motion — avoid animation complexity in tests
vi.mock("framer-motion", () => ({
  motion: {
    div: ({
      children,
      ...props
    }: {
      children: React.ReactNode;
      [key: string]: unknown;
    }) => <div data-testid="motion-div">{children}</div>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

// Mock nanoid to return deterministic IDs
vi.mock("nanoid", () => ({ nanoid: () => "test-nanoid" }));

// Mock IndexedDB — avoid actual database access
vi.mock("@/lib/db", () => ({
  saveSession: () => Promise.resolve(),
  saveHandResult: () => Promise.resolve(),
}));

// Mock GameShell — it has internal timer/keyboard logic
vi.mock("@/components/GameShell", () => ({
  default: ({
    children,
  }: {
    children: React.ReactNode;
    [key: string]: unknown;
  }) => <div data-testid="game-shell">{children}</div>,
}));

function makeSettings(
  overrides?: Partial<GameSettings["extra"]>
): GameSettings {
  return {
    gameId: "opening-bid",
    difficulty: "easy",
    handCount: 5,
    timerSeconds: null,
    feedbackMode: "immediate",
    displayMode: "text",
    extra: { conventionId: "sayc", ...overrides },
  };
}

describe("OpeningBidPlay — touch targets (WCAG 2.5.8)", () => {
  it("bid buttons have h-11 (44px) height to meet WCAG minimum touch target", () => {
    const settings = makeSettings();
    render(
      <OpeningBidPlay
        settings={settings}
        onComplete={() => {}}
        onQuit={() => {}}
      />
    );

    // Find bid buttons — they contain formatted bid text (1♣, 1♦, etc.)
    const bidButtons = screen.getAllByRole("button").filter(btn =>
      // Bid buttons have the h- class for height and min-w-[3.5rem]
      btn.className.includes("min-w-[3.5rem]")
    );

    // There should be bid buttons visible (Pass + at least level-1 bids for easy)
    expect(bidButtons.length).toBeGreaterThan(0);

    // WCAG 2.5.8: every bid button must have h-11 (44px) touch target
    bidButtons.forEach(btn => {
      expect(
        btn.className.includes("h-11"),
        `Button "${btn.textContent}" has class "${btn.className}" which is missing h-11`
      ).toBe(true);
    });
  });
});

describe("OpeningBidPlay — feedback badge theme tokens (#32)", () => {
  it("correct feedback badge uses primary theme tokens, not hard-coded emerald", () => {
    // The correct badge should use bg-primary/10 text-primary border-primary/30
    // instead of bg-emerald-50 text-emerald-700 border-emerald-200
    expect(source).not.toContain("bg-emerald-50");
    expect(source).not.toContain("text-emerald-700");
    expect(source).not.toContain("border-emerald-200");

    // Verify theme tokens are used instead
    expect(source).toContain("bg-primary/10");
    expect(source).toContain("text-primary");
    expect(source).toContain("border-primary/30");
  });

  it("incorrect feedback badge uses destructive theme tokens, not hard-coded red", () => {
    // The incorrect badge should use bg-destructive/10 text-destructive border-destructive/30
    // instead of bg-red-50 text-red-700 border-red-200
    expect(source).not.toContain("bg-red-50");
    expect(source).not.toContain("text-red-700");
    expect(source).not.toContain("border-red-200");

    // Verify theme tokens are used instead
    expect(source).toContain("bg-destructive/10");
    expect(source).toContain("text-destructive");
    expect(source).toContain("border-destructive/30");
  });
});
