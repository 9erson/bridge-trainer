import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { render, fireEvent } from "@testing-library/react";
import OpeningBidResults from "./OpeningBidResults";
import type { GameResults } from "@/lib/gameRegistry";

// Read source file for static class analysis (matches History.test.tsx pattern)
const source = readFileSync(
  resolve(import.meta.dirname, "OpeningBidResults.tsx"),
  "utf-8"
);

function makeResults(overrides?: Partial<GameResults>): GameResults {
  return {
    sessionId: "test-session",
    gameId: "openingBid",
    settings: {
      gameId: "openingBid",
      difficulty: "intermediate",
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
        userAnswer: "__timeout__",
        correctAnswer: "1S",
        isCorrect: false,
        timeTaken: 10000,
        explanation: "With 12+ HCP and 5+ spades, open 1S.",
      },
    ],
    totalCorrect: 0,
    totalHands: 2,
    accuracy: 0,
    totalTime: 10000,
    averageTime: 10000,
    extraData: {},
    ...overrides,
  };
}

describe("OpeningBidResults", () => {
  it("uses var(--muted-foreground) for timeout answer color instead of hard-coded #888", async () => {
    const results = makeResults();
    const { container } = render(
      <OpeningBidResults
        results={results}
        onPlayAgain={() => {}}
        onBackToMenu={() => {}}
      />
    );

    // Expand the "Review Mistakes" section
    const toggle = container.querySelector("button");
    if (toggle) {
      fireEvent.click(toggle);
    }

    // Find the span with inline style color for the timeout answer
    const timeoutSpan = Array.from(container.querySelectorAll("span")).find(
      span => span.textContent?.includes("Time's up")
    );

    expect(timeoutSpan).toBeTruthy();
    // Check the raw style attribute value (jsdom resolves CSS vars in .style.color)
    const styleAttr = timeoutSpan!.getAttribute("style");
    expect(styleAttr).toContain("var(--muted-foreground)");
    expect(styleAttr).not.toContain("#888");
  });

  it("Review Mistakes toggle has focus-visible ring for keyboard accessibility", () => {
    const results = makeResults();
    const { container } = render(
      <OpeningBidResults
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

describe("OpeningBidResults — theme tokens (#32)", () => {
  it("correct answer display uses text-primary, not hard-coded text-emerald-600", () => {
    expect(source).not.toContain("text-emerald-600");
    expect(source).toContain("text-primary");
  });
});
