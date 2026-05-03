// ============================================================
// OpeningBidResults — session results summary for opening bid
// ============================================================

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CardDisplay from '@/components/CardDisplay';
import { formatBid } from '@/lib/conventions';
import { Check, X, RotateCcw, Home, ChevronDown, ChevronUp, Info } from 'lucide-react';
import type { GameResults } from '@/lib/gameRegistry';
import type { BridgeHand } from '@/lib/bridge';
import { motion } from 'framer-motion';

interface Props {
  results: GameResults;
  onPlayAgain: () => void;
  onBackToMenu: () => void;
}

export default function OpeningBidResults({ results, onPlayAgain, onBackToMenu }: Props) {
  const [showMistakes, setShowMistakes] = useState(false);
  const mistakes = results.hands.filter((h) => !h.isCorrect);
  const pct = Math.round(results.accuracy * 100);

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
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Avg Time</p>
                <p className="font-mono text-lg font-semibold">
                  {(results.averageTime / 1000).toFixed(1)}s
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Time</p>
                <p className="font-mono text-lg font-semibold">
                  {(results.totalTime / 1000).toFixed(0)}s
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Mistakes review */}
      {mistakes.length > 0 && (
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-2">
            <button
              onClick={() => setShowMistakes(!showMistakes)}
              className="flex items-center justify-between w-full"
            >
              <CardTitle className="text-base">
                Review Mistakes ({mistakes.length})
              </CardTitle>
              {showMistakes ? (
                <ChevronUp className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
          </CardHeader>
          {showMistakes && (
            <CardContent className="space-y-4">
              {mistakes.map((m, i) => {
                const userFormatted = m.userAnswer === '__timeout__'
                  ? { text: "Time's up", color: 'var(--muted-foreground)' }
                  : formatBid(m.userAnswer);
                const correctFormatted = formatBid(m.correctAnswer);
                const handData = m.handData as BridgeHand & { seat?: string; vuln?: string };

                return (
                  <div key={i} className="p-3 rounded-lg bg-muted/50 space-y-2">
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <CardDisplay hand={handData} mode="text" />
                      </div>
                      <div className="text-right space-y-1 shrink-0">
                        <div className="flex items-center gap-1 text-destructive text-sm">
                          <X className="w-3.5 h-3.5" />
                          <span style={{ color: userFormatted.color }}>{userFormatted.text}</span>
                        </div>
                        <div className="flex items-center gap-1 text-emerald-600 text-sm">
                          <Check className="w-3.5 h-3.5" />
                          <span style={{ color: correctFormatted.color }}>{correctFormatted.text}</span>
                        </div>
                      </div>
                    </div>
                    {m.explanation && (
                      <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
                        <Info className="w-3 h-3 mt-0.5 shrink-0" />
                        <span className="font-serif">{m.explanation}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          )}
        </Card>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 justify-center">
        <Button onClick={onPlayAgain} size="lg">
          <RotateCcw className="w-4 h-4 mr-2" />
          Play Again
          <kbd className="ml-2 px-1.5 py-0.5 bg-primary-foreground/20 border border-primary-foreground/30 rounded text-[9px] font-mono">R</kbd>
        </Button>
        <Button onClick={onBackToMenu} variant="outline" size="lg">
          <Home className="w-4 h-4 mr-2" />
          Back to Games
          <kbd className="ml-2 px-1.5 py-0.5 bg-muted border border-border rounded text-[9px] font-mono text-muted-foreground">Esc</kbd>
        </Button>
      </div>
    </div>
  );
}
