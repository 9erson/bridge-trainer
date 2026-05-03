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

  it("has role='timer' on the container element", () => {
    const { container } = render(
      <Timer seconds={30} isRunning={true} onTimeUp={vi.fn()} />
    );

    const timer = container.querySelector("[role='timer']");
    expect(timer).toBeTruthy();
  });

  it("has a visually-hidden aria-live region for screen reader announcements", () => {
    const { container } = render(
      <Timer seconds={30} isRunning={true} onTimeUp={vi.fn()} />
    );

    const liveRegion = container.querySelector("[aria-live='polite']");
    expect(liveRegion).toBeTruthy();
    expect(liveRegion!.className).toContain("sr-only");
  });

  it("announces remaining time at 10-second thresholds", () => {
    const { container } = render(
      <Timer seconds={60} isRunning={true} onTimeUp={vi.fn()} />
    );

    const getAnnouncement = () => {
      const el = container.querySelector("[aria-live='polite']");
      return el?.textContent ?? "";
    };

    // Initial: no announcement (60s is the start, not a threshold to announce)
    expect(getAnnouncement()).toBe("");

    // Tick down to 50 seconds
    act(() => {
      vi.advanceTimersByTime(10000);
    });
    expect(getAnnouncement()).toBe("50 seconds remaining");

    // Tick down to 40 seconds
    act(() => {
      vi.advanceTimersByTime(10000);
    });
    expect(getAnnouncement()).toBe("40 seconds remaining");
  });

  it("does not announce at non-threshold seconds", () => {
    const { container } = render(
      <Timer seconds={60} isRunning={true} onTimeUp={vi.fn()} />
    );

    const getAnnouncement = () => {
      const el = container.querySelector("[aria-live='polite']");
      return el?.textContent ?? "";
    };

    // Tick down to 53 seconds (not a multiple of 10, not urgent)
    act(() => {
      vi.advanceTimersByTime(7000);
    });
    expect(getAnnouncement()).toBe("");

    // Tick down to 47 seconds (still not a threshold)
    act(() => {
      vi.advanceTimersByTime(6000);
    });
    expect(getAnnouncement()).toBe("");
  });

  it("announces each second as urgent in the last 5 seconds", () => {
    const { container } = render(
      <Timer seconds={10} isRunning={true} onTimeUp={vi.fn()} />
    );

    const getAnnouncement = () => {
      const el = container.querySelector("[aria-live='polite']");
      return el?.textContent ?? "";
    };

    // Tick down to 5 seconds (just entered urgent zone)
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(getAnnouncement()).toBe("5 seconds remaining — urgent");

    // 4 seconds
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(getAnnouncement()).toBe("4 seconds remaining — urgent");

    // 3 seconds
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(getAnnouncement()).toBe("3 seconds remaining — urgent");
  });

  it("announces 'Time\\'s up' when timer reaches zero", () => {
    const { container } = render(
      <Timer seconds={5} isRunning={true} onTimeUp={vi.fn()} />
    );

    const getAnnouncement = () => {
      const el = container.querySelector("[aria-live='polite']");
      return el?.textContent ?? "";
    };

    // Let timer expire
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(getAnnouncement()).toBe("Time's up");
  });

  it("clears announcement when timer resets via seconds prop change", () => {
    const { container, rerender } = render(
      <Timer seconds={10} isRunning={true} onTimeUp={vi.fn()} />
    );

    const getAnnouncement = () => {
      const el = container.querySelector("[aria-live='polite']");
      return el?.textContent ?? "";
    };

    // Tick into urgent zone
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(getAnnouncement()).toBe("5 seconds remaining — urgent");

    // Reset by changing seconds prop (simulates new hand)
    rerender(<Timer seconds={30} isRunning={true} onTimeUp={vi.fn()} />);

    // Announcement should be cleared — no stale "urgent" text
    expect(getAnnouncement()).toBe("");
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
