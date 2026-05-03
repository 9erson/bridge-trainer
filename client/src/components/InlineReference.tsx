// ============================================================
// InlineReference — collapsible convention quick-reference panel
// Used inside the Opening Bid game during play.
// Shows opening bids table + key rules for the active convention.
// Supports both controlled (isOpen/onToggle) and uncontrolled modes.
// ============================================================

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { getConventionRef } from "@/lib/conventionReferenceData";
import { BookOpen, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  conventionId: string;
  isOpen?: boolean;
  onToggle?: () => void;
}

function renderBidInline(bid: string): string {
  return bid;
}

export default function InlineReference({
  conventionId,
  isOpen: controlledOpen,
  onToggle,
}: Props) {
  const [internalOpen, setInternalOpen] = useState(false);

  // Use controlled mode if props provided, otherwise internal state
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const toggle = onToggle || (() => setInternalOpen(prev => !prev));

  const conv = getConventionRef(conventionId);

  if (!conv) return null;

  return (
    <div className="mt-4">
      <Button
        variant="ghost"
        size="sm"
        className="w-full flex items-center justify-center gap-2 text-xs text-muted-foreground hover:text-foreground border border-dashed border-border/60 hover:border-border"
        onClick={toggle}
      >
        <BookOpen className="w-3.5 h-3.5" />
        <span>
          {isOpen ? "Hide" : "Show"} Reference — {conv.name}
        </span>
        <kbd className="ml-1 px-1 py-0.5 bg-muted border border-border rounded text-[9px] font-mono text-muted-foreground/60">
          H
        </kbd>
        {isOpen ? (
          <ChevronUp className="w-3.5 h-3.5" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5" />
        )}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-3 rounded-lg border border-border/60 bg-muted/30 p-4 space-y-4">
              {/* Opening Bids Table */}
              <div>
                <h4 className="text-xs font-semibold text-foreground/80 uppercase tracking-wide mb-2">
                  Opening Bids
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border/50">
                        <th className="text-left py-1 pr-2 font-semibold text-muted-foreground w-14">
                          Bid
                        </th>
                        <th className="text-left py-1 pr-2 font-semibold text-muted-foreground w-16">
                          HCP
                        </th>
                        <th className="text-left py-1 font-semibold text-muted-foreground">
                          Requirement
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {conv.openingBids.map((row, i) => (
                        <tr
                          key={i}
                          className="border-b border-border/30 last:border-0"
                        >
                          <td className="py-1 pr-2 font-mono font-bold text-foreground">
                            {renderBidInline(row.bid)}
                          </td>
                          <td className="py-1 pr-2 font-mono text-muted-foreground">
                            {row.hcp}
                          </td>
                          <td className="py-1 text-foreground/70">
                            {row.description}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Key Rules */}
              <div>
                <h4 className="text-xs font-semibold text-foreground/80 uppercase tracking-wide mb-2">
                  Key Rules
                </h4>
                <ul className="space-y-1">
                  {conv.keyRules.map((rule, i) => (
                    <li
                      key={i}
                      className="text-xs text-foreground/70 flex gap-1.5"
                    >
                      <span className="text-primary font-bold shrink-0">•</span>
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
