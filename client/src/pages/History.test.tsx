import { describe, it, expect, vi, beforeAll } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { render, screen, waitFor } from "@testing-library/react";
import { Route, Switch } from "wouter";

// We need to render SessionRow to test the delete button's aria-label.
// Mock the db module so History doesn't try to open IndexedDB.
const mockSession = {
  id: "test-session-1",
  gameType: "point-counting",
  startedAt: Date.now(),
  completedAt: Date.now(),
  isComplete: true,
  settings: "{}",
  totalHands: 5,
  correctCount: 4,
  totalTime: 25000,
  averageTime: 5000,
  accuracy: 0.8,
  extraData: "{}",
};

vi.mock("@/lib/db", () => ({
  getAllSessions: () => Promise.resolve([mockSession]),
  getCompletedSessionStats: () =>
    Promise.resolve({
      totalSessions: 1,
      avgAccuracy: 0.8,
      avgTime: 5000,
      bestAccuracy: 0.8,
      recentTrend: [],
    }),
  deleteSession: () => Promise.resolve(),
}));

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

// Mock recharts — it requires non-zero container dimensions jsdom doesn't provide.
vi.mock("recharts", () => ({
  LineChart: () => null,
  Line: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

// Read the source file to verify no hard-coded color literals
// This is more reliable than rendering Recharts in jsdom (which requires
// non-zero container dimensions that jsdom doesn't provide)
const historySource = readFileSync(
  resolve(import.meta.dirname, "History.tsx"),
  "utf-8"
);

describe("History", () => {
  it("does not contain hard-coded oklch color literal for chart line or dots", () => {
    // The hard-coded primary color that should be replaced with var(--chart-1)
    expect(historySource).not.toContain('stroke="oklch(0.35 0.08 165)"');
    expect(historySource).not.toContain("fill: 'oklch(0.35 0.08 165)'");
    expect(historySource).not.toContain('fill: "oklch(0.35 0.08 165)"');
  });

  it("uses var(--chart-1) for chart line stroke and dot fill", () => {
    expect(historySource).toContain('stroke="var(--chart-1)"');
    // Match either single or double quotes (Prettier may normalize)
    const hasDotFill =
      historySource.includes("fill: 'var(--chart-1)'") ||
      historySource.includes('fill: "var(--chart-1)"');
    expect(hasDotFill).toBe(true);
  });

  it("delete session button has aria-label", async () => {
    const { default: History } = await import("@/pages/History");
    render(
      <Switch>
        <Route>{() => <History />}</Route>
      </Switch>
    );

    // Wait for async data loading to complete — the session game name appears
    await screen.findByText("Point Counting");

    // Verify the delete button exists (it contains a Trash2 icon)
    const deleteButtons = document.querySelectorAll<HTMLButtonElement>(
      'button[data-slot="button"]'
    );
    // There should be at least one button in the session rows
    const deleteButton = Array.from(deleteButtons).find(
      b => b.querySelector("svg") !== null && b.textContent?.trim() === ""
    );
    expect(deleteButton).toBeDefined();

    // The delete button must have an accessible name
    expect(deleteButton!.getAttribute("aria-label")).toBe("Delete session");
  });

  it("StatCard decorative icons have aria-hidden=true", async () => {
    const { default: History } = await import("@/pages/History");
    render(
      <Switch>
        <Route>{() => <History />}</Route>
      </Switch>
    );

    // Wait for stats to render — stat labels are always shown when stats load
    await screen.findByText("Sessions");

    // Find all SVGs inside stat cards (icons next to stat labels)
    const statCardSvgs = document.querySelectorAll(
      '[data-slot="card-content"] svg'
    );
    expect(statCardSvgs.length).toBeGreaterThan(0);

    // Every decorative icon in stat cards must be hidden from screen readers.
    // The wrapping <span> should have aria-hidden="true" which hides the SVG
    // from the accessibility tree.
    Array.from(statCardSvgs).forEach(svg => {
      const hiddenParent =
        svg.closest('[aria-hidden="true"]') || svg.hasAttribute("aria-hidden");
      expect(hiddenParent).toBeTruthy();
    });
  });
});
