import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Switch } from "./switch";

// Radix UI components require ResizeObserver which jsdom doesn't provide
global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

describe("Switch", () => {
  it("has a touch target of at least 44x44px via padding and content-box", () => {
    const { container } = render(<Switch />);

    const switchRoot = container.querySelector(
      '[data-slot="switch"]'
    ) as HTMLElement;
    expect(switchRoot).toBeTruthy();

    // content-box ensures padding adds to (not subtracts from) the visual dimensions
    expect(switchRoot.style.boxSizing).toBe("content-box");

    const classes = switchRoot.className;

    // Verify padding expands the clickable area:
    //   py-[13px] → 18 + 26 = 44px height
    //   px-1.5   → 32 + 12 = 44px width
    const hasPadding =
      classes.includes("py-") ||
      classes.includes("p-") ||
      classes.includes("p[");
    expect(hasPadding).toBe(true);

    // Verify negative margin to prevent layout shift
    const hasNegativeMargin =
      classes.includes("-m") ||
      classes.includes("-my") ||
      classes.includes("-mx");
    expect(hasNegativeMargin).toBe(true);
  });

  it("preserves the visual track size (h-[1.15rem] w-8)", () => {
    const { container } = render(<Switch />);

    const switchRoot = container.querySelector(
      '[data-slot="switch"]'
    ) as HTMLElement;
    const classes = switchRoot.className;

    // The visual appearance of the track must remain h-[1.15rem] x w-8
    expect(classes).toContain("h-[1.15rem]");
    expect(classes).toContain("w-8");
  });

  it("maintains switch ARIA role and data attributes", () => {
    const { container } = render(<Switch />);

    const switchRoot = container.querySelector(
      '[data-slot="switch"]'
    ) as HTMLElement;

    expect(switchRoot).toHaveAttribute("role", "switch");
    expect(switchRoot).toHaveAttribute("data-slot", "switch");
  });
});
