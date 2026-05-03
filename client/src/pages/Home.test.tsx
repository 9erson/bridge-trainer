import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

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
  AnimatePresence: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

// Shared mock navigate so tests can assert calls
const mockNavigate = vi.fn();

// Mock wouter's useLocation for Home page
vi.mock("wouter", () => ({
  useLocation: () => ["/", mockNavigate],
}));

describe("Home page", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mockNavigate.mockClear();
  });

  it("renders a card for each registered game", async () => {
    const { default: Home } = await import("@/pages/Home");
    render(<Home />);

    expect(screen.getByText("Point Counting")).toBeDefined();
    expect(screen.getByText("Opening Bid")).toBeDefined();
    expect(screen.getByText("Responding")).toBeDefined();
  });

  it("renders the hero image with explicit width and height to prevent CLS", async () => {
    const { default: Home } = await import("@/pages/Home");
    const { container } = render(<Home />);

    const heroImg = container.querySelector(
      'img[alt="Bridge card table"]'
    ) as HTMLImageElement;
    expect(heroImg).not.toBeNull();
    expect(heroImg.hasAttribute("width")).toBe(true);
    expect(heroImg.hasAttribute("height")).toBe(true);
  });

  it("lazy-loads game card icon images", async () => {
    const { default: Home } = await import("@/pages/Home");
    const { container } = render(<Home />);

    // Game icons are images inside CardContent that are NOT the hero
    const heroImg = container.querySelector(
      'img[alt="Bridge card table"]'
    ) as HTMLImageElement;
    const allImgs = Array.from(container.querySelectorAll("img"));
    const iconImgs = allImgs.filter(img => img !== heroImg);

    expect(iconImgs.length).toBeGreaterThan(0);
    for (const img of iconImgs) {
      expect(img.getAttribute("loading")).toBe("lazy");
    }
  });

  it("game cards are keyboard-focusable with role=button", async () => {
    const { default: Home } = await import("@/pages/Home");
    const { container } = render(<Home />);

    const cards = Array.from(container.querySelectorAll('[data-slot="card"]'));
    expect(cards.length).toBeGreaterThan(0);

    for (const card of cards) {
      expect(card.getAttribute("role")).toBe("button");
      expect(card.getAttribute("tabindex")).toBe("0");
    }
  });

  it("game cards navigate on Enter and Space key press", async () => {
    const { default: Home } = await import("@/pages/Home");
    const { container } = render(<Home />);

    const cards = container.querySelectorAll('[data-slot="card"]');
    const firstCard = cards[0] as HTMLElement;

    // Enter key activates navigation
    fireEvent.keyDown(firstCard, { key: "Enter" });
    expect(mockNavigate).toHaveBeenCalledTimes(1);

    mockNavigate.mockClear();

    // Space key activates navigation
    fireEvent.keyDown(firstCard, { key: " " });
    expect(mockNavigate).toHaveBeenCalledTimes(1);
  });

  it("game cards have descriptive aria-labels for screen readers", async () => {
    const { default: Home } = await import("@/pages/Home");
    const { container } = render(<Home />);

    const cards = Array.from(container.querySelectorAll('[data-slot="card"]'));
    expect(cards.length).toBeGreaterThan(0);

    for (const card of cards) {
      const label = card.getAttribute("aria-label");
      expect(label).toContain("Play");
    }
  });

  it("game cards have focus-visible ring styles for keyboard users", async () => {
    const { default: Home } = await import("@/pages/Home");
    const { container } = render(<Home />);

    const cards = Array.from(container.querySelectorAll('[data-slot="card"]'));
    expect(cards.length).toBeGreaterThan(0);

    for (const card of cards) {
      expect(card.className).toContain("focus-visible:ring-2");
      expect(card.className).toContain("focus-visible:ring-ring");
      expect(card.className).toContain("focus-visible:ring-offset-2");
    }
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
