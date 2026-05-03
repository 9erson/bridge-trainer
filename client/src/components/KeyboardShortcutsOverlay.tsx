// ============================================================
// KeyboardShortcutsOverlay — modal showing all available shortcuts
// Triggered by pressing "?" anywhere in the app.
// ============================================================

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Keyboard } from "lucide-react";

interface ShortcutGroup {
  title: string;
  shortcuts: { keys: string; description: string }[];
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  context?: "point-counting" | "opening-bid" | "general";
}

const generalShortcuts: ShortcutGroup = {
  title: "General",
  shortcuts: [
    { keys: "?", description: "Show/hide this help" },
    { keys: "Esc", description: "Quit session / go back" },
  ],
};

const pointCountingShortcuts: ShortcutGroup = {
  title: "Point Counting",
  shortcuts: [
    { keys: "1 – 4", description: "Select answer by position (Easy mode)" },
    { keys: "↑ ↓ ← →", description: "Navigate choices" },
    { keys: "Enter", description: "Confirm selection / Submit answer" },
    { keys: "Enter / Space / N", description: "Next hand (after feedback)" },
  ],
};

const openingBidShortcuts: ShortcutGroup = {
  title: "Opening Bid",
  shortcuts: [
    { keys: "P", description: "Pass" },
    {
      keys: "1C, 1D, 1H, 1S, 1N",
      description: "1-level bids (type level then strain)",
    },
    { keys: "2C, 2D, 2H, 2S, 2N", description: "2-level bids" },
    { keys: "3C, 3D, 3H, 3S, 3N", description: "3-level bids" },
    { keys: "↑ ↓ ← →", description: "Navigate bid buttons" },
    { keys: "Enter", description: "Confirm highlighted bid" },
    { keys: "H", description: "Toggle reference panel" },
    { keys: "Enter / Space / N", description: "Next hand (after feedback)" },
  ],
};

const resultsShortcuts: ShortcutGroup = {
  title: "Results Screen",
  shortcuts: [
    { keys: "R", description: "Play again" },
    { keys: "Esc", description: "Back to games" },
  ],
};

export default function KeyboardShortcutsOverlay({
  isOpen,
  onClose,
  context,
}: Props) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "?") {
        e.preventDefault();
        onClose();
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  const groups: ShortcutGroup[] = [generalShortcuts];
  if (context === "point-counting") {
    groups.push(pointCountingShortcuts);
  } else if (context === "opening-bid") {
    groups.push(openingBidShortcuts);
  } else {
    groups.push(pointCountingShortcuts, openingBidShortcuts);
  }
  groups.push(resultsShortcuts);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-card border border-border rounded-xl shadow-xl max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Keyboard className="w-5 h-5 text-primary" />
                <h2 className="font-semibold text-foreground">
                  Keyboard Shortcuts
                </h2>
              </div>
              <button
                onClick={onClose}
                aria-label="Close keyboard shortcuts"
                className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-5">
              {groups.map(group => (
                <div key={group.title}>
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                    {group.title}
                  </h3>
                  <div className="space-y-1.5">
                    {group.shortcuts.map((shortcut, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-foreground/80">
                          {shortcut.description}
                        </span>
                        <kbd className="ml-4 shrink-0 px-2 py-0.5 bg-muted border border-border rounded text-xs font-mono text-muted-foreground">
                          {shortcut.keys}
                        </kbd>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-border text-center">
              <span className="text-xs text-muted-foreground">
                Press{" "}
                <kbd className="px-1.5 py-0.5 bg-muted border border-border rounded text-xs font-mono">
                  ?
                </kbd>{" "}
                or{" "}
                <kbd className="px-1.5 py-0.5 bg-muted border border-border rounded text-xs font-mono">
                  Esc
                </kbd>{" "}
                to close
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
