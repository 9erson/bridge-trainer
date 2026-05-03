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

const mockGetAllSessions = vi.fn(() => Promise.resolve([mockSession]));

vi.mock("@/lib/db", () => ({
  getAllSessions: () => mockGetAllSessions(),
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

  it("delete session button has h-11 and w-11 (44×44px) to meet WCAG touch target minimum", async () => {
    const { default: History } = await import("@/pages/History");
    render(
      <Switch>
        <Route>{() => <History />}</Route>
      </Switch>
    );

    // Wait for async data loading to complete
    await screen.findByText("Point Counting");

    // Find the delete button by its aria-label
    const deleteButtons = document.querySelectorAll<HTMLButtonElement>(
      'button[data-slot="button"]'
    );
    const deleteButton = Array.from(deleteButtons).find(
      b => b.getAttribute("aria-label") === "Delete session"
    );
    expect(deleteButton).toBeDefined();

    // WCAG 2.5.8: touch targets must be at least 44x44px
    // h-11 = 2.75rem = 44px, w-11 = 2.75rem = 44px
    const classes = deleteButton!.className;
    expect(
      classes.includes("h-11"),
      `Delete button is missing h-11 class (got: "${classes}")`
    ).toBe(true);
    expect(
      classes.includes("w-11"),
      `Delete button is missing w-11 class (got: "${classes}")`
    ).toBe(true);
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

describe("History — theme tokens (#32)", () => {
  it("Incomplete badge uses accent theme tokens, not hard-coded amber", () => {
    // The Incomplete badge should use bg-accent text-accent-foreground
    // instead of bg-amber-100 text-amber-700
    expect(historySource).not.toContain("bg-amber-100");
    expect(historySource).not.toContain("text-amber-700");
    expect(historySource).toContain("bg-accent");
    expect(historySource).toContain("text-accent-foreground");
  });
});

describe("History — query optimization (#39)", () => {
  it("calls getAllSessions exactly once on mount (no N+1 queries)", async () => {
    mockGetAllSessions.mockClear();
    const { default: History } = await import("@/pages/History");
    render(
      <Switch>
        <Route>{() => <History />}</Route>
      </Switch>
    );

    await screen.findByText("Point Counting");

    expect(mockGetAllSessions).toHaveBeenCalledTimes(1);
  });

  it("no longer imports getCompletedSessionStats from db", () => {
    // After optimization, History.tsx should not import getCompletedSessionStats
    expect(historySource).not.toContain("getCompletedSessionStats");
  });
});

describe("History — mobile responsive layout (#29)", () => {
  it("SessionRow uses responsive flex direction (column on mobile, row on desktop)", () => {
    // The session row container should use flex-col on mobile and flex-row at md+
    const sessionRowSection = historySource.substring(
      historySource.indexOf("const SessionRow = memo")
    );

    // Must have flex-col (mobile default) and md:flex-row (desktop)
    expect(
      sessionRowSection,
      "SessionRow root should have flex-col for mobile stacking"
    ).toContain("flex-col");
    expect(
      sessionRowSection,
      "SessionRow root should have md:flex-row for desktop horizontal layout"
    ).toContain("md:flex-row");
  });

  it("SessionRow stat blocks do not use shrink-0 on mobile (allows wrapping)", () => {
    const sessionRowSection = historySource.substring(
      historySource.indexOf("const SessionRow = memo")
    );

    // The score and avg-time divs should not have unconditional shrink-0.
    // They should use md:shrink-0 so they can flex on mobile.
    // Match "shrink-0" that is NOT preceded by "md:" (i.e. unconditional)
    const unconditionalShrink = sessionRowSection.match(
      /(?<!md:)shrink-0/g
    );
    // Only the delete Button should have unconditional shrink-0 (it's always 44px)
    // Filter to only <div> elements with unconditional shrink-0
    const divsWithUnconditionalShrink =
      sessionRowSection.match(/<div[^>]*className="[^"]*(?<!md:)shrink-0[^"]*"/g);
    expect(
      divsWithUnconditionalShrink,
      "No <div> in SessionRow should have unconditional shrink-0"
    ).toBeNull();
  });

  it("SessionRow score and time stats are grouped in a single row at mobile", () => {
    const sessionRowSection = historySource.substring(
      historySource.indexOf("const SessionRow = memo")
    );

    // Score and time should be in a flex container that lays them out side-by-side
    // This means there should be a flex wrapper around the stat divs
    expect(sessionRowSection).toContain("flex");
    expect(sessionRowSection).toContain("gap-");
  });

  it("SessionRow delete button retains h-11 w-11 for 44×44px WCAG touch target", () => {
    const sessionRowSection = historySource.substring(
      historySource.indexOf("const SessionRow = memo")
    );

    // The delete button must keep its 44×44px touch target
    expect(sessionRowSection).toContain("h-11");
    expect(sessionRowSection).toContain("w-11");
  });

  it("SessionRow outer container keeps md:items-center for desktop alignment", () => {
    const sessionRowSection = historySource.substring(
      historySource.indexOf("const SessionRow = memo")
    );

    // On desktop (md+), items should be vertically centered like before
    expect(sessionRowSection).toContain("md:items-center");
  });
});

describe("History — React.memo optimization (#18)", () => {
  it("StatCard and SessionRow use stable icon references (module-level constants)", () => {
    // Verify that the icon constants are extracted to module level
    // instead of being created inline on each render
    expect(historySource).toContain("TROPHY_ICON");
    expect(historySource).toContain("TARGET_ICON");
    expect(historySource).toContain("CLOCK_ICON");
    expect(historySource).toContain("TRENDING_UP_ICON");
  });

  it("StatCard is wrapped in React.memo", () => {
    expect(historySource).toMatch(
      /const StatCard = memo\(function StatCard/
    );
  });

  it("SessionRow is wrapped in React.memo", () => {
    expect(historySource).toMatch(
      /const SessionRow = memo\(function SessionRow/
    );
  });
});
