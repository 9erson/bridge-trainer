import { describe, it, expect, vi } from "vitest";
import type { ComponentType } from "react";
import type { GameSettings, GameResults } from "./gameRegistry";

// We import everything fresh per test file to test the registry in isolation.
// The module-level Map is shared, so we test the contract of register/get/getAll.

describe("gameRegistry", () => {
  // Helper to create a minimal valid GameModule
  function makeGame(id: string, name: string) {
    return {
      config: {
        id,
        name,
        description: `Test game ${name}`,
        icon: "/test.png",
        difficulties: [],
        defaultHandCount: 5,
        defaultTimerSeconds: null,
        defaultDifficulty: "easy",
        defaultFeedbackMode: "immediate" as const,
      },
      SetupComponent: vi.fn() as unknown as ComponentType<{
        onStart: (_settings: GameSettings) => void;
      }>,
      PlayComponent: vi.fn() as unknown as ComponentType<{
        settings: GameSettings;
        onComplete: (_results: GameResults) => void;
        onQuit: () => void;
      }>,
      ResultsComponent: vi.fn() as unknown as ComponentType<{
        results: GameResults;
        onPlayAgain: () => void;
        onBackToMenu: () => void;
      }>,
    };
  }

  it("returns registered games from getAllGames", async () => {
    // Dynamic import to get a fresh reference to the registry module
    const { registerGame, getAllGames } = await import("./gameRegistry");
    const game = makeGame("test-reg", "Test Registration");
    registerGame(game);

    const all = getAllGames();
    const found = all.find(g => g.config.id === "test-reg");
    expect(found).toBeDefined();
    expect(found?.config.name).toBe("Test Registration");
  });

  it("returns undefined for unregistered game from getGame", async () => {
    const { getGame } = await import("./gameRegistry");
    expect(getGame("nonexistent-game-id")).toBeUndefined();
  });

  it("returns a new array each call (does not cache)", async () => {
    const { getAllGames } = await import("./gameRegistry");
    const first = getAllGames();
    const second = getAllGames();
    // Different array instances — this documents the current behavior
    // and is exactly why we should hoist the call in consumers
    expect(first).not.toBe(second);
    // But same contents
    expect(first).toEqual(second);
  });
});
