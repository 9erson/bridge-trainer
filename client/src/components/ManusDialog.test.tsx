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
});
