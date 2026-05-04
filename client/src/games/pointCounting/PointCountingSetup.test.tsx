import { describe, it, expect, vi } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

// Radix UI components require ResizeObserver which jsdom doesn't provide
global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Radix Select uses scrollIntoView internally
Element.prototype.scrollIntoView = vi.fn();

const source = readFileSync(
  resolve(import.meta.dirname, "PointCountingSetup.tsx"),
  "utf-8"
);

describe("PointCountingSetup", () => {
  it("renders mode toggle with HCP and Support Points options", async () => {
    const { default: PointCountingSetup } = await import(
      "@/games/pointCounting/PointCountingSetup"
    );
    render(<PointCountingSetup onStart={vi.fn()} />);

    // Should show a label for the mode selector
    expect(screen.getByText("Point Valuation")).toBeTruthy();

    // Default should be HCP — the select trigger should display "High Card Points"
    const trigger = screen.getByRole("combobox", { name: /point valuation/i });
    expect(trigger).toHaveTextContent("High Card Points");
  });

  it("defaults to HCP mode (mode: 'hcp' in extra)", async () => {
    const onStart = vi.fn();
    const { default: PointCountingSetup } = await import(
      "@/games/pointCounting/PointCountingSetup"
    );
    render(<PointCountingSetup onStart={onStart} />);

    // Click start without changing mode
    const startButton = screen.getByRole("button", { name: /start session/i });
    fireEvent.click(startButton);

    expect(onStart).toHaveBeenCalledTimes(1);
    const settings = onStart.mock.calls[0][0];
    expect(settings.extra.mode).toBe("hcp");
  });

  it("passes mode: 'support' in extra when Support Points is selected", async () => {
    const onStart = vi.fn();
    const { default: PointCountingSetup } = await import(
      "@/games/pointCounting/PointCountingSetup"
    );
    render(<PointCountingSetup onStart={onStart} />);

    // Open the mode select
    const trigger = screen.getByRole("combobox", { name: /point valuation/i });
    fireEvent.click(trigger);

    // Click the "Support Points (ACBL)" option from the dropdown
    const supportOption = await screen.findByText("Support Points (ACBL)");
    fireEvent.click(supportOption);

    // Click start
    const startButton = screen.getByRole("button", { name: /start session/i });
    fireEvent.click(startButton);

    expect(onStart).toHaveBeenCalledTimes(1);
    const settings = onStart.mock.calls[0][0];
    expect(settings.extra.mode).toBe("support");
  });
});

describe("PointCountingSetup — source structure", () => {
  it("offers both HCP and Support Points modes as select options", () => {
    expect(source).toContain('value="hcp"');
    expect(source).toContain('value="support"');
    expect(source).toContain("High Card Points");
    expect(source).toContain("Support Points (ACBL)");
  });

  it("defaults mode state to hcp", () => {
    expect(source).toMatch(/useState.*"hcp"/);
  });

  it("passes mode into settings.extra via handleStart", () => {
    expect(source).toContain("extra: { ...settings.extra, mode }");
  });
});
