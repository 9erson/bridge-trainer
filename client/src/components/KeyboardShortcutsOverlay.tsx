// ============================================================
// KeyboardShortcutsOverlay — modal showing all available shortcuts
// Triggered by pressing "?" anywhere in the app.
// Built on shadcn Dialog (Radix) for full accessibility support.
// ============================================================

import { X, Keyboard } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogOverlay,
  DialogPortal,
} from "@/components/ui/dialog";

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
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogPortal>
        <DialogOverlay className="backdrop-blur-sm" />
        <DialogContent
          showCloseButton={false}
          aria-describedby={undefined}
          className="rounded-xl max-h-[80vh] overflow-y-auto bg-card border-border shadow-xl"
          onInteractOutside={e => e.preventDefault()}
        >
          {/* Header */}
          <DialogHeader className="flex-row items-center justify-between space-y-0 border-b border-border p-4">
            <div className="flex items-center gap-2">
              <Keyboard className="w-5 h-5 text-primary" />
              <DialogTitle className="font-semibold text-foreground">
                Keyboard Shortcuts
              </DialogTitle>
            </div>
            <button
              onClick={onClose}
              aria-label="Close keyboard shortcuts"
              className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <X className="w-4 h-4" />
            </button>
          </DialogHeader>

          {/* Content */}
          <div className="p-4 pt-0 space-y-5">
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
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
