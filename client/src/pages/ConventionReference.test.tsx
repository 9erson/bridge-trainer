import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

const pageSource = fs.readFileSync(
  path.resolve(import.meta.dirname, "../pages/ConventionReference.tsx"),
  "utf-8"
);

describe("ConventionReference — responsive opening bids (#28)", () => {
  it("imports OpeningBidsTable component instead of rendering inline table", () => {
    expect(
      pageSource,
      "ConventionReference should import OpeningBidsTable"
    ).toContain("OpeningBidsTable");
  });

  it("does not contain overflow-x-auto (no horizontal scrolling)", () => {
    expect(
      pageSource,
      "ConventionReference should NOT use overflow-x-auto"
    ).not.toContain("overflow-x-auto");
  });

  it("does not contain an inline <table> element", () => {
    // After refactoring, the <table> lives inside OpeningBidsTable, not here.
    expect(
      pageSource,
      "ConventionReference should NOT contain a raw <table> tag"
    ).not.toContain("<table");
  });
});

describe("ConventionReference — Key Conventions responsive layout (#28)", () => {
  it("uses md:min-w for convention name to allow wrapping on mobile", () => {
    // The convention name span must use md:min-w-[120px] (not unconditional min-w)
    // so names can wrap naturally on small screens.
    expect(
      pageSource,
      "Key Conventions name should use md:min-w-[120px]"
    ).toContain("md:min-w-[120px]");
  });

  it("does not use unconditional min-w on convention names", () => {
    // Extract the Key Conventions section
    const keyConvSection = pageSource.substring(
      pageSource.indexOf("Key Conventions")
    );
    // Check for min-w that is NOT preceded by md: (unconditional min-width)
    const unconditionalMinW = keyConvSection.match(/(?<!md:)min-w-\[/);
    expect(
      unconditionalMinW,
      "Key Conventions should NOT have unconditional min-w"
    ).toBeNull();
  });
});
