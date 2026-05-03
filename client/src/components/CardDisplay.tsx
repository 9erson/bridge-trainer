// ============================================================
// CardDisplay — renders a bridge hand in text or graphic mode
// Card Table Modernist: clean SVG cards, grouped by suit
// ============================================================

import {
  type BridgeHand,
  type Suit,
  SUITS,
  SUIT_SYMBOLS,
  SUIT_COLORS,
  getCardsInSuit,
  getRankDisplay,
} from "@/lib/bridge";
import { motion } from "framer-motion";

interface CardDisplayProps {
  hand: BridgeHand;
  mode: "text" | "graphic";
}

export default function CardDisplay({ hand, mode }: CardDisplayProps) {
  if (mode === "text") {
    return <TextDisplay hand={hand} />;
  }
  return <GraphicDisplay hand={hand} />;
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
                  <MiniCard suit={card.suit} rank={getRankDisplay(card.rank)} />
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

function MiniCard({ suit, rank }: { suit: Suit; rank: string }) {
  const color = SUIT_COLORS[suit];
  const symbol = SUIT_SYMBOLS[suit];

  return (
    <div
      className="relative w-10 h-14 rounded-md border border-border/60 bg-card shadow-sm
                 flex flex-col items-center justify-center select-none
                 hover:shadow-md hover:-translate-y-0.5 transition-all duration-150"
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
