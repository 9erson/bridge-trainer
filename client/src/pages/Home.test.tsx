import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

// Register games via side-effect imports
import "@/games/pointCounting/index";
import "@/games/openingBid/index";
import "@/games/responding/index";

import * as gameRegistry from "@/lib/gameRegistry";

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
  AnimatePresence: ({
    children,
  }: {
    children: React.ReactNode;
  }) => <>{children}</>,
}));

// Mock wouter's useLocation for Home page
vi.mock("wouter", () => ({
  useLocation: () => ["/", vi.fn()],
}));

describe("Home page", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders a card for each registered game", async () => {
    const { default: Home } = await import("@/pages/Home");
    render(<Home />);

    expect(screen.getByText("Point Counting")).toBeDefined();
    expect(screen.getByText("Opening Bid")).toBeDefined();
    expect(screen.getByText("Responding")).toBeDefined();
  });

  it("does not call getAllGames on every render", async () => {
    const spy = vi.spyOn(gameRegistry, "getAllGames");

    const { default: Home } = await import("@/pages/Home");

    const { rerender } = render(<Home />);

    // Clear calls from module-load time
    spy.mockClear();

    // Re-render
    rerender(<Home />);

    // After hoisting, getAllGames should NOT be called during re-render
    expect(spy).not.toHaveBeenCalled();
  });
});
