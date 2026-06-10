import { createDeck, isRed, shuffleDeck } from './deck'
import type { Card, GameState, SelectedCell, Suit, ValidDestination } from './types'
import { SUIT_ORDER } from './types'

// ─── Deal ───────────────────────────────────────────────────────────────────

export function deal(seed: number): Card[][] {
  const deck = shuffleDeck(createDeck(), seed)
  const tableau: Card[][] = Array.from({ length: 7 }, () => [])

  let idx = 0
  // Klondike base: column i gets i face-down cards + 1 face-up card
  for (let col = 0; col < 7; col++) {
    for (let j = 0; j < col; j++) {
      tableau[col].push({ ...deck[idx++], faceUp: false })
    }
    tableau[col].push({ ...deck[idx++], faceUp: true })
  }
  // idx === 28; distribute remaining 24 cards face-up, 4 per column, cols 1–6
  for (let col = 1; col < 7; col++) {
    for (let k = 0; k < 4; k++) {
      tableau[col].push({ ...deck[idx++], faceUp: true })
    }
  }
  return tableau
}

export function createInitialState(seed: number): GameState {
  return {
    tableau: deal(seed),
    foundations: [[], [], [], []],
    seed,
    moveCount: 0,
    score: 0,
    flipsCount: 0,
    status: 'idle',
    selectedCell: null,
  }
}

// ─── Move validation ─────────────────────────────────────────────────────────

function canPlaceOnTableau(movingCard: Card, targetTop: Card): boolean {
  return isRed(movingCard) !== isRed(targetTop) && movingCard.rank === targetTop.rank - 1
}

function canPlaceOnEmpty(movingCard: Card): boolean {
  return movingCard.rank === 13
}

function canPlaceOnFoundation(card: Card, foundation: Card[]): boolean {
  if (foundation.length === 0) return card.rank === 1
  const top = foundation[foundation.length - 1]
  return card.suit === top.suit && card.rank === top.rank + 1
}

export function getValidDestinations(
  state: GameState,
  srcCol: number,
  cardIndex: number
): ValidDestination[] {
  const movingGroup = state.tableau[srcCol].slice(cardIndex)
  const bottomCard = movingGroup[0]
  const isSingleCard = movingGroup.length === 1
  const destinations: ValidDestination[] = []

  for (let col = 0; col < 7; col++) {
    if (col === srcCol) continue
    const column = state.tableau[col]
    if (column.length === 0) {
      if (canPlaceOnEmpty(bottomCard)) destinations.push({ type: 'tableau', index: col })
    } else {
      const top = column[column.length - 1]
      if (canPlaceOnTableau(bottomCard, top)) destinations.push({ type: 'tableau', index: col })
    }
  }

  if (isSingleCard) {
    const fIdx = SUIT_ORDER.indexOf(bottomCard.suit as Suit)
    if (canPlaceOnFoundation(bottomCard, state.foundations[fIdx])) {
      destinations.push({ type: 'foundation', index: fIdx })
    }
  }

  return destinations
}

// ─── Hint ─────────────────────────────────────────────────────────────────────

export interface HintMove {
  srcCol: number
  cardIndex: number
  dest: ValidDestination
}

export interface LastMove {
  suit: Suit
  rank: number
  fromCol: number
  toCol: number
}

function isReversal(srcCol: number, cardIndex: number, destCol: number, state: GameState, last: LastMove | null): boolean {
  if (!last) return false
  if (srcCol !== last.toCol || destCol !== last.fromCol) return false
  const card = state.tableau[srcCol][cardIndex]
  return card.suit === last.suit && card.rank === last.rank
}

export function findHint(state: GameState, lastMove: LastMove | null = null): HintMove | null {
  // Priority 1: any top card that can go straight to foundation
  for (let col = 0; col < 7; col++) {
    const column = state.tableau[col]
    if (column.length === 0) continue
    const card = column[column.length - 1]
    if (!card.faceUp) continue
    const fIdx = SUIT_ORDER.indexOf(card.suit as Suit)
    if (canPlaceOnFoundation(card, state.foundations[fIdx])) {
      return { srcCol: col, cardIndex: column.length - 1, dest: { type: 'foundation', index: fIdx } }
    }
  }

  // Priority 2: moves that uncover a face-down card (skip reversals)
  for (let srcCol = 0; srcCol < 7; srcCol++) {
    const srcColumn = state.tableau[srcCol]
    for (let cardIndex = 0; cardIndex < srcColumn.length; cardIndex++) {
      if (!srcColumn[cardIndex].faceUp) continue
      if (cardIndex === 0 || srcColumn[cardIndex - 1].faceUp) continue
      const dests = getValidDestinations(state, srcCol, cardIndex)
      const tableauDest = dests.find(
        d => d.type === 'tableau' && !isReversal(srcCol, cardIndex, d.index, state, lastMove)
      )
      if (tableauDest) return { srcCol, cardIndex, dest: tableauDest }
    }
  }

  // Priority 3: moves to non-empty columns, skipping reversals of the last move
  for (let srcCol = 0; srcCol < 7; srcCol++) {
    const srcColumn = state.tableau[srcCol]
    for (let cardIndex = 0; cardIndex < srcColumn.length; cardIndex++) {
      if (!srcColumn[cardIndex].faceUp) continue
      const dests = getValidDestinations(state, srcCol, cardIndex)
      const nonEmptyDest = dests.find(
        d =>
          d.type === 'tableau' &&
          state.tableau[d.index].length > 0 &&
          !isReversal(srcCol, cardIndex, d.index, state, lastMove)
      )
      if (nonEmptyDest) return { srcCol, cardIndex, dest: nonEmptyDest }
    }
  }

  return null
}

// ─── Win detection ────────────────────────────────────────────────────────────

function isWon(foundations: Card[][]): boolean {
  return foundations.every(f => f.length === 13)
}

// ─── Auto-flip ────────────────────────────────────────────────────────────────

function autoFlipTop(column: Card[]): { column: Card[]; flipped: boolean } {
  if (column.length === 0) return { column, flipped: false }
  const top = column[column.length - 1]
  if (!top.faceUp) {
    return {
      column: [...column.slice(0, -1), { ...top, faceUp: true }],
      flipped: true,
    }
  }
  return { column, flipped: false }
}

// ─── Scoring helpers ──────────────────────────────────────────────────────────

const SCORE_PER_FOUNDATION = 10
const SCORE_PER_FLIP = 5
const SCORE_PER_MOVE = -1

function addScore(current: number, delta: number): number {
  return Math.max(0, current + delta)
}

// ─── Reducer ─────────────────────────────────────────────────────────────────

export type GameAction =
  | { type: 'NEW_DEAL'; seed: number }
  | { type: 'RESTART' }
  | { type: 'SELECT_CARD'; cell: SelectedCell }
  | { type: 'DESELECT' }
  | { type: 'MOVE_TO_TABLEAU'; dstCol: number }
  | { type: 'MOVE_TO_FOUNDATION'; foundationIndex: number }
  | { type: 'AUTO_MOVE_TO_FOUNDATION'; srcCol: number }
  | { type: 'RESTORE_STATE'; payload: GameState }

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'NEW_DEAL':
      return createInitialState(action.seed)

    case 'RESTART':
      return createInitialState(state.seed)

    case 'SELECT_CARD':
      return { ...state, selectedCell: action.cell }

    case 'DESELECT':
      return { ...state, selectedCell: null }

    case 'MOVE_TO_TABLEAU': {
      const { selectedCell, tableau } = state
      if (!selectedCell) return state

      const { col: srcCol, cardIndex } = selectedCell
      const movingGroup = tableau[srcCol].slice(cardIndex)
      const bottomCard = movingGroup[0]
      const dstCol = action.dstCol
      const dstColumn = tableau[dstCol]

      const valid =
        dstColumn.length === 0
          ? canPlaceOnEmpty(bottomCard)
          : canPlaceOnTableau(bottomCard, dstColumn[dstColumn.length - 1])

      if (!valid) return state

      const rawSrcCol = tableau[srcCol].slice(0, cardIndex)
      const { column: newSrcCol, flipped } = autoFlipTop(rawSrcCol)
      const newDstCol = [...dstColumn, ...movingGroup]

      const newTableau = tableau.map((col, i) => {
        if (i === srcCol) return newSrcCol
        if (i === dstCol) return newDstCol
        return col
      })

      let score = addScore(state.score, SCORE_PER_MOVE)
      let flipsCount = state.flipsCount
      if (flipped) {
        score = addScore(score, SCORE_PER_FLIP)
        flipsCount += 1
      }

      return {
        ...state,
        tableau: newTableau,
        score,
        flipsCount,
        moveCount: state.moveCount + 1,
        status: 'playing',
        selectedCell: null,
      }
    }

    case 'MOVE_TO_FOUNDATION': {
      const { selectedCell, tableau, foundations } = state
      if (!selectedCell) return state

      const { col: srcCol, cardIndex } = selectedCell
      const movingGroup = tableau[srcCol].slice(cardIndex)
      if (movingGroup.length !== 1) return state

      const card = movingGroup[0]
      const fIdx = action.foundationIndex
      if (!canPlaceOnFoundation(card, foundations[fIdx])) return state

      const rawSrcCol = tableau[srcCol].slice(0, cardIndex)
      const { column: newSrcCol, flipped } = autoFlipTop(rawSrcCol)

      const newTableau = tableau.map((col, i) => (i === srcCol ? newSrcCol : col))
      const newFoundations = foundations.map((f, i) => (i === fIdx ? [...f, card] : f))

      let score = addScore(state.score, SCORE_PER_FOUNDATION + SCORE_PER_MOVE)
      let flipsCount = state.flipsCount
      if (flipped) {
        score = addScore(score, SCORE_PER_FLIP)
        flipsCount += 1
      }

      const won = isWon(newFoundations)

      return {
        ...state,
        tableau: newTableau,
        foundations: newFoundations,
        score,
        flipsCount,
        moveCount: state.moveCount + 1,
        status: won ? 'won' : 'playing',
        selectedCell: null,
      }
    }

    case 'AUTO_MOVE_TO_FOUNDATION': {
      const { tableau, foundations } = state
      const srcCol = action.srcCol
      const column = tableau[srcCol]
      if (column.length === 0) return state

      const card = column[column.length - 1]
      if (!card.faceUp) return state

      const fIdx = SUIT_ORDER.indexOf(card.suit as Suit)
      if (!canPlaceOnFoundation(card, foundations[fIdx])) return state

      const rawSrcCol = column.slice(0, -1)
      const { column: newSrcCol, flipped } = autoFlipTop(rawSrcCol)

      const newTableau = tableau.map((col, i) => (i === srcCol ? newSrcCol : col))
      const newFoundations = foundations.map((f, i) => (i === fIdx ? [...f, card] : f))

      let score = addScore(state.score, SCORE_PER_FOUNDATION + SCORE_PER_MOVE)
      let flipsCount = state.flipsCount
      if (flipped) {
        score = addScore(score, SCORE_PER_FLIP)
        flipsCount += 1
      }

      const won = isWon(newFoundations)

      return {
        ...state,
        tableau: newTableau,
        foundations: newFoundations,
        score,
        flipsCount,
        moveCount: state.moveCount + 1,
        status: won ? 'won' : 'playing',
        selectedCell: null,
      }
    }

    case 'RESTORE_STATE':
      return action.payload

    default:
      return state
  }
}
