import fs from "node:fs";
import path from "node:path";
import { describe, it, expect } from "vitest";

/**
 * Build output contract tests for vendor chunk splitting (#14).
 *
 * These tests verify that `pnpm build` produces separate vendor chunks
 * for heavy dependencies (recharts, framer-motion, radix-ui) so that
 * they can be cached independently of application code.
 *
 * Run: pnpm build && pnpm vitest run build-chunks
 */

const DIST_DIR = path.resolve(import.meta.dirname, "../../dist/public");
const ASSETS_DIR = path.join(DIST_DIR, "assets");

function getAssetFiles(): string[] {
  if (!fs.existsSync(ASSETS_DIR)) {
    return [];
  }
  return fs.readdirSync(ASSETS_DIR);
}

function findChunk(namePattern: RegExp): string | undefined {
  return getAssetFiles().find(f => namePattern.test(f));
}

function fileSizeKB(filename: string): number {
  const stat = fs.statSync(path.join(ASSETS_DIR, filename));
  return Math.round(stat.size / 1024);
}

function totalJSSizeKB(): number {
  return getAssetFiles()
    .filter(f => f.endsWith(".js"))
    .reduce((sum, f) => sum + fileSizeKB(f), 0);
}

describe("Vendor chunk splitting (#14)", () => {
  it("produces a separate recharts vendor chunk", () => {
    const chunk = findChunk(/vendor-recharts/);
    expect(chunk, "Expected a vendor-recharts chunk file").toBeDefined();
    expect(
      fileSizeKB(chunk!),
      "recharts chunk should be substantial"
    ).toBeGreaterThan(50);
  });

  it("produces a separate framer-motion vendor chunk", () => {
    const chunk = findChunk(/vendor-framer-motion/);
    expect(chunk, "Expected a vendor-framer-motion chunk file").toBeDefined();
    expect(
      fileSizeKB(chunk!),
      "framer-motion chunk should be substantial"
    ).toBeGreaterThan(10);
  });

  it("produces a separate radix-ui vendor chunk", () => {
    const chunk = findChunk(/vendor-radix/);
    expect(chunk, "Expected a vendor-radix chunk file").toBeDefined();
    expect(
      fileSizeKB(chunk!),
      "radix chunk should be substantial"
    ).toBeGreaterThan(10);
  });

  it("does not duplicate vendor code — total JS size stays within baseline", () => {
    // Pre-split baseline: index (627KB) + History (402KB) + ConventionRef (19KB) ≈ 1049KB
    const total = totalJSSizeKB();
    // Allow 5% overhead from chunk metadata, but no duplication
    expect(
      total,
      `Total JS size ${total}KB should be under 1100KB`
    ).toBeLessThan(1100);
  });

  it("the main app chunk is under 500KB (Vite warning threshold)", () => {
    const mainChunk = findChunk(/^index-/);
    expect(mainChunk, "Expected an index chunk file").toBeDefined();
    expect(
      fileSizeKB(mainChunk!),
      `Main chunk should be under 500KB, was ${fileSizeKB(mainChunk!)}KB`
    ).toBeLessThan(500);
  });
});
