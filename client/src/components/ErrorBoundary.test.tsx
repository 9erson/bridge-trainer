import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render } from "@testing-library/react";
import ErrorBoundary from "./ErrorBoundary";

// Component that throws during render to trigger the error boundary
function ThrowingComponent(): React.ReactNode {
  throw new Error("Test error for ErrorBoundary");
}

describe("ErrorBoundary", () => {
  // Suppress console.error from React's error boundary logging in test output
  const originalConsoleError = console.error;
  beforeEach(() => {
    console.error = (...args: unknown[]) => {
      if (
        typeof args[0] === "string" &&
        (args[0].includes("Test error") ||
          args[0].includes("The above error occurred"))
      ) {
        return;
      }
      originalConsoleError.call(console, ...args);
    };
  });
  afterEach(() => {
    console.error = originalConsoleError;
  });

  it("reload button has focus-visible ring for keyboard accessibility", () => {
    const { container } = render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>
    );

    const reloadButton = Array.from(container.querySelectorAll("button")).find(
      btn => btn.textContent?.includes("Reload Page")
    );

    expect(reloadButton).toBeTruthy();
    expect(reloadButton!.className).toContain("focus-visible:ring-2");
    expect(reloadButton!.className).toContain("focus-visible:ring-ring");
    expect(reloadButton!.className).toContain("focus-visible:ring-offset-2");
  });
});
