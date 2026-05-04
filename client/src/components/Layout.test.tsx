import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import fs from "node:fs";
import path from "node:path";

// We need to register at least one game so the Layout has nav items to render.
// Import game modules for their side-effect registrations.
import "@/games/pointCounting/index";
import "@/games/openingBid/index";
import "@/games/responding/index";

// Spy on getAllGames AFTER game modules register (so spy doesn't block registration)
import * as gameRegistry from "@/lib/gameRegistry";

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
  AnimatePresence: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

// Simple wrapper providing wouter context
import { Route, Switch } from "wouter";
function TestWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Switch>
      <Route>{children}</Route>
    </Switch>
  );
}

const layoutSource = fs.readFileSync(
  path.resolve(import.meta.dirname, "Layout.tsx"),
  "utf-8"
);

describe("Layout", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders navigation links for all registered games", async () => {
    const { default: Layout } = await import("@/components/Layout");
    render(
      <TestWrapper>
        <Layout>Test content</Layout>
      </TestWrapper>
    );

    // Core nav items that always exist (appear in both desktop sidebar and
    // mobile nav, so use getAllByText)
    expect(screen.getAllByText("Games").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("History").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Reference").length).toBeGreaterThanOrEqual(1);

    // Game nav items (registered via side-effect imports)
    expect(screen.getAllByText("Point Counting").length).toBeGreaterThanOrEqual(
      1
    );
    expect(screen.getAllByText("Opening Bid").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Responding").length).toBeGreaterThanOrEqual(1);

    // Children are rendered
    expect(screen.getByText("Test content")).toBeDefined();
  });

  it("hamburger button has touch target of at least 44x44px", async () => {
    const { default: Layout } = await import("@/components/Layout");
    render(
      <TestWrapper>
        <Layout>Test content</Layout>
      </TestWrapper>
    );

    // The mobile hamburger is the only <button> in the mobile header
    const hamburger = document.querySelector<HTMLButtonElement>(
      '[data-slot="button"]'
    );
    expect(hamburger).not.toBeNull();

    // jsdom doesn't resolve Tailwind classes to pixel values,
    // so verify the min-size utility classes are present on the element.
    // min-h-[44px] and min-w-[44px] ensure WCAG 2.5.8 compliance.
    const classList = Array.from(hamburger!.classList);
    const hasMinHeight44 = classList.some(
      c => c === "min-h-[44px]" || c === "min-h-11"
    );
    const hasMinWidth44 = classList.some(
      c => c === "min-w-[44px]" || c === "min-w-11"
    );

    expect(hasMinHeight44).toBe(true);
    expect(hasMinWidth44).toBe(true);
  });

  it("hamburger button has aria-label and aria-expanded attributes", async () => {
    const { default: Layout } = await import("@/components/Layout");
    render(
      <TestWrapper>
        <Layout>Test content</Layout>
      </TestWrapper>
    );

    // The mobile hamburger is the only <button> in the mobile header
    const hamburger = document.querySelector<HTMLButtonElement>(
      '[data-slot="button"]'
    );
    expect(hamburger).not.toBeNull();
    expect(hamburger!.getAttribute("aria-label")).toBe("Toggle sidebar");
    expect(hamburger!.getAttribute("aria-expanded")).toBe("false");
  });

  it("desktop sidebar has aria-label for accessible name", async () => {
    const { default: Layout } = await import("@/components/Layout");
    render(
      <TestWrapper>
        <Layout>Test content</Layout>
      </TestWrapper>
    );

    const aside = document.querySelector("aside");
    expect(aside).not.toBeNull();
    expect(aside!.getAttribute("aria-label")).toBe("Sidebar navigation");
  });

  it("desktop nav element has descriptive aria-label", async () => {
    const { default: Layout } = await import("@/components/Layout");
    render(
      <TestWrapper>
        <Layout>Test content</Layout>
      </TestWrapper>
    );

    // Desktop nav is always rendered; mobile nav is conditionally rendered
    const nav = document.querySelector("nav");
    expect(nav).not.toBeNull();
    expect(nav!.getAttribute("aria-label")).toBe("Main navigation");
  });

  it("does not call getAllGames on every render", async () => {
    const spy = vi.spyOn(gameRegistry, "getAllGames");

    const { default: Layout } = await import("@/components/Layout");

    const { rerender: rerenderLayout } = render(
      <TestWrapper>
        <Layout>First render</Layout>
      </TestWrapper>
    );

    // Clear any calls from initial module-load + first render
    spy.mockClear();

    // Re-render the Layout component
    rerenderLayout(
      <TestWrapper>
        <Layout>Second render</Layout>
      </TestWrapper>
    );

    // After hoisting, getAllGames should NOT be called during re-render
    // If still called inside component body, this will be > 0
    expect(spy).not.toHaveBeenCalled();

    // Verify the re-rendered content is still correct
    expect(screen.getByText("Second render")).toBeDefined();
  });
});

describe("Layout — layout thrashing fix (#17)", () => {
  it("mobile nav animation does not use height: 'auto' (causes forced reflows)", () => {
    expect(
      layoutSource,
      "Layout mobile nav should NOT animate height:'auto'"
    ).not.toContain('height: "auto"');
  });

  it("mobile nav animation uses grid-template-rows instead of height", () => {
    expect(
      layoutSource,
      "Layout mobile nav should use grid-template-rows for collapse animation"
    ).toContain("gridTemplateRows");
  });

  it("mobile nav animation wrapper uses display: grid", () => {
    expect(
      layoutSource,
      "Layout mobile nav container should use display:grid for grid-template-rows animation"
    ).toMatch(/display:\s*["']?grid["']?/);
  });
});
