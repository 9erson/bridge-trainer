// ============================================================
// Convention Quick Reference — concise cheat-sheets for
// SAYC, 2/1 Game Forcing, and Precision Club.
// Sources: ACBL SAYC booklet, Wikipedia, kwbridge.com, zaremba.ch
// Card Table Modernist theme
// ============================================================

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

// ---- Data ----

interface ConventionRef {
  id: string;
  name: string;
  tagline: string;
  source: string;
  sourceUrl: string;
  openingBids: { bid: string; hcp: string; description: string }[];
  keyRules: string[];
  keyConventions: { name: string; description: string }[];
  differences?: string[];
}

const conventions: ConventionRef[] = [
  {
    id: 'sayc',
    name: 'Standard American (SAYC)',
    tagline: 'The ACBL default system — 5-card majors, strong NT, strong 2♣.',
    source: 'ACBL Standard American Yellow Card',
    sourceUrl: 'https://web2.acbl.org/documentlibrary/play/SP3%20(bk)%20single%20pages.pdf',
    openingBids: [
      { bid: '1♣', hcp: '12–21', description: '3+ clubs (open with 4-4 minors if diamonds < 4)' },
      { bid: '1♦', hcp: '12–21', description: '4+ diamonds (or 4-4-3-2 with 4♦)' },
      { bid: '1♥', hcp: '12–21', description: '5+ hearts' },
      { bid: '1♠', hcp: '12–21', description: '5+ spades (bid higher suit first with 5-5)' },
      { bid: '1NT', hcp: '15–17', description: 'Balanced (may include 5-card minor)' },
      { bid: '2♣', hcp: '22+', description: 'Artificial, strong, forcing' },
      { bid: '2♦/♥/♠', hcp: '5–11', description: 'Weak two — 6-card suit' },
      { bid: '2NT', hcp: '20–21', description: 'Balanced' },
      { bid: '3x', hcp: '5–10', description: 'Preempt — 7-card suit (Rule of 2/3/4)' },
      { bid: '3NT', hcp: '25–27', description: 'Balanced' },
    ],
    keyRules: [
      'Open the higher of two 5+ card suits of equal length.',
      'With 4-4 in minors, open 1♦.',
      'Notrump openings may contain a 5-card minor (or major for 2NT/3NT).',
      '5-card major required for 1♥/1♠ opening.',
    ],
    keyConventions: [
      { name: 'Stayman', description: '2♣ over 1NT asks for 4-card major.' },
      { name: 'Jacoby Transfers', description: '2♦ → hearts, 2♥ → spades (over 1NT).' },
      { name: 'Jacoby 2NT', description: 'Game-forcing raise of partner\'s major (13+ HCP, 4+ support).' },
      { name: 'Blackwood', description: '4NT asks for aces (5♣=0/4, 5♦=1, 5♥=2, 5♠=3).' },
      { name: 'Gerber', description: '4♣ asks for aces (over NT openings).' },
      { name: 'Negative Doubles', description: 'Takeout double by responder after opponent overcall (up to 2♠).' },
    ],
  },
  {
    id: '2over1',
    name: 'Two Over One (2/1 GF)',
    tagline: 'Based on SAYC — a 2-level new-suit response is game-forcing.',
    source: 'Wikipedia / Max Hardy / Audrey Grant & Eric Rodwell',
    sourceUrl: 'https://en.wikipedia.org/wiki/2/1_game_forcing',
    openingBids: [
      { bid: '1♣', hcp: '12–21', description: '3+ clubs (same as SAYC)' },
      { bid: '1♦', hcp: '12–21', description: '4+ diamonds (same as SAYC)' },
      { bid: '1♥', hcp: '12–21', description: '5+ hearts (same as SAYC)' },
      { bid: '1♠', hcp: '12–21', description: '5+ spades (same as SAYC)' },
      { bid: '1NT', hcp: '15–17', description: 'Balanced (same as SAYC)' },
      { bid: '2♣', hcp: '22+', description: 'Artificial, strong, forcing (same as SAYC)' },
      { bid: '2♦/♥/♠', hcp: '5–11', description: 'Weak two — 6-card suit (same as SAYC)' },
      { bid: '2NT', hcp: '20–21', description: 'Balanced (same as SAYC)' },
      { bid: '3x', hcp: '5–10', description: 'Preempt — 7-card suit (same as SAYC)' },
    ],
    keyRules: [
      'Opening bids are identical to SAYC.',
      'A non-jump 2-level new-suit response to a 1-level opening is GAME FORCING.',
      '1NT response to a major opening is FORCING for one round (not in SAYC).',
      '2/1 GF does NOT apply to passed hands or after opponent interference.',
      'The 2/1 auctions: 1♦-2♣, 1♥-2♣, 1♥-2♦, 1♠-2♣, 1♠-2♦, 1♠-2♥.',
    ],
    keyConventions: [
      { name: 'Forcing 1NT', description: 'Response to 1♥/1♠ is forcing one round; used for weaker hands or hands with long lower suits.' },
      { name: 'Bergen Raises', description: '3♣ = 4+ support, 7–9 pts; 3♦ = 4+ support, 10–12 pts (over major).' },
      { name: 'Inverted Minors', description: 'Single raise of minor = strong/forcing; jump raise = weak/preemptive.' },
      { name: 'Jacoby 2NT', description: 'Game-forcing raise of major (13+ HCP, 4+ support).' },
      { name: 'Splinter Bids', description: 'Double-jump shift = game-forcing raise with singleton/void in bid suit.' },
      { name: 'New Minor Forcing', description: 'After 1m-1M-1NT, bid of other minor is artificial and forcing.' },
    ],
    differences: [
      'SAYC: 2-level response = 10+ HCP, forcing one round (not to game).',
      '2/1: 2-level response = 13+ HCP, forcing to game.',
      'SAYC: 1NT response to major = 6–9 HCP, non-forcing.',
      '2/1: 1NT response to major = forcing one round (6–12 HCP).',
    ],
  },
  {
    id: 'precision',
    name: 'Precision Club',
    tagline: 'Strong club system — 1♣ shows 16+ HCP, all other openings are limited.',
    source: 'Wikipedia / C.C. Wei / Zaremba cheat sheet',
    sourceUrl: 'https://en.wikipedia.org/wiki/Precision_Club',
    openingBids: [
      { bid: '1♣', hcp: '16+', description: 'ARTIFICIAL — any distribution, strong forcing' },
      { bid: '1♦', hcp: '11–15', description: 'Catch-all: 2+ diamonds, no 5-card major, not balanced 13–15' },
      { bid: '1♥', hcp: '11–15', description: '5+ hearts' },
      { bid: '1♠', hcp: '11–15', description: '5+ spades' },
      { bid: '1NT', hcp: '13–15', description: 'Balanced, no 5-card major' },
      { bid: '2♣', hcp: '11–15', description: '6+ clubs (or 5♣ + 4-card major)' },
      { bid: '2♦', hcp: '11–15', description: 'Short ♦: 4-4-1-4 or 4-4-0-5 shape' },
      { bid: '2♥/♠', hcp: '6–10', description: 'Weak two — good 6-card suit' },
      { bid: '2NT', hcp: '6–12', description: 'Unusual — 5-5 in minors' },
      { bid: '3x', hcp: '5–10', description: 'Preempt — 7-card suit' },
      { bid: '3NT', hcp: '~10', description: 'Gambling — solid 7-card minor (AKQ), little outside' },
    ],
    keyRules: [
      'ALL openings except 1♣ are LIMITED to 15 HCP maximum.',
      '1♣ is the only strong opening — shows 16+ HCP regardless of shape.',
      '1♦ is a catch-all for 11–15 hands that don\'t fit other openings.',
      '1NT range is 13–15 (not 15–17 like SAYC).',
      '2NT is NOT strong balanced — it shows 5-5 minors.',
    ],
    keyConventions: [
      { name: '1♣ Negative (1♦)', description: '0–7 HCP response; all other responses are positive (8+).' },
      { name: '1♣ Positive Responses', description: '1♥/1♠/2♣/2♦ = 8+ HCP, 5+ card suit; 1NT = 8–10 balanced.' },
      { name: 'Precision 2♦', description: 'Shows 4-4 in majors with short diamonds (4-4-1-4 or 4-4-0-5).' },
      { name: 'Gambling 3NT', description: 'Solid 7-card minor headed by AKQ, minimal outside values.' },
      { name: 'Unusual 2NT', description: '5-5 in minors, 6–12 HCP (not a balanced strong hand).' },
    ],
    differences: [
      'SAYC/2/1: 1♣ = natural, 3+ clubs, 12–21 HCP.',
      'Precision: 1♣ = artificial, 16+ HCP, any shape.',
      'SAYC/2/1: 1NT = 15–17 balanced.',
      'Precision: 1NT = 13–15 balanced.',
      'SAYC/2/1: 2♣ = 22+ HCP, artificial strong.',
      'Precision: 2♣ = 11–15 HCP, 6+ clubs (natural).',
      'SAYC/2/1: 2NT = 20–21 balanced.',
      'Precision: 2NT = 5-5 minors, weak.',
    ],
  },
];

// ---- Suit symbol rendering ----

function renderBid(bid: string): React.ReactNode {
  const colored = bid
    .replace(/♠/g, '<span class="text-foreground">♠</span>')
    .replace(/♥/g, '<span class="text-red-600">♥</span>')
    .replace(/♦/g, '<span class="text-red-600">♦</span>')
    .replace(/♣/g, '<span class="text-foreground">♣</span>');
  return <span className="font-mono font-bold" dangerouslySetInnerHTML={{ __html: colored }} />;
}

// ---- Component ----

export default function ConventionReference() {
  const [activeTab, setActiveTab] = useState('sayc');

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <BookOpen className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold font-sans">Convention Quick Reference</h1>
          <p className="text-sm text-muted-foreground font-serif">
            Concise cheat-sheets for opening bids and key conventions.
          </p>
        </div>
      </motion.div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="sayc" className="text-xs sm:text-sm">SAYC</TabsTrigger>
          <TabsTrigger value="2over1" className="text-xs sm:text-sm">2/1 GF</TabsTrigger>
          <TabsTrigger value="precision" className="text-xs sm:text-sm">Precision</TabsTrigger>
        </TabsList>

        {conventions.map((conv) => (
          <TabsContent key={conv.id} value={conv.id} className="space-y-4 mt-4">
            <ConventionCard convention={conv} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function ConventionCard({ convention }: { convention: ConventionRef }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-4"
    >
      {/* Title & tagline */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-sans">{convention.name}</CardTitle>
          <p className="text-sm text-muted-foreground font-serif">{convention.tagline}</p>
        </CardHeader>
        <CardContent className="pt-0">
          <a
            href={convention.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
          >
            <ExternalLink className="w-3 h-3" />
            Source: {convention.source}
          </a>
        </CardContent>
      </Card>

      {/* Opening Bids Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-sans">Opening Bids</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 pr-3 font-semibold text-muted-foreground w-16">Bid</th>
                  <th className="text-left py-2 pr-3 font-semibold text-muted-foreground w-20">HCP</th>
                  <th className="text-left py-2 font-semibold text-muted-foreground">Description</th>
                </tr>
              </thead>
              <tbody>
                {convention.openingBids.map((row, i) => (
                  <tr key={i} className="border-b border-border/50 last:border-0">
                    <td className="py-1.5 pr-3">{renderBid(row.bid)}</td>
                    <td className="py-1.5 pr-3 font-mono text-xs text-muted-foreground">{row.hcp}</td>
                    <td className="py-1.5 text-foreground/80">{row.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Key Rules */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-sans">Key Rules</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <ul className="space-y-1.5">
            {convention.keyRules.map((rule, i) => (
              <li key={i} className="text-sm text-foreground/80 flex gap-2">
                <span className="text-primary font-bold shrink-0">•</span>
                <span>{rule}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Key Conventions */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-sans">Key Conventions</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            {convention.keyConventions.map((conv, i) => (
              <div key={i} className="flex gap-2 text-sm">
                <span className="font-semibold text-foreground shrink-0 min-w-[120px]">{conv.name}</span>
                <span className="text-foreground/70">{conv.description}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Differences (if present) */}
      {convention.differences && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-sans">
              {convention.id === 'precision' ? 'vs. SAYC / 2/1' : 'vs. SAYC'}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-1">
              {convention.differences.map((diff, i) => (
                <p key={i} className={`text-sm ${i % 2 === 0 ? 'text-muted-foreground' : 'text-foreground font-medium'}`}>
                  {diff}
                </p>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}
