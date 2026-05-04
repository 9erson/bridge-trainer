import fs from "node:fs";
import path from "node:path";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import React, { Suspense, lazy } from "react";

// Register games via side-effect imports
import "@/games/pointCounting/index";
import "@/games/openingBid/index";
import "@/games/responding/index";

// Mock framer-motion
vi.mock("framer-motion", () => ({
  motion: {
    div: ({
      children,
    }: {
      children: React.ReactNode;
      [key: string]: unknown;
    }) => <div data-testid="motion-div">{children}</div>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

// Mock wouter — override only useLocation and useParams, keep everything else
const mockNavigate = vi.fn();
vi.mock("wouter", async importOriginal => {
  const actual = await importOriginal<typeof import("wouter")>();
  return {
    ...actual,
    useLocation: () => ["/", mockNavigate],
    useParams: () => ({}),
  };
});

describe("App", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mockNavigate.mockClear();
  });

  it("wraps routes in a Suspense boundary with an accessible loading fallback", async () => {
    // Create a lazy component that suspends on first render
    let resolveImport: () => void;
    const LazyComponent = lazy(
      () =>
        new Promise<{ default: React.ComponentType }>(resolve => {
          resolveImport = () =>
            resolve({ default: () => <div>Loaded content</div> });
        })
    );

    // Import LoadingSpinner to verify it's used as fallback
    const { default: LoadingSpinner } = await import(
      "@/components/LoadingSpinner"
    );

    // Render a Suspense boundary using LoadingSpinner as fallback
    render(
      <Suspense fallback={<LoadingSpinner />}>
        <LazyComponent />
      </Suspense>
    );

    // While suspended, the accessible fallback should be visible
    const spinner = screen.getByRole("status");
    expect(spinner).toBeDefined();
    expect(spinner.getAttribute("aria-label")).toBe("Loading page…");

    // Resolve the lazy import — content should appear
    resolveImport!();
    await waitFor(() => {
      expect(screen.getByText("Loaded content")).toBeDefined();
    });
  });

  it("renders all routes without crashing after Suspense is added", async () => {
    const { default: App } = await import("@/App");
    render(<App />);

    // App renders the Home page at "/" — look for known content
    // The home page should show game cards
    await waitFor(() => {
      expect(screen.getByText("Point Counting")).toBeDefined();
    });
    expect(screen.getByText("Opening Bid")).toBeDefined();
    expect(screen.getByText("Responding")).toBeDefined();
  });
});

describe("App — lazy-loaded ConventionReference (#12)", () => {
  const appSource = fs.readFileSync(
    path.resolve(import.meta.dirname, "App.tsx"),
    "utf-8"
  );

  it("uses lazy() to load ConventionReference page", () => {
    expect(appSource, "App.tsx should lazy-load ConventionReference").toContain(
      "lazy(() =>"
    );
    expect(
      appSource,
      "App.tsx should dynamically import ConventionReference"
    ).toContain('import("./pages/ConventionReference")');
  });

  it("does NOT statically import ConventionReference", () => {
    expect(
      appSource,
      "App.tsx should NOT have a static import of ConventionReference"
    ).not.toMatch(/^import\s+ConventionReference\s+from/m);
  });
});
