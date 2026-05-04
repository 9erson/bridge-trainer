import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

const componentSource = fs.readFileSync(
  path.resolve(import.meta.dirname, "InlineReference.tsx"),
  "utf-8"
);

describe("InlineReference — responsive opening bids (#28)", () => {
  it("imports OpeningBidsTable component instead of rendering inline table", () => {
    expect(
      componentSource,
      "InlineReference should import OpeningBidsTable"
    ).toContain("OpeningBidsTable");
  });

  it("does not contain overflow-x-auto (no horizontal scrolling)", () => {
    expect(
      componentSource,
      "InlineReference should NOT use overflow-x-auto"
    ).not.toContain("overflow-x-auto");
  });

  it("does not contain an inline <table> element", () => {
    expect(
      componentSource,
      "InlineReference should NOT contain a raw <table> tag"
    ).not.toContain("<table");
  });
});
