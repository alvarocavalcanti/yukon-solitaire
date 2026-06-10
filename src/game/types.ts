export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades'
export type Rank = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13

export interface Card {
  suit: Suit
  rank: Rank
  faceUp: boolean
}

export interface SelectedCell {
  col: number
  cardIndex: number
}

export type GameStatus = 'idle' | 'playing' | 'won'

export interface GameState {
  tableau: Card[][]
  foundations: Card[][]
  seed: number
  moveCount: number
  score: number
  flipsCount: number
  status: GameStatus
  selectedCell: SelectedCell | null
}

export interface ValidDestination {
  type: 'tableau' | 'foundation'
  index: number
}

export const SUIT_ORDER: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades']
