import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import GameShell from "./GameShell";
import type { GameSettings } from "@/lib/gameRegistry";

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
