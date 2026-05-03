// ============================================================
// Bridge domain types and utilities
// Card Table Modernist theme — all bridge logic lives here
// ============================================================

export type Suit = 'S' | 'H' | 'D' | 'C';
export type Rank = 'A' | 'K' | 'Q' | 'J' | 'T' | '9' | '8' | '7' | '6' | '5' | '4' | '3' | '2';

export interface Card {
  suit: Suit;
  rank: Rank;
}

export interface BridgeHand {
  cards: Card[];
}

export type Vulnerability = 'none' | 'ns' | 'ew' | 'both';
export type SeatPosition = '1st' | '2nd' | '3rd' | '4th';

export const SUITS: Suit[] = ['S', 'H', 'D', 'C'];
export const RANKS: Rank[] = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];

export const SUIT_SYMBOLS: Record<Suit, string> = {
  S: '\u2660',
  H: '\u2665',
  D: '\u2666',
  C: '\u2663',
};

export const SUIT_NAMES: Record<Suit, string> = {
  S: 'Spades',
  H: 'Hearts',
  D: 'Diamonds',
  C: 'Clubs',
};

export const SUIT_COLORS: Record<Suit, string> = {
  S: '#1a1a2e',
  H: '#c0392b',
  D: '#c0392b',
  C: '#1a1a2e',
};

export const HCP_VALUES: Partial<Record<Rank, number>> = {
  A: 4,
  K: 3,
  Q: 2,
  J: 1,
};

// Calculate high card points for a hand
export function calculateHCP(hand: BridgeHand): number {
  return hand.cards.reduce((total, card) => total + (HCP_VALUES[card.rank] || 0), 0);
}

// Get suit length for a hand
export function getSuitLength(hand: BridgeHand, suit: Suit): number {
  return hand.cards.filter((c) => c.suit === suit).length;
}

// Get cards in a specific suit, sorted by rank
export function getCardsInSuit(hand: BridgeHand, suit: Suit): Card[] {
  return hand.cards
    .filter((c) => c.suit === suit)
    .sort((a, b) => RANKS.indexOf(a.rank) - RANKS.indexOf(b.rank));
}

// Check if hand is balanced (4-3-3-3, 4-4-3-2, or 5-3-3-2)
export function isBalanced(hand: BridgeHand): boolean {
  const lengths = SUITS.map((s) => getSuitLength(hand, s)).sort((a, b) => b - a);
  const pattern = lengths.join('');
  return pattern === '4333' || pattern === '4432' || pattern === '5332';
}

// Check if hand is semi-balanced (includes 5-4-2-2, 6-3-2-2)
export function isSemiBalanced(hand: BridgeHand): boolean {
  if (isBalanced(hand)) return true;
  const lengths = SUITS.map((s) => getSuitLength(hand, s)).sort((a, b) => b - a);
  const pattern = lengths.join('');
  return pattern === '5422' || pattern === '6322';
}

// Get the longest suit(s) in a hand
export function getLongestSuits(hand: BridgeHand): Suit[] {
  const lengths = SUITS.map((s) => ({ suit: s, length: getSuitLength(hand, s) }));
  const maxLen = Math.max(...lengths.map((l) => l.length));
  return lengths.filter((l) => l.length === maxLen).map((l) => l.suit);
}

// Get distribution pattern sorted descending
export function getDistribution(hand: BridgeHand): number[] {
  return SUITS.map((s) => getSuitLength(hand, s)).sort((a, b) => b - a);
}

// Generate a random 13-card hand from a full deck
export function generateRandomHand(): BridgeHand {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ suit, rank });
    }
  }

  // Fisher-Yates shuffle
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  return { cards: deck.slice(0, 13) };
}

// Format a hand as text (e.g., ♠ AKJ4 ♥ Q93 ♦ T72 ♣ 85)
export function formatHandText(hand: BridgeHand): string {
  return SUITS.map((suit) => {
    const cards = getCardsInSuit(hand, suit);
    const ranks = cards.map((c) => c.rank).join('');
    return `${SUIT_SYMBOLS[suit]} ${ranks || '—'}`;
  }).join('  ');
}

// Get rank display value
export function getRankDisplay(rank: Rank): string {
  return rank === 'T' ? '10' : rank;
}

// Generate multiple choice options for HCP
export function generateHCPChoices(correctAnswer: number, count: number = 5): number[] {
  const choices = new Set<number>([correctAnswer]);
  const minHCP = 0;
  const maxHCP = 37;

  while (choices.size < count) {
    // Generate nearby values with some randomness
    const offset = Math.floor(Math.random() * 7) - 3; // -3 to +3
    const candidate = Math.max(minHCP, Math.min(maxHCP, correctAnswer + offset));
    if (candidate !== correctAnswer) {
      choices.add(candidate);
    }
  }

  return Array.from(choices).sort((a, b) => a - b);
}
