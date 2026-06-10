import type { Card as CardType } from '../game/types'
import { CardBack, CardFace } from './CardFace'
import styles from './Card.module.css'

interface Props {
  card: CardType
  isSelected: boolean
  isValidDest: boolean
  isHintSource: boolean
  isHintDest: boolean
  onClick: () => void
  onDoubleClick: () => void
  style?: React.CSSProperties
  cardWidth: number
  cardHeight: number
}

export function Card({
  card,
  isSelected,
  isValidDest,
  isHintSource,
  isHintDest,
  onClick,
  onDoubleClick,
  style,
  cardWidth,
  cardHeight,
}: Props) {
  const className = [
    styles.card,
    isSelected ? styles.selected : '',
    isValidDest ? styles.validDest : '',
    isHintSource ? styles.hintSource : '',
    isHintDest ? styles.hintDest : '',
    card.faceUp ? styles.faceUp : styles.faceDown,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      className={className}
      style={{ ...style, width: cardWidth, height: cardHeight }}
      onClick={card.faceUp ? onClick : undefined}
      onDoubleClick={card.faceUp ? onDoubleClick : undefined}
      title={card.faceUp ? `${card.rank} of ${card.suit}` : 'Face-down card'}
    >
      {card.faceUp ? (
        <CardFace card={card} width={cardWidth} height={cardHeight} />
      ) : (
        <CardBack width={cardWidth} height={cardHeight} />
      )}
    </div>
  )
}
