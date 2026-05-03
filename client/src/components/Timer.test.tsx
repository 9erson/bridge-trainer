import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import Timer from "./Timer";

// Radix UI components require ResizeObserver which jsdom doesn't provide
global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

describe("Timer", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders initial seconds value", () => {
    render(<Timer seconds={30} isRunning={true} onTimeUp={vi.fn()} />);

    expect(screen.getByText("30s")).toBeDefined();
  });

  it("counts down one second at a time", () => {
    render(<Timer seconds={10} isRunning={true} onTimeUp={vi.fn()} />);

    expect(screen.getByText("10s")).toBeDefined();

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByText("9s")).toBeDefined();

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByText("8s")).toBeDefined();
  });

  it("fires onTimeUp when reaching zero", () => {
    const onTimeUp = vi.fn();
    render(<Timer seconds={3} isRunning={true} onTimeUp={onTimeUp} />);

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(onTimeUp).toHaveBeenCalledTimes(1);
    expect(screen.getByText("0s")).toBeDefined();
  });

  it("does not update state between whole-second boundaries", () => {
    // With the old 100ms interval, advancing 100ms triggers a setState
    // (remaining drops from 30000 to 29900). With a 1s interval, no
    // setState fires at the 100ms mark, so the progress bar value stays at 100%.
    const { container } = render(
      <Timer seconds={30} isRunning={true} onTimeUp={vi.fn()} />
    );

    const getProgressValue = () => {
      const bar = container.querySelector("[data-slot='progress']");
      return bar?.getAttribute("data-value") ?? bar?.getAttribute("value");
    };

    // Initially: full progress (100% or close to it)
    const initialValue = getProgressValue();

    // Advance only 100ms — this should NOT trigger any state update
    act(() => {
      vi.advanceTimersByTime(100);
    });

    // Progress bar value must be unchanged — no intermediate updates
    expect(getProgressValue()).toBe(initialValue);

    // Advance to the 1-second mark — now the display should change
    act(() => {
      vi.advanceTimersByTime(900);
    });
    expect(screen.getByText("29s")).toBeDefined();
  });

  it("shows urgent styling when under 5 seconds", () => {
    const { container } = render(
      <Timer seconds={6} isRunning={true} onTimeUp={vi.fn()} />
    );

    const getSpan = () =>
      container.querySelector<HTMLSpanElement>("span.font-mono");

    // At 6 seconds remaining — not urgent
    expect(getSpan()?.className).not.toContain("text-destructive");

    // Tick to 4 seconds (remaining=4000ms < 5000ms) — urgent state kicks in
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(screen.getByText("4s")).toBeDefined();
    expect(getSpan()?.className).toContain("text-destructive");
  });

  it("stops counting when isRunning becomes false", () => {
    const { rerender } = render(
      <Timer seconds={10} isRunning={true} onTimeUp={vi.fn()} />
    );

    // Count down 1 second
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByText("9s")).toBeDefined();

    // Pause the timer
    rerender(<Timer seconds={10} isRunning={false} onTimeUp={vi.fn()} />);

    // Advance another 2 seconds — should NOT count down
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(screen.getByText("9s")).toBeDefined();
  });

  it("resets when seconds prop changes", () => {
    const { rerender } = render(
      <Timer seconds={10} isRunning={true} onTimeUp={vi.fn()} />
    );

    // Count down 2 seconds
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(screen.getByText("8s")).toBeDefined();

    // Change the seconds prop — should reset to new value
    rerender(<Timer seconds={20} isRunning={true} onTimeUp={vi.fn()} />);
    expect(screen.getByText("20s")).toBeDefined();
  });

  it("calls the latest onTimeUp callback even if identity changes", () => {
    const staleCallback = vi.fn();
    const freshCallback = vi.fn();

    const { rerender } = render(
      <Timer seconds={3} isRunning={true} onTimeUp={staleCallback} />
    );

    // After 1 second, swap the callback
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    rerender(<Timer seconds={3} isRunning={true} onTimeUp={freshCallback} />);

    // Let timer expire
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    // The fresh callback should have been called, not the stale one
    expect(freshCallback).toHaveBeenCalledTimes(1);
    expect(staleCallback).not.toHaveBeenCalled();
  });
});
