import { useCallback, useEffect, useRef, useState } from 'react'
import type { GameAPI } from '../hooks/useGame'
import { AboutDialog } from './AboutDialog'
import { Column } from './Column'
import { Foundation } from './Foundation'
import { GameHeader } from './GameHeader'
import { WinDialog } from './WinDialog'
import styles from './GameBoard.module.css'

const BASE_CARD_WIDTH = 90
const CARD_RATIO = 1.4
const FACE_DOWN_RATIO = 0.17
const FACE_UP_RATIO = 0.33

interface Layout {
  cardWidth: number
  colGap: number
  sidePad: number
}

function computeLayout(vw: number): Layout {
  // Scale gaps and padding down on narrow screens so all 7 columns always fit
  const colGap = vw < 480 ? 4 : 8
  const sidePad = vw < 480 ? 6 : 12
  const maxCardWidth = Math.floor((vw - sidePad * 2 - colGap * 6) / 7)
  const cardWidth = Math.min(BASE_CARD_WIDTH, Math.max(40, maxCardWidth))
  return { cardWidth, colGap, sidePad }
}

function useLayout(): Layout {
  const [layout, setLayout] = useState<Layout>(() => computeLayout(window.innerWidth))

  useEffect(() => {
    const update = () => setLayout(computeLayout(window.innerWidth))
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  return layout
}

interface Props {
  game: GameAPI
}

export function GameBoard({ game }: Props) {
  const {
    state,
    elapsed,
    bestRecords,
    finalScore,
    hintMove,
    hintNoMoves,
    canUndo,
    newDeal,
    restart,
    undo,
    selectCard,
    deselect,
    selectFoundation,
    deselectFoundation,
    moveToTableau,
    moveToFoundation,
    autoMoveToFoundation,
    moveFromFoundation,
    showHint,
    validDestinations,
  } = game

  const { cardWidth, colGap, sidePad } = useLayout()
  const [showAbout, setShowAbout] = useState(false)
  const cardHeight = Math.round(cardWidth * CARD_RATIO)
  const faceDownOffset = Math.round(cardHeight * FACE_DOWN_RATIO)
  const faceUpOffset = Math.round(cardHeight * FACE_UP_RATIO)

  const boardRef = useRef<HTMLDivElement>(null)

  const handleCardClick = useCallback(
    (col: number, cardIndex: number) => {
      const card = state.tableau[col][cardIndex]
      if (!card.faceUp) return

      // Foundation card selected → try to drop here
      if (state.selectedFoundation !== null) {
        const dest = validDestinations.find(d => d.type === 'tableau' && d.index === col)
        if (dest) { moveFromFoundation(state.selectedFoundation, col); return }
        deselectFoundation()
        return
      }

      if (state.selectedCell) {
        const dest = validDestinations.find(d => d.type === 'tableau' && d.index === col)
        if (dest) { moveToTableau(col); return }
        if (state.selectedCell.col === col && state.selectedCell.cardIndex === cardIndex) {
          deselect(); return
        }
      }
      selectCard(col, cardIndex)
    },
    [state.selectedCell, state.selectedFoundation, state.tableau, validDestinations, moveToTableau, moveFromFoundation, deselect, deselectFoundation, selectCard]
  )

  const handleCardDoubleClick = useCallback(
    (col: number) => {
      autoMoveToFoundation(col)
    },
    [autoMoveToFoundation]
  )

  const handleEmptyColumnClick = useCallback(
    (col: number) => {
      if (state.selectedFoundation !== null) {
        const dest = validDestinations.find(d => d.type === 'tableau' && d.index === col)
        if (dest) { moveFromFoundation(state.selectedFoundation, col); return }
        deselectFoundation()
        return
      }
      if (!state.selectedCell) return
      const dest = validDestinations.find(d => d.type === 'tableau' && d.index === col)
      if (dest) moveToTableau(col)
    },
    [state.selectedCell, state.selectedFoundation, validDestinations, moveToTableau, moveFromFoundation, deselectFoundation]
  )

  const handleFoundationClick = useCallback(
    (fIdx: number) => {
      // Tableau card selected → move to foundation
      if (state.selectedCell) {
        const dest = validDestinations.find(d => d.type === 'foundation' && d.index === fIdx)
        if (dest) { moveToFoundation(fIdx); return }
        deselect()
        return
      }
      // Foundation card selected → toggle or switch
      if (state.selectedFoundation !== null) {
        if (state.selectedFoundation === fIdx) deselectFoundation()
        else selectFoundation(fIdx)
        return
      }
      // Nothing selected → select this foundation pile (if it has cards)
      if (state.foundations[fIdx].length > 0) selectFoundation(fIdx)
    },
    [state.selectedCell, state.selectedFoundation, state.foundations, validDestinations, moveToFoundation, deselect, deselectFoundation, selectFoundation]
  )

  const handleBoardClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === boardRef.current && state.selectedCell) deselect()
    },
    [state.selectedCell, deselect]
  )

  return (
    <div
      className={styles.board}
      style={{
        ['--card-width' as string]: `${cardWidth}px`,
        ['--card-height' as string]: `${cardHeight}px`,
        ['--col-gap' as string]: `${colGap}px`,
        ['--side-pad' as string]: `${sidePad}px`,
      }}
    >
      <GameHeader
        score={state.score}
        moveCount={state.moveCount}
        elapsed={elapsed}
        bestRecords={bestRecords}
        hintActive={hintMove !== null}
        hintNoMoves={hintNoMoves}
        canUndo={canUndo}
        onNewDeal={newDeal}
        onRestart={restart}
        onHint={showHint}
        onUndo={undo}
        onAbout={() => setShowAbout(true)}
      />

      <div className={styles.playArea} ref={boardRef} onClick={handleBoardClick}>
        {/* Foundation row */}
        <div className={styles.foundationRow}>
          <div className={styles.foundationSpacer} />
          {state.foundations.map((cards, i) => (
            <Foundation
              key={i}
              cards={cards}
              suitIndex={i}
              isValidDest={validDestinations.some(d => d.type === 'foundation' && d.index === i)}
              isHintDest={hintMove !== null && hintMove.dest.type === 'foundation' && hintMove.dest.index === i}
              isSelected={state.selectedFoundation === i}
              onClick={() => handleFoundationClick(i)}
              cardWidth={cardWidth}
              cardHeight={cardHeight}
            />
          ))}
        </div>

        {/* Tableau */}
        <div className={styles.tableau}>
          {state.tableau.map((cards, col) => (
            <Column
              key={col}
              cards={cards}
              colIndex={col}
              selectedCell={state.selectedCell}
              validDestinations={validDestinations}
              hintMove={hintMove}
              cardWidth={cardWidth}
              cardHeight={cardHeight}
              faceDownOffset={faceDownOffset}
              faceUpOffset={faceUpOffset}
              onCardClick={handleCardClick}
              onCardDoubleClick={handleCardDoubleClick}
              onEmptyClick={handleEmptyColumnClick}
            />
          ))}
        </div>
      </div>

      {showAbout && <AboutDialog onClose={() => setShowAbout(false)} />}

      {state.status === 'won' && finalScore !== null && (
        <WinDialog
          moveCount={state.moveCount}
          elapsed={elapsed}
          baseScore={state.score}
          finalScore={finalScore}
          bestRecords={bestRecords}
          onNewDeal={newDeal}
          onRestart={restart}
        />
      )}
    </div>
  )
}
