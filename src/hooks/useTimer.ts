import { useEffect, useRef, useState } from 'react'

export function useTimer(isRunning: boolean, initialElapsed = 0): { elapsed: number; reset: () => void } {
  const [elapsed, setElapsed] = useState(initialElapsed)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const reset = () => setElapsed(0)

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => setElapsed(prev => prev + 1), 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isRunning])

  return { elapsed, reset }
}
