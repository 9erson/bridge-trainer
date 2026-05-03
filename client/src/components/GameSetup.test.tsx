import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import GameSetup from "./GameSetup";
import type { GameConfig } from "@/lib/gameRegistry";

// Radix UI components require ResizeObserver which jsdom doesn't provide
global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

const mockConfig: GameConfig = {
  id: "test-game",
  name: "Test Game",
  description: "A test game",
  icon: "/test-icon.svg",
  difficulties: [
    { id: "easy", label: "Easy", description: "Easy mode" },
    { id: "intermediate", label: "Intermediate", description: "Mid mode" },
  ],
  defaultDifficulty: "easy",
  defaultHandCount: 5,
  defaultTimerSeconds: null,
  defaultFeedbackMode: "immediate",
};

describe("GameSetup", () => {
  it("advanced settings toggle has focus-visible ring for keyboard accessibility", () => {
    const { container } = render(
      <GameSetup config={mockConfig} onStart={() => {}} />
    );

    const buttons = container.querySelectorAll("button");
    const toggleButton = Array.from(buttons).find(btn =>
      btn.textContent?.includes("advanced settings")
    );

    expect(toggleButton).toBeTruthy();
    expect(toggleButton!.className).toContain("focus-visible:ring-2");
    expect(toggleButton!.className).toContain("focus-visible:ring-ring");
    expect(toggleButton!.className).toContain("focus-visible:ring-offset-2");
  });
});
