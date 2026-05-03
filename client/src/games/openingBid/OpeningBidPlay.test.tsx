import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import OpeningBidPlay from "./OpeningBidPlay";
import type { GameSettings } from "@/lib/gameRegistry";

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
