import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Slider } from "./slider";

// Radix UI components require ResizeObserver which jsdom doesn't provide
global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

describe("Slider", () => {
  it("thumb uses theme-aware background instead of hard-coded bg-white", () => {
    const { container } = render(<Slider defaultValue={[50]} />);

    const thumb = container.querySelector(
      '[data-slot="slider-thumb"]'
    ) as HTMLElement;
    expect(thumb).not.toBeNull();
    expect(thumb.className).not.toContain("bg-white");
    expect(thumb.className).toContain("bg-popover");
  });
});
