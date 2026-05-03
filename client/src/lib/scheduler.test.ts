import { describe, it, expect, vi, afterEach } from "vitest";

describe("yieldToMainThread", () => {
  // Save original globals so we can restore them
  const originalSetTimeout = globalThis.setTimeout;

  afterEach(() => {
    // Restore after each test
    vi.restoreAllMocks();
    // Reset any module-level caching by re-importing
  });

  it("returns a Promise that resolves", async () => {
    const { yieldToMainThread } = await import("./scheduler");
    const result = yieldToMainThread();
    expect(result).toBeInstanceOf(Promise);
    await result;
  });

  it("calls setTimeout when scheduler.yield is unavailable", async () => {
    const spy = vi
      .spyOn(globalThis, "setTimeout")
      .mockImplementation((cb: TimerHandler) => {
        if (typeof cb === "function") cb();
        return 0 as unknown as ReturnType<typeof setTimeout>;
      });

    // Force re-import to pick up the fallback path
    vi.resetModules();
    const { yieldToMainThread } = await import("./scheduler");
    await yieldToMainThread();

    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});
