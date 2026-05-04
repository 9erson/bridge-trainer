// ============================================================
// OpeningBidsTable — shared responsive opening-bids display
// Renders a <table> on desktop and a card list on mobile.
// Used by ConventionReference page and InlineReference panel.
// ============================================================

import React from "react";

export interface OpeningBidRow {
  bid: string;
  hcp: string;
  description: string;
}

interface OpeningBidsTableProps {
  bids: readonly OpeningBidRow[];
  /** "page" = larger text for full reference page, "inline" = compact for in-game panel */
  variant: "page" | "inline";
}

function renderBid(bid: string): React.ReactNode {
  const colored = bid
    .replace(/♠/g, '<span style="color:var(--suit-black)">♠</span>')
    .replace(/♥/g, '<span style="color:var(--suit-red)">♥</span>')
    .replace(/♦/g, '<span style="color:var(--suit-red)">♦</span>')
    .replace(/♣/g, '<span style="color:var(--suit-black)">♣</span>');
  return (
    <span
      className="font-mono font-bold"
      dangerouslySetInnerHTML={{ __html: colored }}
    />
  );
}

function renderBidPlain(bid: string): string {
  return bid;
}

export default function OpeningBidsTable({
  bids,
  variant,
}: OpeningBidsTableProps) {
  const isPage = variant === "page";
  const textClass = isPage ? "text-sm" : "text-xs";
  const bidRenderer = isPage ? renderBid : renderBidPlain;

  return (
    <>
      {/* Desktop table view — visible at md: and above */}
      <div className="hidden md:block">
        <table className={`w-full ${textClass}`}>
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 pr-3 font-semibold text-muted-foreground w-16">
                Bid
              </th>
              <th className="text-left py-2 pr-3 font-semibold text-muted-foreground w-20">
                HCP
              </th>
              <th className="text-left py-2 font-semibold text-muted-foreground">
                {isPage ? "Description" : "Requirement"}
              </th>
            </tr>
          </thead>
          <tbody>
            {bids.map((row, i) => (
              <tr key={i} className="border-b border-border/50 last:border-0">
                <td className="py-1.5 pr-3">{bidRenderer(row.bid)}</td>
                <td className="py-1.5 pr-3 font-mono text-xs text-muted-foreground">
                  {row.hcp}
                </td>
                <td className="py-1.5 text-foreground/80">{row.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile card list — visible below md: */}
      <div className="md:hidden space-y-0">
        {bids.map((row, i) => (
          <div
            key={i}
            className={`border-b border-border/50 ${i === bids.length - 1 ? "border-0" : ""}`}
          >
            <div
              className={`flex items-baseline justify-between gap-2 ${textClass}`}
            >
              <span className="font-mono font-bold">
                {bidRenderer(row.bid)}
              </span>
              <span className="font-mono text-xs text-muted-foreground">
                {row.hcp} HCP
              </span>
            </div>
            <div
              className={`text-foreground/80 ${isPage ? "text-sm" : "text-xs"}`}
            >
              {row.description}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
