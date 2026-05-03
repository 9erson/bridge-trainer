// ============================================================
// CardDisplay — renders a bridge hand in text or graphic mode
// Card Table Modernist: clean SVG cards, grouped by suit
// ============================================================

import {
  type BridgeHand,
  type Card,
  type Rank,
  type Suit,
  SUITS,
  SUIT_SYMBOLS,
  SUIT_COLORS,
  SUIT_NAMES,
  getCardsInSuit,
  getRankDisplay,
} from "@/lib/bridge";
import { motion } from "framer-motion";

// Rank-to-name mapping for screen reader announcements
const RANK_NAMES: Record<Rank, string> = {
  A: "Ace",
  K: "King",
  Q: "Queen",
  J: "Jack",
  T: "10",
  "9": "9",
  "8": "8",
  "7": "7",
  "6": "6",
  "5": "5",
  "4": "4",
  "3": "3",
  "2": "2",
};

/** Describe a single card in natural language (e.g. "Ace of Spades") */
function getCardDescription(card: Card): string {
  return `${RANK_NAMES[card.rank]} of ${SUIT_NAMES[card.suit]}`;
}

/** Generate a full hand summary for screen readers (e.g. "Hand: Ace of Spades, King of Hearts, …") */
function getHandSummary(hand: BridgeHand): string {
  const descriptions: string[] = [];
  for (const suit of SUITS) {
    const cards = getCardsInSuit(hand, suit);
    for (const card of cards) {
      descriptions.push(getCardDescription(card));
    }
  }
  return `Hand: ${descriptions.join(", ")}`;
}

interface CardDisplayProps {
  hand: BridgeHand;
  mode: "text" | "graphic";
}

export default function CardDisplay({ hand, mode }: CardDisplayProps) {
  const display =
    mode === "text" ? (
      <TextDisplay hand={hand} />
    ) : (
      <GraphicDisplay hand={hand} />
    );

  return (
    <div>
      <div className="sr-only">{getHandSummary(hand)}</div>
      <div aria-hidden="true">{display}</div>
    </div>
  );
}

function TextDisplay({ hand }: { hand: BridgeHand }) {
  return (
    <div className="space-y-2">
      {SUITS.map(suit => {
        const cards = getCardsInSuit(hand, suit);
        return (
          <div key={suit} className="flex items-center gap-2">
            <span
              className="text-2xl font-bold w-8 text-center leading-none"
              style={{ color: SUIT_COLORS[suit] }}
            >
              {SUIT_SYMBOLS[suit]}
            </span>
            <span className="font-mono text-lg tracking-wider text-foreground">
              {cards.length > 0
                ? cards.map(c => getRankDisplay(c.rank)).join(" ")
                : "—"}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function GraphicDisplay({ hand }: { hand: BridgeHand }) {
  return (
    <div className="space-y-3">
      {SUITS.map(suit => {
        const cards = getCardsInSuit(hand, suit);
        return (
          <div key={suit} className="flex items-center gap-1.5 flex-wrap">
            {cards.length > 0 ? (
              cards.map((card, i) => (
                <motion.div
                  key={`${card.suit}${card.rank}`}
                  initial={{ opacity: 0, y: 8, rotateY: 90 }}
                  animate={{ opacity: 1, y: 0, rotateY: 0 }}
                  transition={{ delay: i * 0.03, duration: 0.25 }}
                >
                  <MiniCard
                    suit={card.suit}
                    rank={getRankDisplay(card.rank)}
                    ariaLabel={getCardDescription(card)}
                  />
                </motion.div>
              ))
            ) : (
              <span className="text-muted-foreground text-sm italic ml-1">
                void
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

function MiniCard({
  suit,
  rank,
  ariaLabel,
}: {
  suit: Suit;
  rank: string;
  ariaLabel: string;
}) {
  const color = SUIT_COLORS[suit];
  const symbol = SUIT_SYMBOLS[suit];

  return (
    <div
      role="img"
      aria-label={ariaLabel}
      className="mini-card relative w-10 h-14 rounded-md border border-border/60 bg-card shadow-sm
                 flex flex-col items-center justify-center select-none
                 transition-all duration-150"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <span className="text-xs font-bold leading-none" style={{ color }}>
        {rank}
      </span>
      <span className="text-sm leading-none mt-0.5" style={{ color }}>
        {symbol}
      </span>
    </div>
  );
}
