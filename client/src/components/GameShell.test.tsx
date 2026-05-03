import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { render } from "@testing-library/react";
import GameShell from "./GameShell";
import type { GameSettings } from "@/lib/gameRegistry";

// Read source file for static class analysis
const source = readFileSync(
  resolve(import.meta.dirname, "GameShell.tsx"),
  "utf-8"
);

// Radix UI components require ResizeObserver which jsdom doesn't provide
global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

const baseSettings: GameSettings = {
  gameId: "test-game",
  difficulty: "easy",
  handCount: 10,
  timerSeconds: null,
  feedbackMode: "immediate",
  displayMode: "text",
  extra: {},
};

function renderGameShell(
  currentHand: number,
  totalHands: number,
  settings: Partial<GameSettings> = {}
) {
  return render(
    <GameShell
      settings={{ ...baseSettings, ...settings }}
      currentHand={currentHand}
      totalHands={totalHands}
      onQuit={() => {}}
      onTimeUp={() => {}}
      timerKey={0}
      isTimerRunning={false}
    >
      <div>Game content</div>
    </GameShell>
  );
}

describe("GameShell", () => {
  it("progress bar has aria-label describing its purpose", () => {
    const { container } = renderGameShell(3, 10);

    const progress = container.querySelector("[role='progressbar']");
    expect(progress).toBeTruthy();
    expect(progress!.getAttribute("aria-label")).toBe(
      "Practice session progress"
    );
  });

  it("progress bar has aria-valuetext with hand count format", () => {
    const { container } = renderGameShell(3, 10);

    const progress = container.querySelector("[role='progressbar']");
    expect(progress).toBeTruthy();
    expect(progress!.getAttribute("aria-valuetext")).toBe("Hand 3 of 10");
  });

  it("aria-valuetext is correct on the first hand", () => {
    const { container } = renderGameShell(1, 5);

    const progress = container.querySelector("[role='progressbar']");
    expect(progress).toBeTruthy();
    expect(progress!.getAttribute("aria-valuetext")).toBe("Hand 1 of 5");
  });

  it("aria-valuetext is correct on the last hand", () => {
    const { container } = renderGameShell(10, 10);

    const progress = container.querySelector("[role='progressbar']");
    expect(progress).toBeTruthy();
    expect(progress!.getAttribute("aria-valuetext")).toBe("Hand 10 of 10");
  });
});

describe("GameShell — responsive layout (#38)", () => {
  it("progress bar uses flex-1 instead of fixed w-32 for responsive width", () => {
    // Fixed w-32 (128px) causes overflow on narrow viewports (≤320px)
    // when combined with hand counter, gap, and quit button.
    // The left group needs flex-1 min-w-0 to fill available space,
    // and the progress bar uses w-auto flex-1 to shrink fluidly
    // (w-auto overrides Radix Progress default w-full so flex-1 takes effect).
    expect(source).not.toContain("w-32");
    expect(source).toContain("w-auto flex-1");
    // The parent flex group must also be flexible
    expect(source).toContain("gap-3 flex-1 min-w-0");
  });
});
