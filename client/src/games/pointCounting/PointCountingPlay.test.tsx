import { describe, it, expect, vi } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { render, screen } from "@testing-library/react";

// Read source file for static class analysis (matches History.test.tsx pattern)
const source = readFileSync(
  resolve(import.meta.dirname, "PointCountingPlay.tsx"),
  "utf-8"
);

// Mock framer-motion to avoid animation complexity in tests
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

// Mock IndexedDB operations
vi.mock("@/lib/db", () => ({
  saveSession: () => Promise.resolve(),
  saveHandResult: () => Promise.resolve(),
}));

// Mock nanoid for deterministic IDs
vi.mock("nanoid", () => ({
  nanoid: () => "test-id",
}));

import type { GameSettings } from "@/lib/gameRegistry";

const hardModeSettings: GameSettings = {
  gameId: "point-counting",
  difficulty: "hard",
  handCount: 5,
  timerSeconds: null,
  feedbackMode: "immediate",
  displayMode: "text",
  extra: {},
};

describe("PointCountingPlay", () => {
  it("HCP input has accessible label for screen readers", async () => {
    const { default: PointCountingPlay } = await import(
      "@/games/pointCounting/PointCountingPlay"
    );
    render(
      <PointCountingPlay
        settings={hardModeSettings}
        onComplete={() => {}}
        onQuit={() => {}}
      />
    );

    // The number input must have an accessible name (aria-label or associated label)
    const input = document.querySelector<HTMLInputElement>(
      'input[type="number"]'
    );
    expect(input).not.toBeNull();

    // Screen readers need an accessible name — either aria-label or a <label>
    const ariaLabel = input!.getAttribute("aria-label");
    const ariaLabelledBy = input!.getAttribute("aria-labelledby");
    const id = input!.id;
    const hasAssociatedLabel =
      id && document.querySelector(`label[for="${id}"]`) !== null;

    const hasAccessibleName =
      (ariaLabel !== null && ariaLabel.length > 0) ||
      (ariaLabelledBy !== null && ariaLabelledBy.length > 0) ||
      hasAssociatedLabel;

    expect(hasAccessibleName).toBe(true);
  });
});

describe("PointCountingPlay — feedback badge theme tokens (#32)", () => {
  it("correct feedback badge uses primary theme tokens, not hard-coded emerald", () => {
    expect(source).not.toContain("bg-emerald-50");
    expect(source).not.toContain("text-emerald-700");
    expect(source).not.toContain("border-emerald-200");
    expect(source).toContain("bg-primary/10");
    expect(source).toContain("text-primary");
    expect(source).toContain("border-primary/30");
  });

  it("incorrect feedback badge uses destructive theme tokens, not hard-coded red", () => {
    expect(source).not.toContain("bg-red-50");
    expect(source).not.toContain("text-red-700");
    expect(source).not.toContain("border-red-200");
    expect(source).toContain("bg-destructive/10");
    expect(source).toContain("text-destructive");
    expect(source).toContain("border-destructive/30");
  });
});
