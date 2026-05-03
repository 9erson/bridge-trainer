import { useState, useRef, useEffect, useCallback, memo } from "react";

interface SequenceIndicatorProps {
  onBid: (bidKey: string) => void;
  enabled: boolean;
}

function SequenceIndicator({ onBid, enabled }: SequenceIndicatorProps) {
  const [sequenceBuffer, setSequenceBuffer] = useState("");
  const bufferRef = useRef("");
  const sequenceTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onBidRef = useRef(onBid);
  onBidRef.current = onBid;

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (sequenceTimeout.current) clearTimeout(sequenceTimeout.current);
    };
  }, []);

  // Reset buffer when disabled
  useEffect(() => {
    if (!enabled) {
      setSequenceBuffer("");
      bufferRef.current = "";
      if (sequenceTimeout.current) clearTimeout(sequenceTimeout.current);
    }
  }, [enabled]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled) return;
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;

      const key = e.key.toLowerCase();

      // Number keys start a sequence
      if (/^[1-7]$/.test(key)) {
        e.preventDefault();
        e.stopPropagation();
        bufferRef.current = key;
        setSequenceBuffer(key);
        if (sequenceTimeout.current) clearTimeout(sequenceTimeout.current);
        sequenceTimeout.current = setTimeout(() => {
          bufferRef.current = "";
          setSequenceBuffer("");
        }, 1500);
        return;
      }

      // Second key of sequence (c, d, h, s, n)
      if (bufferRef.current && /^[cdhsn]$/.test(key)) {
        e.preventDefault();
        e.stopPropagation();
        const strain = key === "n" ? "NT" : key.toUpperCase();
        const bidKey = bufferRef.current + strain;
        if (sequenceTimeout.current) clearTimeout(sequenceTimeout.current);
        bufferRef.current = "";
        setSequenceBuffer("");
        onBidRef.current(bidKey);
        return;
      }
    },
    [enabled]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  if (!sequenceBuffer) return null;

  return (
    <div className="text-center mb-2">
      <span className="inline-flex items-center px-2 py-0.5 bg-primary/10 border border-primary/30 rounded text-xs font-mono text-primary">
        {sequenceBuffer}_{" "}
        <span className="ml-1 text-muted-foreground">(type C/D/H/S/N)</span>
      </span>
    </div>
  );
}

export default memo(SequenceIndicator);
