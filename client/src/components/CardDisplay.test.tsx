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

describe("CardDisplay — screen reader accessibility (#41)", () => {
  it("has a visually-hidden hand summary describing all cards", () => {
    const { container } = render(
      <CardDisplay hand={graphicHand} mode="graphic" />
    );

    const summary = container.querySelector(".sr-only");
    expect(summary).toBeTruthy();
    expect(summary!.textContent).toContain("Ace of Spades");
    expect(summary!.textContent).toContain("King of Hearts");
    expect(summary!.textContent).toContain("Queen of Diamonds");
    expect(summary!.textContent).toContain("Jack of Clubs");
  });

  it("does not mention void suits in the hand summary", () => {
    // Hand with only spades — hearts, diamonds, clubs are void
    const spadesOnlyHand: BridgeHand = {
      cards: [
        { suit: "S", rank: "A" },
        { suit: "S", rank: "K" },
      ],
    };

    const { container } = render(
      <CardDisplay hand={spadesOnlyHand} mode="graphic" />
    );

    const summary = container.querySelector(".sr-only");
    expect(summary!.textContent).toBe("Hand: Ace of Spades, King of Spades");
    expect(summary!.textContent).not.toContain("void");
    expect(summary!.textContent).not.toContain("Hearts");
  });

  it('renders rank "T" as "10" in the hand summary', () => {
    const handWithTen: BridgeHand = {
      cards: [{ suit: "H", rank: "T" }],
    };

    const { container } = render(
      <CardDisplay hand={handWithTen} mode="graphic" />
    );

    const summary = container.querySelector(".sr-only");
    expect(summary!.textContent).toContain("10 of Hearts");
    expect(summary!.textContent).not.toContain("T of Hearts");
  });

  it("gives each MiniCard role=img and a descriptive aria-label", () => {
    const { container } = render(
      <CardDisplay hand={graphicHand} mode="graphic" />
    );

    const cards = container.querySelectorAll(".mini-card");
    expect(cards.length).toBe(4);

    const labels = Array.from(cards).map(
      c => c.getAttribute("aria-label") ?? ""
    );
    expect(labels).toEqual([
      "Ace of Spades",
      "King of Hearts",
      "Queen of Diamonds",
      "Jack of Clubs",
    ]);

    cards.forEach(card => {
      expect(card.getAttribute("role")).toBe("img");
    });
  });

  it("hides the visual graphic display from screen readers with aria-hidden", () => {
    const { container } = render(
      <CardDisplay hand={graphicHand} mode="graphic" />
    );

    // The visual wrapper (sibling of the sr-only summary) should be aria-hidden
    const hiddenWrapper = container.querySelector('[aria-hidden="true"]');
    expect(hiddenWrapper).toBeTruthy();

    // The visual wrapper should contain the mini-cards (not the sr-only div)
    const miniCards = hiddenWrapper!.querySelectorAll(".mini-card");
    expect(miniCards.length).toBe(4);
  });

  it("has the same sr-only hand summary in text mode", () => {
    const { container } = render(
      <CardDisplay hand={graphicHand} mode="text" />
    );

    const summary = container.querySelector(".sr-only");
    expect(summary).toBeTruthy();
    expect(summary!.textContent).toBe(
      "Hand: Ace of Spades, King of Hearts, Queen of Diamonds, Jack of Clubs"
    );
  });

  it("hides the visual text display from screen readers with aria-hidden", () => {
    const { container } = render(
      <CardDisplay hand={graphicHand} mode="text" />
    );

    const hiddenWrapper = container.querySelector('[aria-hidden="true"]');
    expect(hiddenWrapper).toBeTruthy();

    // Text display should NOT contain mini-cards (that's graphic mode)
    const miniCards = hiddenWrapper!.querySelectorAll(".mini-card");
    expect(miniCards.length).toBe(0);

    // But it should contain suit symbols
    const spans = hiddenWrapper!.querySelectorAll("span");
    expect(spans.length).toBeGreaterThan(0);
  });

  it("lists cards in suit order (Spades, Hearts, Diamonds, Clubs)", () => {
    // Hand with cards in reverse suit order to verify ordering
    const mixedHand: BridgeHand = {
      cards: [
        { suit: "C", rank: "2" },
        { suit: "D", rank: "3" },
        { suit: "H", rank: "4" },
        { suit: "S", rank: "5" },
      ],
    };

    const { container } = render(
      <CardDisplay hand={mixedHand} mode="graphic" />
    );

    const summary = container.querySelector(".sr-only");
    expect(summary!.textContent).toBe(
      "Hand: 5 of Spades, 4 of Hearts, 3 of Diamonds, 2 of Clubs"
    );
  });

  it("sorts multiple cards within the same suit by rank", () => {
    const multiCardHand: BridgeHand = {
      cards: [
        { suit: "S", rank: "5" },
        { suit: "S", rank: "A" },
        { suit: "S", rank: "K" },
      ],
    };

    const { container } = render(
      <CardDisplay hand={multiCardHand} mode="graphic" />
    );

    const summary = container.querySelector(".sr-only");
    // getCardsInSuit sorts high to low (A, K, 5)
    expect(summary!.textContent).toBe(
      "Hand: Ace of Spades, King of Spades, 5 of Spades"
    );
  });
});

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

  describe("React.memo optimization (#18)", () => {
    it("CardDisplay is wrapped in React.memo (type check)", () => {
      // React.memo components have a $$typeof of Symbol(react.memo)
      // and their .type property is the inner function
      expect(typeof CardDisplay).toBe("object");
      expect(CardDisplay.$$typeof).toBeTruthy();
    });

    it("CardDisplay preserves DOM nodes when parent re-renders with identical props", () => {
      const { container, rerender } = render(
        <CardDisplay hand={graphicHand} mode="graphic" />
      );

      const miniCardsBefore = container.querySelectorAll(".mini-card");
      expect(miniCardsBefore.length).toBe(4);

      // Force re-render with the same hand and mode references
      rerender(<CardDisplay hand={graphicHand} mode="graphic" />);

      const miniCardsAfter = container.querySelectorAll(".mini-card");
      expect(miniCardsAfter.length).toBe(4);

      // DOM nodes should be the exact same objects (not recreated)
      for (let i = 0; i < miniCardsBefore.length; i++) {
        expect(miniCardsBefore[i]).toBe(miniCardsAfter[i]);
      }
    });

    it("CardDisplay re-renders when hand prop changes", () => {
      const { container, rerender } = render(
        <CardDisplay hand={graphicHand} mode="graphic" />
      );

      expect(container.querySelectorAll(".mini-card").length).toBe(4);

      const newHand: BridgeHand = {
        cards: [{ suit: "H", rank: "7" }],
      };
      rerender(<CardDisplay hand={newHand} mode="graphic" />);

      expect(container.querySelectorAll(".mini-card").length).toBe(1);
    });

    it("CardDisplay re-renders when mode prop changes", () => {
      const { container, rerender } = render(
        <CardDisplay hand={graphicHand} mode="text" />
      );

      expect(container.querySelectorAll(".mini-card").length).toBe(0);

      rerender(<CardDisplay hand={graphicHand} mode="graphic" />);

      expect(container.querySelectorAll(".mini-card").length).toBe(4);
    });
  });
});
