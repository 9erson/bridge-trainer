// ============================================================
// Scheduler utilities — yield control to the browser main thread
// Used by async hand generation to keep UI responsive
// ============================================================

// The scheduler.yield() API isn't in TypeScript's DOM types yet.
// Declare the minimal shape we need.
interface SchedulerAPI {
  yield: () => Promise<void>;
}

declare const scheduler: SchedulerAPI | undefined;

/**
 * Yield control back to the browser's task queue.
 *
 * Uses `scheduler.yield()` when available (lower latency, purpose-built
 * for this pattern) and falls back to `setTimeout(resolve, 0)` otherwise.
 */
export const yieldToMainThread: () => Promise<void> =
  typeof scheduler !== "undefined" &&
  scheduler !== null &&
  typeof scheduler.yield === "function"
    ? () => scheduler.yield()
    : () => new Promise(resolve => setTimeout(resolve, 0));
