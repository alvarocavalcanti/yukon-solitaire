import type { GameState } from './types'

const KEY_BEST_TIME = 'yukon_best_time'
const KEY_BEST_MOVES = 'yukon_best_moves'
const KEY_BEST_SCORE = 'yukon_best_score'
const KEY_SESSION = 'yukon_session'

export interface SavedSession {
  state: GameState
  elapsed: number
  history: GameState[]
}

export function saveGameSession(state: GameState, elapsed: number, history: GameState[]): void {
  try {
    const session: SavedSession = {
      state: { ...state, selectedCell: null },
      elapsed,
      history,
    }
    localStorage.setItem(KEY_SESSION, JSON.stringify(session))
  } catch {
    // localStorage unavailable or full — silently skip
  }
}

export function loadGameSession(): SavedSession | null {
  try {
    const raw = localStorage.getItem(KEY_SESSION)
    if (!raw) return null
    return JSON.parse(raw) as SavedSession
  } catch {
    return null
  }
}

export function clearGameSession(): void {
  try {
    localStorage.removeItem(KEY_SESSION)
  } catch {
    // ignore
  }
}

export interface BestRecords {
  bestTime: number | null
  bestMoves: number | null
  bestScore: number | null
}

export function loadBestRecords(): BestRecords {
  const parse = (key: string): number | null => {
    const v = localStorage.getItem(key)
    return v !== null ? parseInt(v, 10) : null
  }
  return {
    bestTime: parse(KEY_BEST_TIME),
    bestMoves: parse(KEY_BEST_MOVES),
    bestScore: parse(KEY_BEST_SCORE),
  }
}

export function saveBestRecords(time: number, moves: number, score: number): BestRecords {
  const existing = loadBestRecords()
  const newRecords: BestRecords = { ...existing }

  if (existing.bestTime === null || time < existing.bestTime) {
    localStorage.setItem(KEY_BEST_TIME, String(time))
    newRecords.bestTime = time
  }
  if (existing.bestMoves === null || moves < existing.bestMoves) {
    localStorage.setItem(KEY_BEST_MOVES, String(moves))
    newRecords.bestMoves = moves
  }
  if (existing.bestScore === null || score > existing.bestScore) {
    localStorage.setItem(KEY_BEST_SCORE, String(score))
    newRecords.bestScore = score
  }
  return newRecords
}
