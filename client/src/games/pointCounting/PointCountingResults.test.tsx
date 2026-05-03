import { describe, it, expect } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import PointCountingResults from "./PointCountingResults";
import type { GameResults } from "@/lib/gameRegistry";

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
