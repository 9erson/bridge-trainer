import { describe, it, expect, vi, beforeAll } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// Read the source file to verify no hard-coded color literals
// This is more reliable than rendering Recharts in jsdom (which requires
// non-zero container dimensions that jsdom doesn't provide)
const historySource = readFileSync(
  resolve(import.meta.dirname, "History.tsx"),
  "utf-8",
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
    expect(historySource).toContain("fill: 'var(--chart-1)'");
  });
});
