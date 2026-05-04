import { describe, it, expect, vi, beforeEach } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { render, screen, fireEvent } from "@testing-library/react";
import { Route, Switch } from "wouter";

// Read the source files to verify design-system compliance (pattern from History.test.tsx)
const notFoundSource = readFileSync(
  resolve(import.meta.dirname, "NotFound.tsx"),
  "utf-8"
);

const bridgeCardFanSource = readFileSync(
  resolve(import.meta.dirname, "../components/BridgeCardFan.tsx"),
  "utf-8"
);

// Mock wouter's useLocation so we can spy on navigation
const mockSetLocation = vi.fn();
vi.mock("wouter", async () => {
  const actual = await vi.importActual<typeof import("wouter")>("wouter");
  return {
    ...actual,
    useLocation: () => ["/nonexistent", mockSetLocation],
  };
});

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

// Import game modules for side-effect registrations (Layout needs them)
import "@/games/pointCounting/index";
import "@/games/openingBid/index";
import "@/games/responding/index";

describe("NotFound — design system compliance (#22)", () => {
  it("does not contain hard-coded slate color classes", () => {
    expect(notFoundSource).not.toContain("from-slate-");
    expect(notFoundSource).not.toContain("to-slate-");
    expect(notFoundSource).not.toContain("text-slate-");
    expect(notFoundSource).not.toContain("bg-slate-");
  });

  it("does not contain hard-coded blue button color classes", () => {
    expect(notFoundSource).not.toContain("bg-blue-");
    expect(notFoundSource).not.toContain("hover:bg-blue-");
  });

  it("does not contain glassmorphism classes", () => {
    expect(notFoundSource).not.toContain("backdrop-blur-");
    expect(notFoundSource).not.toContain("bg-white/80");
    expect(notFoundSource).not.toContain("border-0");
  });

  it("does not contain animate-pulse decoration", () => {
    expect(notFoundSource).not.toContain("animate-pulse");
  });

  it("does not contain hard-coded red circle decoration", () => {
    expect(notFoundSource).not.toContain("bg-red-100");
  });

  it("uses design-system bg-background token instead of gradient", () => {
    expect(notFoundSource).toContain("bg-background");
  });

  it("uses design-system text-foreground token instead of slate-900/700", () => {
    expect(notFoundSource).toContain("text-foreground");
  });

  it("uses design-system text-muted-foreground token for body text", () => {
    expect(notFoundSource).toContain("text-muted-foreground");
  });
});

describe("NotFound — bridge-themed visual element (#24)", () => {
  it("renders a decorative SVG element with aria-hidden", async () => {
    const { default: NotFound } = await import("@/pages/NotFound");
    const { container } = render(
      <Switch>
        <Route>{() => <NotFound />}</Route>
      </Switch>
    );

    const svg = container.querySelector(
      'svg[aria-hidden="true"]'
    ) as SVGSVGElement;
    expect(svg).not.toBeNull();
    expect(svg.getAttribute("role")).toBe("presentation");
  });

  it("renders all four suit symbols inside the SVG", async () => {
    const { default: NotFound } = await import("@/pages/NotFound");
    const { container } = render(
      <Switch>
        <Route>{() => <NotFound />}</Route>
      </Switch>
    );

    const svg = container.querySelector(
      'svg[aria-hidden="true"]'
    ) as SVGSVGElement;
    const textContent = svg.textContent ?? "";
    expect(textContent).toContain("♠");
    expect(textContent).toContain("♥");
    expect(textContent).toContain("♦");
    expect(textContent).toContain("♣");
  });

  it("uses CSS custom properties for suit colors, not hard-coded hex", () => {
    expect(bridgeCardFanSource).toContain("var(--suit-black)");
    expect(bridgeCardFanSource).toContain("var(--suit-red)");
    expect(bridgeCardFanSource).toContain("var(--card)");
    expect(bridgeCardFanSource).toContain("var(--border)");
    // No hard-coded hex colors in the SVG
    expect(bridgeCardFanSource).not.toContain('fill="#');
    expect(bridgeCardFanSource).not.toContain('stroke="#');
  });

  it("does not import AlertCircle (replaced by bridge card fan)", () => {
    expect(notFoundSource).not.toContain("AlertCircle");
  });
});

describe("NotFound — navigation", () => {
  beforeEach(() => {
    mockSetLocation.mockClear();
  });

  it('clicking "Go Home" button calls setLocation with "/"', async () => {
    const { default: NotFound } = await import("@/pages/NotFound");
    render(
      <Switch>
        <Route>{() => <NotFound />}</Route>
      </Switch>
    );

    const goHomeButton = screen.getByRole("button", { name: /go home/i });
    expect(goHomeButton).toBeDefined();

    fireEvent.click(goHomeButton);
    expect(mockSetLocation).toHaveBeenCalledWith("/");
  });
});
