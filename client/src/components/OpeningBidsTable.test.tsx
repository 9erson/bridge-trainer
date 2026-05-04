import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import fs from "node:fs";
import path from "node:path";

// Mock framer-motion — OpeningBidsTable doesn't use it directly,
// but any ancestor might.
vi.mock("framer-motion", () => ({
  motion: {
    div: ({
      children,
    }: {
      children: React.ReactNode;
      [key: string]: unknown;
    }) => <div data-testid="motion-div">{children}</div>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

const sampleBids = [
  { bid: "1♣", hcp: "12–21", description: "3+ clubs" },
  { bid: "1NT", hcp: "15–17", description: "Balanced" },
  { bid: "2♣", hcp: "22+", description: "Strong, artificial" },
];

// Read the component source for CSS class contract tests
const componentSource = fs.readFileSync(
  path.resolve(import.meta.dirname, "OpeningBidsTable.tsx"),
  "utf-8"
);

describe("OpeningBidsTable", () => {
  it("renders all bid rows in the desktop table view", async () => {
    const { default: OpeningBidsTable } = await import(
      "@/components/OpeningBidsTable"
    );

    render(<OpeningBidsTable bids={sampleBids} variant="page" />);

    // Component renders both desktop table and mobile card list in the DOM
    // (CSS controls which is visible). Every description and HCP must be present.
    for (const bid of sampleBids) {
      const descriptions = screen.getAllByText(bid.description);
      expect(descriptions.length).toBeGreaterThanOrEqual(1);
    }
    for (const bid of sampleBids) {
      const hcpMatches = screen.getAllByText(bid.hcp);
      expect(hcpMatches.length).toBeGreaterThanOrEqual(1);
    }
  });

  it("hides desktop table on mobile and shows it at md: breakpoint", () => {
    // The desktop <table> wrapper must have "hidden md:block" so it's
    // invisible below md: and visible at md: and above.
    expect(
      componentSource,
      "Desktop table wrapper should have 'hidden md:block'"
    ).toContain("hidden md:block");
  });

  it("shows mobile card list below md: and hides it at md:", () => {
    // The mobile card list wrapper must have "md:hidden" so it's
    // visible below md: and invisible at md: and above.
    expect(
      componentSource,
      "Mobile card list wrapper should have 'md:hidden'"
    ).toContain("md:hidden");
  });

  it("does not use overflow-x-auto (no horizontal scrolling)", () => {
    // The whole point of the responsive card layout is to avoid
    // horizontal scrolling on mobile.
    expect(
      componentSource,
      "OpeningBidsTable should NOT use overflow-x-auto"
    ).not.toContain("overflow-x-auto");
  });
});
