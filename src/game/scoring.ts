export function computeTimeBonus(elapsedSeconds: number): number {
  if (elapsedSeconds < 180) return 500
  if (elapsedSeconds < 360) return 300
  if (elapsedSeconds < 600) return 100
  return 0
}

export function computeFinalScore(baseScore: number, elapsedSeconds: number): number {
  return Math.max(0, baseScore + computeTimeBonus(elapsedSeconds))
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}
