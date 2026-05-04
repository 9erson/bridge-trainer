import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { render, fireEvent, screen } from "@testing-library/react";
import PointCountingResults from "./PointCountingResults";
import type { GameResults } from "@/lib/gameRegistry";

// Read source file for static class analysis (matches History.test.tsx pattern)
const source = readFileSync(
  resolve(import.meta.dirname, "PointCountingResults.tsx"),
  "utf-8"
);

// Radix UI components require ResizeObserver which jsdom doesn't provide
global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

function makeResults(overrides?: Partial<GameResults>): GameResults {
  return {
    sessionId: "test-session",
    gameId: "pointCounting",
    settings: {
      gameId: "pointCounting",
      difficulty: "easy",
      handCount: 2,
      timerSeconds: null,
      feedbackMode: "immediate",
      displayMode: "text",
      extra: {},
    },
    hands: [
      {
        handIndex: 0,
        handData: { cards: [{ suit: "S", rank: "A" }] },
        userAnswer: "15",
        correctAnswer: "12",
        isCorrect: false,
        timeTaken: 5000,
      },
    ],
    totalCorrect: 0,
    totalHands: 2,
    accuracy: 0,
    totalTime: 5000,
    averageTime: 5000,
    extraData: { averageHCP: 12 },
    ...overrides,
  };
}

describe("PointCountingResults", () => {
  it("Review Mistakes toggle has focus-visible ring for keyboard accessibility", () => {
    const results = makeResults();
    const { container } = render(
      <PointCountingResults
        results={results}
        onPlayAgain={() => {}}
        onBackToMenu={() => {}}
      />
    );

    const toggleButton = Array.from(container.querySelectorAll("button")).find(
      btn => btn.textContent?.includes("Review Mistakes")
    );

    expect(toggleButton).toBeTruthy();
    expect(toggleButton!.className).toContain("focus-visible:ring-2");
    expect(toggleButton!.className).toContain("focus-visible:ring-ring");
    expect(toggleButton!.className).toContain("focus-visible:ring-offset-2");
  });
});

describe("PointCountingResults — theme tokens (#32)", () => {
  it("correct answer display uses text-primary, not hard-coded text-emerald-600", () => {
    expect(source).not.toContain("text-emerald-600");
    expect(source).toContain("text-primary");
  });
});

describe("PointCountingResults — responsive layout (#38)", () => {
  it("stats grid uses responsive gap for narrow viewports", () => {
    // Fixed gap-4 (16px) cramps the 3-column stats grid at 320px viewport.
    // gap-2 sm:gap-4 uses tighter 8px gap on mobile, standard 16px on desktop.
    expect(source).toContain("gap-2 sm:gap-4");
    expect(source).not.toMatch(/grid-cols-3 gap-4(?! )/);
  });
});

// ============================================================
// Support Points mode tests (#56)
// ============================================================

describe("PointCountingResults — support points mode (#56)", () => {
  it("shows 'Avg SP' label when mode is support", () => {
    const results = makeResults({
      settings: {
        gameId: "point-counting",
        difficulty: "easy",
        handCount: 2,
        timerSeconds: null,
        feedbackMode: "immediate",
        displayMode: "text",
        extra: { mode: "support" },
      },
      extraData: { averageHCP: 4.5 },
    });
    render(
      <PointCountingResults
        results={results}
        onPlayAgain={() => {}}
        onBackToMenu={() => {}}
      />
    );

    expect(screen.getByText("Avg SP")).toBeTruthy();
    expect(screen.queryByText("Avg HCP")).toBeNull();
  });

  it("shows 'Avg HCP' label when mode is hcp (default)", () => {
    const results = makeResults({
      extraData: { averageHCP: 12 },
    });
    render(
      <PointCountingResults
        results={results}
        onPlayAgain={() => {}}
        onBackToMenu={() => {}}
      />
    );

    expect(screen.getByText("Avg HCP")).toBeTruthy();
    expect(screen.queryByText("Avg SP")).toBeNull();
  });

  it("shows 'Avg HCP' label when mode is undefined (backward compat)", () => {
    const results = makeResults({
      settings: {
        gameId: "point-counting",
        difficulty: "easy",
        handCount: 2,
        timerSeconds: null,
        feedbackMode: "immediate",
        displayMode: "text",
        extra: {},
      },
      extraData: { averageHCP: 12 },
    });
    render(
      <PointCountingResults
        results={results}
        onPlayAgain={() => {}}
        onBackToMenu={() => {}}
      />
    );

    expect(screen.getByText("Avg HCP")).toBeTruthy();
  });
});
