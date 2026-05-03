import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import DisplayModeToggle from "./DisplayModeToggle";

// Radix UI components require ResizeObserver which jsdom doesn't provide
global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

describe("DisplayModeToggle", () => {
  it("renders both Text and Cards buttons with h-11 (44px) touch target", () => {
    render(<DisplayModeToggle mode="text" onChange={() => {}} />);

    const textButton = screen.getByRole("button", { name: /text/i });
    const cardsButton = screen.getByRole("button", { name: /cards/i });

    expect(textButton).toBeTruthy();
    expect(cardsButton).toBeTruthy();

    // WCAG 2.5.5: touch targets must be at least 44x44px
    // h-11 = 2.75rem = 44px
    expect(textButton.className).toContain("h-11");
    expect(cardsButton.className).toContain("h-11");
  });

  it("calls onChange with 'text' when Text button is clicked", () => {
    const onChange = vi.fn();
    render(<DisplayModeToggle mode="graphic" onChange={onChange} />);

    const textButton = screen.getByRole("button", { name: /text/i });
    textButton.click();

    expect(onChange).toHaveBeenCalledWith("text");
  });

  it("calls onChange with 'graphic' when Cards button is clicked", () => {
    const onChange = vi.fn();
    render(<DisplayModeToggle mode="text" onChange={onChange} />);

    const cardsButton = screen.getByRole("button", { name: /cards/i });
    cardsButton.click();

    expect(onChange).toHaveBeenCalledWith("graphic");
  });
});
