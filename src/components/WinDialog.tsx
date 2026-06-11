import type { BestRecords } from '../game/storage'
import { computeTimeBonus, formatTime } from '../game/scoring'
import styles from './WinDialog.module.css'

interface Props {
  moveCount: number
  elapsed: number
  baseScore: number
  finalScore: number
  bestRecords: BestRecords
  onNewDeal: () => void
}

export function WinDialog({
  moveCount,
  elapsed,
  baseScore,
  finalScore,
  bestRecords,
  onNewDeal,
}: Props) {
  const timeBonus = computeTimeBonus(elapsed)
  const isNewBestScore = bestRecords.bestScore === finalScore
  const isNewBestTime = bestRecords.bestTime === elapsed
  const isNewBestMoves = bestRecords.bestMoves === moveCount

  return (
    <div className={styles.overlay}>
      <div className={styles.dialog}>
        <div className={styles.trophy}>🎉</div>
        <h2 className={styles.title}>You Won!</h2>

        <div className={styles.scoreBreakdown}>
          <div className={styles.row}>
            <span>Base score</span>
            <span>{baseScore}</span>
          </div>
          <div className={styles.row}>
            <span>Time bonus ({formatTime(elapsed)})</span>
            <span>+{timeBonus}</span>
          </div>
          <div className={[styles.row, styles.total].join(' ')}>
            <span>Final score</span>
            <span>{finalScore}</span>
          </div>
        </div>

        <div className={styles.details}>
          <span>{moveCount} moves</span>
          <span>·</span>
          <span>{formatTime(elapsed)}</span>
        </div>

        {(isNewBestScore || isNewBestTime || isNewBestMoves) && (
          <div className={styles.newBests}>
            {isNewBestScore && <span className={styles.newBest}>New best score!</span>}
            {isNewBestTime && <span className={styles.newBest}>New best time!</span>}
            {isNewBestMoves && <span className={styles.newBest}>Fewest moves!</span>}
          </div>
        )}

        <div className={styles.actions}>
          <button className={styles.btnPrimary} onClick={onNewDeal}>
            New Deal
          </button>
        </div>
      </div>
    </div>
  )
}
