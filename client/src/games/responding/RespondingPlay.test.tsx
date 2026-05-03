import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// Read source file for static class analysis (matches History.test.tsx pattern)
const source = readFileSync(
  resolve(import.meta.dirname, "RespondingPlay.tsx"),
  "utf-8"
);

describe("RespondingPlay — theme tokens (#32)", () => {
  it("partner bid callout uses primary theme tokens, not hard-coded emerald", () => {
    // The partner callout should use border-primary/30 bg-primary/5
    // instead of border-emerald-600/30 bg-emerald-50/50
    expect(source).not.toContain("bg-emerald-50/50");
    expect(source).not.toContain("border-emerald-600/30");
    expect(source).toContain("bg-primary/5");
    expect(source).toContain("border-primary/30");
  });
});
