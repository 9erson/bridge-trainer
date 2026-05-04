import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import fs from "node:fs";
import path from "node:path";
import OpeningBidsTable from "./OpeningBidsTable";

const TEST_BIDS = [
  { bid: "1♠", hcp: "12-21", description: "5+ spades" },
  { bid: "1♥", hcp: "12-21", description: "5+ hearts" },
  { bid: "1♦", hcp: "12-21", description: "4+ diamonds" },
  { bid: "1♣", hcp: "12-21", description: "3+ clubs" },
  { bid: "1NT", hcp: "15-17", description: "Balanced" },
];

const sourceFile = fs.readFileSync(
  path.join(__dirname, "OpeningBidsTable.tsx"),
  "utf-8"
);

describe("OpeningBidsTable", () => {
  it("does not use dangerouslySetInnerHTML for suit coloring", () => {
    // Source code should not contain dangerouslySetInnerHTML
    expect(sourceFile).not.toContain("dangerouslySetInnerHTML");
  });

  it("renders colored suit symbols using React elements", () => {
    const { container } = render(
      <OpeningBidsTable bids={TEST_BIDS} variant="page" />
    );

    // Verify suit symbols render with CSS variable colors
    const suitSpans = container.querySelectorAll('span[style*="var(--"]');
    expect(suitSpans.length).toBeGreaterThan(0);
  });

  it("applies correct CSS variable colors for red and black suits", () => {
    const { container } = render(
      <OpeningBidsTable bids={TEST_BIDS} variant="page" />
    );

    const allColoredSpans = container.querySelectorAll("span[style]");
    const colors = Array.from(allColoredSpans).map(
      span => (span as HTMLElement).style.color
    );

    // Should contain both red and black suit colors via CSS variables
    expect(colors.some(c => c.includes("var(--suit-red)"))).toBe(true);
    expect(colors.some(c => c.includes("var(--suit-black)"))).toBe(true);
  });
});
