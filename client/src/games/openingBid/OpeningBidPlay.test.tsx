import { describe, it, expect, vi } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { render, screen, waitFor } from "@testing-library/react";
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

// Mock the async hand generation module
vi.mock("@/lib/handGeneration", () => ({
  generateHandForBidding: vi.fn(() =>
    Promise.resolve({
      hand: {
        cards: [
          { suit: "S", rank: "A" },
          { suit: "S", rank: "K" },
          { suit: "S", rank: "Q" },
          { suit: "S", rank: "J" },
          { suit: "S", rank: "T" },
          { suit: "H", rank: "9" },
          { suit: "H", rank: "8" },
          { suit: "H", rank: "7" },
          { suit: "D", rank: "6" },
          { suit: "D", rank: "5" },
          { suit: "D", rank: "4" },
          { suit: "C", rank: "3" },
          { suit: "C", rank: "2" },
        ],
      },
      bid: "1NT",
      description: "15-17 HCP, balanced hand",
      seat: "1st" as const,
      vuln: "none" as const,
    })
  ),
}));

// Mock the scheduler so we don't actually yield in tests
vi.mock("@/lib/scheduler", () => ({
  yieldToMainThread: () => Promise.resolve(),
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
  it("bid buttons have h-11 (44px) height to meet WCAG minimum touch target", async () => {
    const settings = makeSettings();
    render(
      <OpeningBidPlay
        settings={settings}
        onComplete={() => {}}
        onQuit={() => {}}
      />
    );

    // Wait for async hand generation to complete and bid buttons to appear
    await waitFor(() => {
      const bidButtons = screen
        .getAllByRole("button")
        .filter(btn => btn.className.includes("min-w-[3.5rem]"));
      expect(bidButtons.length).toBeGreaterThan(0);
    });

    const bidButtons = screen
      .getAllByRole("button")
      .filter(btn => btn.className.includes("min-w-[3.5rem]"));

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

describe("OpeningBidPlay — async hand generation (#40)", () => {
  it("uses the extracted async generateHandForBidding from handGeneration module", async () => {
    const settings = makeSettings();
    render(
      <OpeningBidPlay
        settings={settings}
        onComplete={() => {}}
        onQuit={() => {}}
      />
    );

    // The component should import and call generateHandForBidding
    // from @/lib/handGeneration rather than using an inline function
    const { generateHandForBidding } = await import("@/lib/handGeneration");
    await waitFor(() => {
      expect(generateHandForBidding).toHaveBeenCalled();
    });
  });

  it("renders bid buttons after async hand loads", async () => {
    const settings = makeSettings();
    render(
      <OpeningBidPlay
        settings={settings}
        onComplete={() => {}}
        onQuit={() => {}}
      />
    );

    // After the async hand generation resolves, bid buttons should appear
    await waitFor(() => {
      const bidButtons = screen
        .getAllByRole("button")
        .filter(btn => btn.className.includes("min-w-[3.5rem]"));
      expect(bidButtons.length).toBeGreaterThan(0);
    });
  });

  it("source no longer contains inline generateHandForBidding function", () => {
    // The old synchronous inline function should be removed
    // (it's now imported from @/lib/handGeneration)
    expect(source).not.toContain("function generateHandForBidding(");
  });
});

describe("OpeningBidPlay — sequenceBuffer extraction (#21)", () => {
  it("imports SequenceIndicator component instead of inline JSX", () => {
    expect(source).toContain("SequenceIndicator");
    expect(source).toContain(
      'import SequenceIndicator from "@/components/SequenceIndicator"'
    );
  });

  it("no longer has sequenceBuffer useState", () => {
    expect(source).not.toContain('useState("")');
    // The old sequenceBuffer state declaration should be gone
    expect(source).not.toContain("sequenceBuffer, setSequenceBuffer");
  });

  it("no longer has sequenceTimeout ref", () => {
    expect(source).not.toContain("sequenceTimeout");
  });

  it("no longer has inline sequence indicator JSX", () => {
    // The old inline {sequenceBuffer && (...)} block should be removed
    expect(source).not.toContain("type C/D/H/S/N");
  });

  it("no longer handles digit/strain keys in the keyboard effect", () => {
    // The digit regex for starting sequences should only exist in SequenceIndicator now
    expect(source).not.toContain("/^[1-7]$/");
    expect(source).not.toContain("/^[cdhsn]$/");
  });
});
