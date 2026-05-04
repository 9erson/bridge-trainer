import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import SequenceIndicator from "./SequenceIndicator";

// React.memo components are objects with $$typeof = Symbol(react.memo)
// This test prevents accidental removal of the memoization wrapper.
describe("SequenceIndicator — React.memo optimization", () => {
  it("is wrapped in React.memo", () => {
    expect(typeof SequenceIndicator).toBe("object");
    expect(SequenceIndicator.$$typeof).toBe(Symbol.for("react.memo"));
  });
});

function fireDocKey(key: string) {
  act(() => {
    document.dispatchEvent(
      new KeyboardEvent("keydown", {
        key,
        bubbles: true,
      })
    );
  });
}

describe("SequenceIndicator", () => {
  it("renders nothing when enabled but no key is pressed", () => {
    const onBid = vi.fn();
    const { container } = render(
      <SequenceIndicator onBid={onBid} enabled={true} />
    );
    expect(container.innerHTML).toBe("");
  });

  it("shows the digit with underscore and hint after pressing a number key", () => {
    const onBid = vi.fn();
    render(<SequenceIndicator onBid={onBid} enabled={true} />);

    fireDocKey("1");

    expect(screen.getByText(/1_/)).toBeTruthy();
    expect(screen.getByText(/\(type C\/D\/H\/S\/N\)/)).toBeTruthy();
  });

  it("calls onBid with correct bid key when digit then strain is typed", () => {
    const onBid = vi.fn();
    render(<SequenceIndicator onBid={onBid} enabled={true} />);

    fireDocKey("1");
    fireDocKey("n"); // should produce "1NT"

    expect(onBid).toHaveBeenCalledWith("1NT");
  });

  it("calls onBid with suit bid for non-NT strains", () => {
    const onBid = vi.fn();
    render(<SequenceIndicator onBid={onBid} enabled={true} />);

    fireDocKey("2");
    fireDocKey("h"); // should produce "2H"

    expect(onBid).toHaveBeenCalledWith("2H");
  });

  it("calls onBid with lowercase suit letter uppercased", () => {
    const onBid = vi.fn();
    render(<SequenceIndicator onBid={onBid} enabled={true} />);

    fireDocKey("3");
    fireDocKey("d"); // should produce "3D"

    expect(onBid).toHaveBeenCalledWith("3D");
  });

  it("clears the indicator after completing a sequence", () => {
    const onBid = vi.fn();
    const { container } = render(
      <SequenceIndicator onBid={onBid} enabled={true} />
    );

    fireDocKey("1");
    expect(screen.getByText(/1_/)).toBeTruthy();

    fireDocKey("c");
    // After completing, the indicator should clear
    expect(container.innerHTML).toBe("");
  });

  it("clears the buffer after 1500ms timeout if no strain key is pressed", () => {
    vi.useFakeTimers();
    const onBid = vi.fn();
    const { container } = render(
      <SequenceIndicator onBid={onBid} enabled={true} />
    );

    fireDocKey("1");
    expect(screen.getByText(/1_/)).toBeTruthy();

    act(() => {
      vi.advanceTimersByTime(1500);
    });

    expect(container.innerHTML).toBe("");
    vi.useRealTimers();
  });

  it("does not respond to keys when disabled", () => {
    const onBid = vi.fn();
    const { container } = render(
      <SequenceIndicator onBid={onBid} enabled={false} />
    );

    fireDocKey("1");
    fireDocKey("n");

    expect(onBid).not.toHaveBeenCalled();
    expect(container.innerHTML).toBe("");
  });

  it("clears any active buffer when disabled", () => {
    const onBid = vi.fn();
    const { container, rerender } = render(
      <SequenceIndicator onBid={onBid} enabled={true} />
    );

    fireDocKey("1");
    expect(screen.getByText(/1_/)).toBeTruthy();

    // Disable it
    rerender(<SequenceIndicator onBid={onBid} enabled={false} />);
    expect(container.innerHTML).toBe("");
  });
});
