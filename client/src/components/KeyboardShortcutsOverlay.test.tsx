import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

// Mock framer-motion to avoid animation complexity in tests
vi.mock("framer-motion", () => ({
  motion: {
    div: ({
      children,
      ...props
    }: {
      children: React.ReactNode;
      [key: string]: unknown;
    }) => <div data-testid="motion-div">{children}</div>,
  },
  AnimatePresence: ({
    children,
  }: {
    children: React.ReactNode;
  }) => <>{children}</>,
}));

describe("KeyboardShortcutsOverlay", () => {
  it("close button has aria-label", async () => {
    const { default: KeyboardShortcutsOverlay } = await import(
      "@/components/KeyboardShortcutsOverlay"
    );
    render(
      <KeyboardShortcutsOverlay
        isOpen={true}
        onClose={() => {}}
      />
    );

    // The close button (native <button> with X icon) must have an accessible name
    const closeButton = screen.getByLabelText("Close keyboard shortcuts");
    expect(closeButton).toBeDefined();
    expect(closeButton.getAttribute("aria-label")).toBe(
      "Close keyboard shortcuts"
    );
  });
});
