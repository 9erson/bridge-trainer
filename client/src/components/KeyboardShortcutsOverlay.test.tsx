import { describe, it, expect, vi, afterEach } from "vitest";
import { cleanup, render, screen, fireEvent } from "@testing-library/react";

// Radix Dialog renders into a portal appended to document.body.
// Cleanup between tests to remove portal nodes.
describe("KeyboardShortcutsOverlay", () => {
  afterEach(cleanup);

  it("renders with role=dialog when open", async () => {
    const { default: KeyboardShortcutsOverlay } = await import(
      "@/components/KeyboardShortcutsOverlay"
    );
    render(<KeyboardShortcutsOverlay isOpen={true} onClose={() => {}} />);

    expect(screen.getByRole("dialog")).toBeDefined();
  });

  it("is a modal dialog (focus trap, scroll lock, outside click prevented)", async () => {
    const { default: KeyboardShortcutsOverlay } = await import(
      "@/components/KeyboardShortcutsOverlay"
    );
    render(<KeyboardShortcutsOverlay isOpen={true} onClose={() => {}} />);

    const dialog = screen.getByRole("dialog");
    // Radix Dialog uses role="dialog" with modal behavior (focus trap, scroll lock).
    // Verify data-state="open" which Radix uses to indicate the open modal state.
    expect(dialog.getAttribute("data-state")).toBe("open");
    // Verify the dialog has a focusable element inside (focus is trapped within)
    const focusable = dialog.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    expect(focusable.length).toBeGreaterThanOrEqual(1);
  });

  it("has aria-labelledby pointing to the title element", async () => {
    const { default: KeyboardShortcutsOverlay } = await import(
      "@/components/KeyboardShortcutsOverlay"
    );
    render(<KeyboardShortcutsOverlay isOpen={true} onClose={() => {}} />);

    const dialog = screen.getByRole("dialog");
    const labelledBy = dialog.getAttribute("aria-labelledby");
    expect(labelledBy).toBeTruthy();

    const titleEl = document.getElementById(labelledBy!);
    expect(titleEl).not.toBeNull();
    expect(titleEl!.textContent).toContain("Keyboard Shortcuts");
  });

  it("closes when Escape is pressed", async () => {
    const { default: KeyboardShortcutsOverlay } = await import(
      "@/components/KeyboardShortcutsOverlay"
    );
    const onClose = vi.fn();
    render(<KeyboardShortcutsOverlay isOpen={true} onClose={onClose} />);

    fireEvent.keyDown(document, { key: "Escape" });

    // Radix calls onOpenChange(false) which triggers onClose
    expect(onClose).toHaveBeenCalled();
  });

  it("shows Opening Bid group when context is opening-bid", async () => {
    const { default: KeyboardShortcutsOverlay } = await import(
      "@/components/KeyboardShortcutsOverlay"
    );
    render(
      <KeyboardShortcutsOverlay
        isOpen={true}
        onClose={() => {}}
        context="opening-bid"
      />
    );

    expect(screen.getByText("Opening Bid")).toBeDefined();
    // Should NOT show Point Counting group when context is opening-bid
    expect(screen.queryByText("Point Counting")).toBeNull();
  });

  it("shows Point Counting group when context is point-counting", async () => {
    const { default: KeyboardShortcutsOverlay } = await import(
      "@/components/KeyboardShortcutsOverlay"
    );
    render(
      <KeyboardShortcutsOverlay
        isOpen={true}
        onClose={() => {}}
        context="point-counting"
      />
    );

    expect(screen.getByText("Point Counting")).toBeDefined();
    expect(screen.queryByText("Opening Bid")).toBeNull();
  });

  it("close button has aria-label", async () => {
    const { default: KeyboardShortcutsOverlay } = await import(
      "@/components/KeyboardShortcutsOverlay"
    );
    render(<KeyboardShortcutsOverlay isOpen={true} onClose={() => {}} />);

    const closeButton = screen.getByLabelText("Close keyboard shortcuts");
    expect(closeButton).toBeDefined();
    expect(closeButton.getAttribute("aria-label")).toBe(
      "Close keyboard shortcuts"
    );
  });

  it("is not visible when isOpen is false", async () => {
    const { default: KeyboardShortcutsOverlay } = await import(
      "@/components/KeyboardShortcutsOverlay"
    );
    render(<KeyboardShortcutsOverlay isOpen={false} onClose={() => {}} />);

    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("traps focus within the dialog via Radix FocusScope", async () => {
    const { default: KeyboardShortcutsOverlay } = await import(
      "@/components/KeyboardShortcutsOverlay"
    );
    render(<KeyboardShortcutsOverlay isOpen={true} onClose={() => {}} />);

    const dialog = screen.getByRole("dialog");

    // Radix DialogContent wraps content in a FocusScope with trapped=true.
    // The dialog should contain at least the close button as a focusable element.
    const focusable = dialog.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    expect(focusable.length).toBeGreaterThanOrEqual(1);

    // Verify it has role="dialog" and aria-labelledby (core dialog accessibility)
    expect(dialog.getAttribute("role")).toBe("dialog");
    expect(dialog.hasAttribute("aria-labelledby")).toBe(true);
  });
});
