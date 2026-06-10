import type { Card, Suit } from '../game/types'
import { SUIT_ORDER } from '../game/types'
import { CardFace } from './CardFace'
import styles from './Foundation.module.css'

const SUIT_SYMBOL: Record<Suit, string> = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠',
}

const SUIT_COLOR: Record<Suit, string> = {
  hearts: '#c0392b',
  diamonds: '#c0392b',
  clubs: '#1a1a2e',
  spades: '#1a1a2e',
}

interface Props {
  cards: Card[]
  suitIndex: number
  isValidDest: boolean
  isHintDest: boolean
  onClick: () => void
  cardWidth: number
  cardHeight: number
}

export function Foundation({ cards, suitIndex, isValidDest, isHintDest, onClick, cardWidth, cardHeight }: Props) {
  const suit = SUIT_ORDER[suitIndex]
  const topCard = cards[cards.length - 1]

  return (
    <div
      className={[
        styles.foundation,
        isValidDest ? styles.validDest : '',
        isHintDest ? styles.hintDest : '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ width: cardWidth, height: cardHeight }}
      onClick={onClick}
    >
      {topCard ? (
        <CardFace card={topCard} width={cardWidth} height={cardHeight} />
      ) : (
        <div className={styles.empty} style={{ fontSize: cardWidth * 0.45, color: SUIT_COLOR[suit] }}>
          {SUIT_SYMBOL[suit]}
        </div>
      )}
    </div>
  )
}
