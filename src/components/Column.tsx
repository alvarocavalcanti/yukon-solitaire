import type { Card as CardType, SelectedCell, ValidDestination } from '../game/types'
import type { HintMove } from '../game/yukon'
import { Card } from './Card'
import styles from './Column.module.css'

interface Props {
  cards: CardType[]
  colIndex: number
  selectedCell: SelectedCell | null
  validDestinations: ValidDestination[]
  hintMove: HintMove | null
  cardWidth: number
  cardHeight: number
  faceDownOffset: number
  faceUpOffset: number
  onCardClick: (col: number, cardIndex: number) => void
  onCardDoubleClick: (col: number) => void
  onEmptyClick: (col: number) => void
}

export function Column({
  cards,
  colIndex,
  selectedCell,
  validDestinations,
  hintMove,
  cardWidth,
  cardHeight,
  faceDownOffset,
  faceUpOffset,
  onCardClick,
  onCardDoubleClick,
  onEmptyClick,
}: Props) {
  const isValidDest = validDestinations.some(d => d.type === 'tableau' && d.index === colIndex)
  const isHintDest =
    hintMove !== null && hintMove.dest.type === 'tableau' && hintMove.dest.index === colIndex

  let totalHeight = cardHeight
  if (cards.length > 1) {
    let offset = 0
    for (let i = 0; i < cards.length - 1; i++) {
      offset += cards[i].faceUp ? faceUpOffset : faceDownOffset
    }
    totalHeight = offset + cardHeight
  }

  return (
    <div
      className={[
        styles.column,
        isValidDest && cards.length === 0 ? styles.validEmpty : '',
        isHintDest && cards.length === 0 ? styles.hintEmpty : '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ width: cardWidth, height: Math.max(cardHeight, totalHeight) }}
      onClick={cards.length === 0 ? () => onEmptyClick(colIndex) : undefined}
    >
      {cards.length === 0 && (
        <div
          className={[
            styles.emptySlot,
            isValidDest ? styles.validDest : '',
            isHintDest ? styles.hintDestSlot : '',
          ]
            .filter(Boolean)
            .join(' ')}
          style={{ width: cardWidth, height: cardHeight }}
        />
      )}

      {cards.map((card, i) => {
        let top = 0
        for (let j = 0; j < i; j++) {
          top += cards[j].faceUp ? faceUpOffset : faceDownOffset
        }

        const isCardSelected =
          selectedCell !== null &&
          selectedCell.col === colIndex &&
          i >= selectedCell.cardIndex &&
          card.faceUp

        const isCardValidDest = isValidDest && i === cards.length - 1

        const isCardHintSource =
          hintMove !== null &&
          hintMove.srcCol === colIndex &&
          i >= hintMove.cardIndex &&
          card.faceUp

        const isCardHintDest = isHintDest && i === cards.length - 1

        return (
          <Card
            key={`${card.suit}-${card.rank}`}
            card={card}
            isSelected={isCardSelected}
            isValidDest={isCardValidDest}
            isHintSource={isCardHintSource}
            isHintDest={isCardHintDest}
            cardWidth={cardWidth}
            cardHeight={cardHeight}
            style={{ top }}
            onClick={() => onCardClick(colIndex, i)}
            onDoubleClick={() => onCardDoubleClick(colIndex)}
          />
        )
      })}
    </div>
  )
}
