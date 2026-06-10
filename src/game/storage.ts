const KEY_BEST_TIME = 'yukon_best_time'
const KEY_BEST_MOVES = 'yukon_best_moves'
const KEY_BEST_SCORE = 'yukon_best_score'

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
