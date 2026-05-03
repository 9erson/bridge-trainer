import { describe, it, expect, afterEach } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { ManusDialog } from "./ManusDialog";

// Radix Dialog renders into a portal appended to document.body, so we must
// query from document (not the render container). Cleanup between tests to
// remove portal nodes.
describe("ManusDialog", () => {
  afterEach(cleanup);

  it("uses max-w-[400px] instead of fixed w-[400px] for responsive width", () => {
    render(<ManusDialog open={true} onLogin={() => {}} />);

    // The DialogContent element carries the width class — rendered via portal
    const dialogContent = document.querySelector(
      "[data-slot='dialog-content']"
    );
    expect(dialogContent).not.toBeNull();

    const classList = Array.from(dialogContent!.classList);

    // Bug: w-[400px] creates a fixed-width dialog that overflows on viewports < 400px
    // Fix: max-w-[400px] caps the width while allowing responsive shrinkage
    expect(classList).not.toContain("w-[400px]");
    expect(classList.some(c => c.startsWith("max-w-[400px]"))).toBe(true);
  });

  it("includes w-full for responsive base width alongside max-w constraint", () => {
    render(<ManusDialog open={true} onLogin={() => {}} />);

    const dialogContent = document.querySelector(
      "[data-slot='dialog-content']"
    );
    expect(dialogContent).not.toBeNull();

    const classList = Array.from(dialogContent!.classList);

    // w-full from the base DialogContent should be present (not overridden by w-[400px])
    expect(classList).toContain("w-full");
  });

  it("uses bg-card instead of hard-coded background color on dialog content", () => {
    render(<ManusDialog open={true} onLogin={() => {}} />);

    const dialogContent = document.querySelector(
      "[data-slot='dialog-content']"
    );
    expect(dialogContent).not.toBeNull();

    const classList = Array.from(dialogContent!.classList);

    // Hard-coded hex #f8f8f7 won't respond to theme changes (dark mode)
    expect(classList).not.toContain("bg-[#f8f8f7]");
    expect(classList).toContain("bg-card");
  });

  it("uses border-border instead of hard-coded rgba border on dialog content", () => {
    render(<ManusDialog open={true} onLogin={() => {}} />);

    const dialogContent = document.querySelector(
      "[data-slot='dialog-content']"
    );
    expect(dialogContent).not.toBeNull();

    const classList = Array.from(dialogContent!.classList);

    // Hard-coded rgba(0,0,0,0.08) won't adapt to theme changes
    expect(classList.some(c => c.includes("rgba(0,0,0"))).toBe(false);
    expect(classList).toContain("border-border");
  });

  it("uses text-foreground for title instead of hard-coded hex color", () => {
    render(<ManusDialog open={true} title="Test" onLogin={() => {}} />);

    const title = document.querySelector("[data-slot='dialog-title']");
    expect(title).not.toBeNull();

    const classList = Array.from(title!.classList);

    // Hard-coded #34322d won't adapt to dark mode
    expect(classList).not.toContain("text-[#34322d]");
    expect(classList).toContain("text-foreground");
  });

  it("does not override DialogDescription's default text-muted-foreground", () => {
    render(<ManusDialog open={true} onLogin={() => {}} />);

    const description = document.querySelector(
      "[data-slot='dialog-description']"
    );
    expect(description).not.toBeNull();

    const classList = Array.from(description!.classList);

    // Hard-coded #858481 won't adapt to dark mode
    expect(classList).not.toContain("text-[#858481]");
    // DialogDescription base component already applies text-muted-foreground
    expect(classList).toContain("text-muted-foreground");
  });

  it("uses default Button variant instead of hard-coded bg-[#1a1a19]", () => {
    render(<ManusDialog open={true} onLogin={() => {}} />);

    const button = document.querySelector("button");
    expect(button).not.toBeNull();

    const classList = Array.from(button!.classList);

    // Hard-coded #1a1a19 (near-black) won't adapt to dark mode
    expect(classList).not.toContain("bg-[#1a1a19]");
    expect(classList).toContain("bg-primary");
  });

  it("does not use backdrop-blur-2xl on dialog content", () => {
    render(<ManusDialog open={true} onLogin={() => {}} />);

    const dialogContent = document.querySelector(
      "[data-slot='dialog-content']"
    );
    expect(dialogContent).not.toBeNull();

    const classList = Array.from(dialogContent!.classList);

    // No other dialog uses backdrop-blur-2xl; the overlay handles blur
    expect(classList).not.toContain("backdrop-blur-2xl");
  });

  it("uses bg-card instead of bg-white for logo container", () => {
    render(<ManusDialog open={true} logo="/favicon.svg" onLogin={() => {}} />);

    const logoContainer = document.querySelector(
      "[data-slot='dialog-content'] .w-16"
    );
    expect(logoContainer).not.toBeNull();

    const classList = Array.from(logoContainer!.classList);

    // bg-white won't adapt to dark mode
    expect(classList).not.toContain("bg-white");
    expect(classList).toContain("bg-card");
  });

  it("uses border-border instead of hard-coded rgba for logo container border", () => {
    render(<ManusDialog open={true} logo="/favicon.svg" onLogin={() => {}} />);

    const logoContainer = document.querySelector(
      "[data-slot='dialog-content'] .w-16"
    );
    expect(logoContainer).not.toBeNull();

    const classList = Array.from(logoContainer!.classList);

    expect(classList.some(c => c.includes("rgba(0,0,0"))).toBe(false);
    expect(classList).toContain("border-border");
  });
});
