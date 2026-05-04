// ============================================================
// BridgeCardFan — decorative SVG of four fanned playing cards
// Card Table Modernist: uses CSS custom properties for theming
// ============================================================

export default function BridgeCardFan() {
  return (
    <svg
      viewBox="0 0 120 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      role="presentation"
      className="w-32 h-auto mx-auto mb-6"
    >
      {/* Card 1: Spades — rotated -12° */}
      <g transform="translate(30, 8) rotate(-12, 20, 32)">
        <rect
          x="0"
          y="0"
          width="40"
          height="56"
          rx="4"
          fill="var(--card)"
          stroke="var(--border)"
          strokeWidth="1"
        />
        <text
          x="20"
          y="34"
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="22"
          fill="var(--suit-black)"
        >
          ♠
        </text>
      </g>
      {/* Card 2: Hearts — rotated -4° */}
      <g transform="translate(36, 6) rotate(-4, 20, 32)">
        <rect
          x="0"
          y="0"
          width="40"
          height="56"
          rx="4"
          fill="var(--card)"
          stroke="var(--border)"
          strokeWidth="1"
        />
        <text
          x="20"
          y="34"
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="22"
          fill="var(--suit-red)"
        >
          ♥
        </text>
      </g>
      {/* Card 3: Diamonds — rotated +4° */}
      <g transform="translate(42, 6) rotate(4, 20, 32)">
        <rect
          x="0"
          y="0"
          width="40"
          height="56"
          rx="4"
          fill="var(--card)"
          stroke="var(--border)"
          strokeWidth="1"
        />
        <text
          x="20"
          y="34"
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="22"
          fill="var(--suit-red)"
        >
          ♦
        </text>
      </g>
      {/* Card 4: Clubs — rotated +12° */}
      <g transform="translate(48, 8) rotate(12, 20, 32)">
        <rect
          x="0"
          y="0"
          width="40"
          height="56"
          rx="4"
          fill="var(--card)"
          stroke="var(--border)"
          strokeWidth="1"
        />
        <text
          x="20"
          y="34"
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="22"
          fill="var(--suit-black)"
        >
          ♣
        </text>
      </g>
    </svg>
  );
}
