import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CardDisplay from "@/components/CardDisplay";
import { formatBid } from "@/lib/conventions";
import {
  Check,
  X,
  RotateCcw,
  Home,
  ChevronDown,
  ChevronUp,
  Info,
} from "lucide-react";
import type { GameResults } from "@/lib/gameRegistry";
import type { BridgeHand } from "@/lib/bridge";
import { SUIT_SYMBOLS } from "@/lib/bridge";
import { motion } from "framer-motion";

interface Props {
  results: GameResults;
  onPlayAgain: () => void;
  onBackToMenu: () => void;
}

interface HandMeta {
  hand: BridgeHand;
  partnerBid: string;
  hcp: number;
  distribution: string;
}

export default function RespondingResults({
  results,
  onPlayAgain,
  onBackToMenu,
}: Props) {
  const [showAllHands, setShowAllHands] = useState(false);
  const mistakes = results.hands.filter(h => !h.isCorrect);
  const pct = Math.round(results.accuracy * 100);

  function getHandMeta(handData: unknown): HandMeta {
    const data = handData as HandMeta;
    return data;
  }

  function formatPartnerBid(partnerBid: string): {
    text: string;
    color: string;
  } {
    return formatBid(partnerBid);
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      {/* Score header */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="border-border/50 shadow-sm">
          <CardContent className="pt-6 pb-6">
            <div className="text-center mb-6">
              <div className="font-mono text-5xl font-bold text-foreground mb-1">
                {results.totalCorrect}/{results.totalHands}
              </div>
              <p className="text-muted-foreground font-serif">
                {pct}% accuracy
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  Avg Time
                </p>
                <p className="font-mono text-lg font-semibold">
                  {(results.averageTime / 1000).toFixed(1)}s
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  Total Time
                </p>
                <p className="font-mono text-lg font-semibold">
                  {(results.totalTime / 1000).toFixed(0)}s
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* All hands review */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="pb-2">
          <button
            onClick={() => setShowAllHands(!showAllHands)}
            className="flex items-center justify-between w-full"
          >
            <CardTitle className="text-base">
              Review Hands ({results.hands.length})
            </CardTitle>
            {showAllHands ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
          </button>
        </CardHeader>
        {showAllHands && (
          <CardContent className="space-y-4">
            {results.hands.map((h, i) => {
              const meta = getHandMeta(h.handData);
              const userFormatted =
                h.userAnswer === "__timeout__"
                  ? { text: "Time's up", color: "#888" }
                  : formatBid(h.userAnswer);
              const correctFormatted = formatBid(h.correctAnswer);
              const partnerFormatted = formatPartnerBid(meta.partnerBid);

              return (
                <div
                  key={i}
                  className={`p-3 rounded-lg space-y-2 ${
                    h.isCorrect
                      ? "bg-muted/30"
                      : "bg-red-50/50 border border-red-200/50"
                  }`}
                >
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                    <span className="font-mono font-medium">
                      Partner: {partnerFormatted.text}
                    </span>
                    <span className="font-mono">
                      {meta.hcp} HCP | {meta.distribution}
                    </span>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <CardDisplay hand={meta.hand} mode="text" />
                    </div>
                    <div className="text-right space-y-1 shrink-0">
                      <div className="flex items-center gap-1 text-destructive text-sm">
                        <X className="w-3.5 h-3.5" />
                        <span style={{ color: userFormatted.color }}>
                          {userFormatted.text}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-emerald-600 text-sm">
                        <Check className="w-3.5 h-3.5" />
                        <span style={{ color: correctFormatted.color }}>
                          {correctFormatted.text}
                        </span>
                      </div>
                    </div>
                  </div>
                  {h.explanation && (
                    <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
                      <Info className="w-3 h-3 mt-0.5 shrink-0" />
                      <span className="font-serif">{h.explanation}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        )}
      </Card>

      {/* Mistakes only (if any) */}
      {mistakes.length > 0 && mistakes.length < results.hands.length && (
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-destructive">
              Mistakes ({mistakes.length})
            </CardTitle>
          </CardHeader>
        </Card>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 justify-center">
        <Button onClick={onPlayAgain} size="lg">
          <RotateCcw className="w-4 h-4 mr-2" />
          Play Again
          <kbd className="ml-2 px-1.5 py-0.5 bg-primary-foreground/20 border border-primary-foreground/30 rounded text-[9px] font-mono">
            R
          </kbd>
        </Button>
        <Button onClick={onBackToMenu} variant="outline" size="lg">
          <Home className="w-4 h-4 mr-2" />
          Back to Games
          <kbd className="ml-2 px-1.5 py-0.5 bg-muted border border-border rounded text-[9px] font-mono text-muted-foreground">
            Esc
          </kbd>
        </Button>
      </div>
    </div>
  );
}
