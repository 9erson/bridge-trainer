import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import CardDisplay from "./CardDisplay";
import type { BridgeHand } from "@/lib/bridge";

// Minimal hand with one card in each suit to exercise MiniCard rendering
const graphicHand: BridgeHand = {
  cards: [
    { suit: "S", rank: "A" },
    { suit: "H", rank: "K" },
    { suit: "D", rank: "Q" },
    { suit: "C", rank: "J" },
  ],
};

describe("CardDisplay", () => {
  describe("MiniCard graphic mode", () => {
    it("uses the theme-aware bg-card class instead of hard-coded bg-white", () => {
      const { container } = render(
        <CardDisplay hand={graphicHand} mode="graphic" />
      );

      // Find all MiniCard divs (direct children of motion.div wrappers)
      const miniCards = container.querySelectorAll(
        ".rounded-md.border-border\\/60"
      );

      expect(miniCards.length).toBeGreaterThan(0);

      Array.from(miniCards).forEach(card => {
        expect(card.className).toContain("bg-card");
        expect(card.className).not.toContain("bg-white");
      });
    });

    it("scopes hover effects to hover-capable devices via mini-card class", () => {
      const { container } = render(
        <CardDisplay hand={graphicHand} mode="graphic" />
      );

      const miniCards = container.querySelectorAll(
        ".rounded-md.border-border\\/60"
      );

      expect(miniCards.length).toBeGreaterThan(0);

      Array.from(miniCards).forEach(card => {
        // Bare hover: classes stick on touch devices after tap.
        // Instead, the mini-card CSS class scopes hover effects
        // behind @media (hover: hover) so they only activate on
        // pointer devices.
        expect(card.className).not.toContain("hover:shadow-md");
        expect(card.className).not.toContain("hover:-translate-y-0.5");
        expect(card.classList.contains("mini-card")).toBe(true);
      });
    });
  });
});
