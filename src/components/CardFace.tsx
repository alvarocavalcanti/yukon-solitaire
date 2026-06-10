import type { Card } from '../game/types'

const SUIT_SYMBOL: Record<string, string> = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠',
}

const RANK_LABEL: Record<number, string> = {
  1: 'A', 2: '2', 3: '3', 4: '4', 5: '5', 6: '6', 7: '7',
  8: '8', 9: '9', 10: '10', 11: 'J', 12: 'Q', 13: 'K',
}

interface Props {
  card: Card
  width: number
  height: number
}

export function CardFace({ card, width, height }: Props) {
  const isRed = card.suit === 'hearts' || card.suit === 'diamonds'
  const color = isRed ? '#c0392b' : '#1a1a2e'
  const symbol = SUIT_SYMBOL[card.suit]
  const label = RANK_LABEL[card.rank]

  const r = width * 0.07
  const pad = width * 0.09
  // Rank is bigger; suit slightly smaller — both extend toward center
  const rankSize = height * 0.46
  const suitSize = height * 0.36

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      overflow="hidden"
      style={{ display: 'block', borderRadius: r }}
    >
      <rect x={0} y={0} width={width} height={height} rx={r} ry={r} fill="#fdfaf5" />

      {/* Rank — top-left, hangs downward toward center */}
      <text
        x={pad}
        y={pad}
        fontSize={rankSize}
        fontFamily="Georgia, serif"
        fontWeight="bold"
        fill={color}
        textAnchor="start"
        dominantBaseline="hanging"
      >
        {label}
      </text>

      {/* Suit — bottom-right, grows upward toward center */}
      <text
        x={width - pad}
        y={height - pad}
        fontSize={suitSize}
        fontFamily="Georgia, serif"
        fill={color}
        textAnchor="end"
        dominantBaseline="alphabetic"
      >
        {symbol}
      </text>
    </svg>
  )
}

interface BackProps {
  width: number
  height: number
}

export function CardBack({ width, height }: BackProps) {
  const r = width * 0.07
  const patternSize = width * 0.12

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ display: 'block', borderRadius: r }}
    >
      <defs>
        <pattern
          id="card-back-pattern"
          x={0}
          y={0}
          width={patternSize}
          height={patternSize}
          patternUnits="userSpaceOnUse"
        >
          <rect width={patternSize} height={patternSize} fill="#1a3a6b" />
          <rect
            x={patternSize * 0.1}
            y={patternSize * 0.1}
            width={patternSize * 0.8}
            height={patternSize * 0.8}
            fill="none"
            stroke="#2255a4"
            strokeWidth={1}
          />
          <line
            x1={0}
            y1={0}
            x2={patternSize}
            y2={patternSize}
            stroke="#2255a4"
            strokeWidth={0.5}
            opacity={0.4}
          />
          <line
            x1={patternSize}
            y1={0}
            x2={0}
            y2={patternSize}
            stroke="#2255a4"
            strokeWidth={0.5}
            opacity={0.4}
          />
        </pattern>
      </defs>
      <rect x={0} y={0} width={width} height={height} rx={r} ry={r} fill="url(#card-back-pattern)" />
      {/* Border frame */}
      <rect
        x={width * 0.07}
        y={height * 0.04}
        width={width * 0.86}
        height={height * 0.92}
        rx={r * 0.5}
        ry={r * 0.5}
        fill="none"
        stroke="#4a7fd4"
        strokeWidth={width * 0.03}
      />
    </svg>
  )
}
