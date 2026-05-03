// ============================================================
// useKeyboardShortcuts — hook for registering keyboard shortcuts
// Handles key sequences (e.g., "1" then "C" for 1♣) and single keys.
// ============================================================

import { useEffect, useCallback, useRef } from 'react';

export interface ShortcutDef {
  key: string; // single key like 'p', '1', 'Enter', 'Escape', or sequence like '1c'
  action: () => void;
  description?: string;
  enabled?: boolean;
}

interface Options {
  enabled?: boolean;
  preventDefault?: boolean;
}

export function useKeyboardShortcuts(
  shortcuts: ShortcutDef[],
  options: Options = {}
) {
  const { enabled = true, preventDefault = true } = options;
  const sequenceBuffer = useRef('');
  const sequenceTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled) return;

      // Don't capture if user is typing in an input/textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        // Exception: allow Enter in input fields (for submitting answers)
        if (e.key !== 'Enter') return;
      }

      const key = e.key.toLowerCase();

      // Handle single-key shortcuts first
      for (const shortcut of shortcuts) {
        if (shortcut.enabled === false) continue;

        const shortcutKey = shortcut.key.toLowerCase();

        // Single key match
        if (shortcutKey.length === 1 && shortcutKey === key) {
          if (preventDefault) e.preventDefault();
          shortcut.action();
          sequenceBuffer.current = '';
          return;
        }

        // Special keys (Enter, Escape, Space)
        if (shortcutKey === 'enter' && e.key === 'Enter') {
          if (preventDefault) e.preventDefault();
          shortcut.action();
          sequenceBuffer.current = '';
          return;
        }
        if (shortcutKey === 'escape' && e.key === 'Escape') {
          if (preventDefault) e.preventDefault();
          shortcut.action();
          sequenceBuffer.current = '';
          return;
        }
        if (shortcutKey === 'space' && e.key === ' ') {
          if (preventDefault) e.preventDefault();
          shortcut.action();
          sequenceBuffer.current = '';
          return;
        }
        if (shortcutKey === '?' && e.key === '?') {
          if (preventDefault) e.preventDefault();
          shortcut.action();
          sequenceBuffer.current = '';
          return;
        }
      }

      // Handle sequence shortcuts (e.g., "1c", "2h")
      if (/^[1-7]$/.test(key)) {
        sequenceBuffer.current = key;
        if (sequenceTimeout.current) clearTimeout(sequenceTimeout.current);
        sequenceTimeout.current = setTimeout(() => {
          sequenceBuffer.current = '';
        }, 1500);
        return;
      }

      if (sequenceBuffer.current && /^[cdhsn]$/.test(key)) {
        const sequence = sequenceBuffer.current + key;
        sequenceBuffer.current = '';
        if (sequenceTimeout.current) clearTimeout(sequenceTimeout.current);

        for (const shortcut of shortcuts) {
          if (shortcut.enabled === false) continue;
          if (shortcut.key.toLowerCase() === sequence) {
            if (preventDefault) e.preventDefault();
            shortcut.action();
            return;
          }
        }
      }
    },
    [shortcuts, enabled, preventDefault]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (sequenceTimeout.current) clearTimeout(sequenceTimeout.current);
    };
  }, [handleKeyDown]);
}

// Map bid strings to keyboard shortcut labels
export function getBidShortcutLabel(bid: string): string {
  if (bid.toLowerCase() === 'pass') return 'P';
  // e.g., "1c" → "1C", "2h" → "2H", "1nt" → "1N", "2nt" → "2N"
  const match = bid.match(/^(\d)(nt|[cdhs])$/i);
  if (match) {
    const level = match[1];
    const strain = match[2].toLowerCase();
    if (strain === 'nt') return `${level}N`;
    return `${level}${strain.toUpperCase()}`;
  }
  return '';
}

// Map bid string to the key sequence needed
export function getBidKeySequence(bid: string): string {
  if (bid.toLowerCase() === 'pass') return 'p';
  const match = bid.match(/^(\d)(nt|[cdhs])$/i);
  if (match) {
    const level = match[1];
    const strain = match[2].toLowerCase();
    if (strain === 'nt') return `${level}n`;
    return `${level}${strain}`;
  }
  return '';
}
