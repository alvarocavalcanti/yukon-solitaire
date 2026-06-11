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
  const pad = height * 0.05
  const rankSize = height * 0.27
  const suitInlineSize = height * 0.22
  const bigSuitSize = height * 0.48

  // Estimate rank text width so we can place the suit inline after it
  const rankCharWidth = label.length > 1 ? rankSize * 1.05 : rankSize * 0.68

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      overflow="hidden"
      style={{ display: 'block', borderRadius: r }}
    >
      <rect x={0} y={0} width={width} height={height} rx={r} ry={r} fill="#fdfaf5" />

      {/* Rank — top-left */}
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

      {/* Suit — inline, right of rank */}
      <text
        x={pad + rankCharWidth + rankSize * 0.2}
        y={pad + (rankSize - suitInlineSize) * 0.5}
        fontSize={suitInlineSize}
        fontFamily="Georgia, serif"
        fill={color}
        textAnchor="start"
        dominantBaseline="hanging"
      >
        {symbol}
      </text>

      {/* Large centered suit symbol for the lower portion of the card */}
      <text
        x={width / 2}
        y={height * 0.67}
        fontSize={bigSuitSize}
        fontFamily="Georgia, serif"
        fill={color}
        textAnchor="middle"
        dominantBaseline="middle"
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
