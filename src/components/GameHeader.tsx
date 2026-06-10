import type { BestRecords } from '../game/storage'
import { formatTime } from '../game/scoring'
import styles from './GameHeader.module.css'

interface Props {
  score: number
  moveCount: number
  elapsed: number
  bestRecords: BestRecords
  hintActive: boolean
  hintNoMoves: boolean
  canUndo: boolean
  onNewDeal: () => void
  onRestart: () => void
  onHint: () => void
  onUndo: () => void
  onAbout: () => void
}

export function GameHeader({
  score,
  moveCount,
  elapsed,
  bestRecords,
  hintActive,
  hintNoMoves,
  canUndo,
  onNewDeal,
  onRestart,
  onHint,
  onUndo,
  onAbout,
}: Props) {
  return (
    <header className={styles.header}>
      <div className={styles.title}>Yukon Solitaire</div>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.label}>Score</span>
          <span className={styles.value}>{score}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.label}>Moves</span>
          <span className={styles.value}>{moveCount}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.label}>Time</span>
          <span className={styles.value}>{formatTime(elapsed)}</span>
        </div>
      </div>

      <div className={styles.bests}>
        {bestRecords.bestScore !== null && (
          <span className={styles.best}>🏆 {bestRecords.bestScore} pts</span>
        )}
        {bestRecords.bestTime !== null && (
          <span className={styles.best}>⏱ {formatTime(bestRecords.bestTime)}</span>
        )}
        {bestRecords.bestMoves !== null && (
          <span className={styles.best}>🎯 {bestRecords.bestMoves} moves</span>
        )}
      </div>

      <div className={styles.actions}>
        <button
          className={[styles.btn, hintActive ? styles.btnHintActive : '', hintNoMoves ? styles.btnNoMoves : ''].filter(Boolean).join(' ')}
          onClick={onHint}
        >
          {hintNoMoves ? 'Try Undo' : 'Hint'}
        </button>
        <button className={[styles.btn, !canUndo ? styles.btnDisabled : ''].filter(Boolean).join(' ')} onClick={onUndo} disabled={!canUndo}>
          Undo
        </button>
        <button className={styles.btn} onClick={onNewDeal}>New Deal</button>
        <button className={styles.btn} onClick={onRestart}>Restart</button>
        <button className={styles.btnAbout} onClick={onAbout} aria-label="About">?</button>
      </div>
    </header>
  )
}
