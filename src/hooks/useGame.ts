import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { computeFinalScore } from '../game/scoring'
import { loadBestRecords, saveBestRecords } from '../game/storage'
import type { BestRecords } from '../game/storage'
import type { GameState, ValidDestination } from '../game/types'
import type { HintMove, LastMove } from '../game/yukon'
import { createInitialState, findHint, gameReducer, getValidDestinations } from '../game/yukon'
import { useTimer } from './useTimer'

export interface GameAPI {
  state: GameState
  elapsed: number
  bestRecords: BestRecords
  finalScore: number | null
  hintMove: HintMove | null
  hintNoMoves: boolean
  canUndo: boolean
  newDeal: () => void
  restart: () => void
  undo: () => void
  selectCard: (col: number, cardIndex: number) => void
  deselect: () => void
  moveToTableau: (dstCol: number) => void
  moveToFoundation: (foundationIndex: number) => void
  autoMoveToFoundation: (srcCol: number) => void
  showHint: () => void
  validDestinations: ValidDestination[]
}

export function useGame(): GameAPI {
  const [state, dispatch] = useReducer(gameReducer, undefined, () =>
    createInitialState(Date.now())
  )
  const [bestRecords, setBestRecords] = useState<BestRecords>(loadBestRecords)
  const [timerRunning, setTimerRunning] = useState(false)
  const { elapsed, reset: resetTimer } = useTimer(timerRunning)
  const [hintMove, setHintMove] = useState<HintMove | null>(null)
  const [hintNoMoves, setHintNoMoves] = useState(false)
  const noMovesTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastMoveRef = useRef<LastMove | null>(null)
  const [historyLength, setHistoryLength] = useState(0)
  const winHandled = useRef(false)
  const elapsedRef = useRef(0)
  const stateRef = useRef(state)
  const historyRef = useRef<GameState[]>([])
  const [finalScore, setFinalScore] = useState<number | null>(null)

  // Keep refs up to date on every render
  stateRef.current = state
  useEffect(() => { elapsedRef.current = elapsed }, [elapsed])

  // Start timer on first move, stop and record on win
  useEffect(() => {
    if (state.status === 'idle' || state.status === 'playing') winHandled.current = false
    if (state.status === 'playing' && !timerRunning) setTimerRunning(true)
    if (state.status === 'won' && !winHandled.current) {
      winHandled.current = true
      setTimerRunning(false)
      const e = elapsedRef.current
      const fs = computeFinalScore(state.score, e)
      setFinalScore(fs)
      const updated = saveBestRecords(e, state.moveCount, fs)
      setBestRecords(updated)
    }
  }, [state.status, state.score, state.moveCount, timerRunning])

  // Clear hint after any move or on new deal/restart
  useEffect(() => {
    if (noMovesTimerRef.current) {
      clearTimeout(noMovesTimerRef.current)
      noMovesTimerRef.current = null
    }
    setHintMove(null)
    setHintNoMoves(false)
  }, [state.moveCount, state.status, state.seed])

  // Pause timer when window loses focus
  useEffect(() => {
    const handleVisibility = () => {
      if (stateRef.current.status === 'playing') setTimerRunning(!document.hidden)
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [])

  // ── History helpers ──────────────────────────────────────────────────────────

  const pushHistory = useCallback(() => {
    historyRef.current = [...historyRef.current, stateRef.current]
    setHistoryLength(l => l + 1)
  }, [])

  const clearHistory = useCallback(() => {
    historyRef.current = []
    setHistoryLength(0)
  }, [])

  // ── Actions ──────────────────────────────────────────────────────────────────

  const newDeal = useCallback(() => {
    clearHistory()
    lastMoveRef.current = null
    setTimerRunning(false)
    setFinalScore(null)
    resetTimer()
    dispatch({ type: 'NEW_DEAL', seed: Date.now() })
  }, [clearHistory, resetTimer])

  const restart = useCallback(() => {
    clearHistory()
    lastMoveRef.current = null
    setTimerRunning(false)
    setFinalScore(null)
    resetTimer()
    dispatch({ type: 'RESTART' })
  }, [clearHistory, resetTimer])

  const undo = useCallback(() => {
    if (historyRef.current.length === 0) return
    const prevState = historyRef.current[historyRef.current.length - 1]
    historyRef.current = historyRef.current.slice(0, -1)
    setHistoryLength(l => l - 1)
    lastMoveRef.current = null  // After undo, don't bias hints based on a move that was rolled back
    const wasWon = stateRef.current.status === 'won'
    dispatch({
      type: 'RESTORE_STATE',
      payload: {
        ...prevState,
        moveCount: stateRef.current.moveCount + 1,
        selectedCell: null,
      },
    })
    if (wasWon) {
      setTimerRunning(true)
      setFinalScore(null)
    }
  }, [])

  const selectCard = useCallback(
    (col: number, cardIndex: number) => dispatch({ type: 'SELECT_CARD', cell: { col, cardIndex } }),
    []
  )

  const deselect = useCallback(() => dispatch({ type: 'DESELECT' }), [])

  const moveToTableau = useCallback((dstCol: number) => {
    pushHistory()
    const cell = stateRef.current.selectedCell
    if (cell) {
      const card = stateRef.current.tableau[cell.col][cell.cardIndex]
      lastMoveRef.current = { suit: card.suit, rank: card.rank, fromCol: cell.col, toCol: dstCol }
    }
    dispatch({ type: 'MOVE_TO_TABLEAU', dstCol })
  }, [pushHistory])

  const moveToFoundation = useCallback((foundationIndex: number) => {
    pushHistory()
    lastMoveRef.current = null  // Foundation moves can't be reversed in tableau
    dispatch({ type: 'MOVE_TO_FOUNDATION', foundationIndex })
  }, [pushHistory])

  const autoMoveToFoundation = useCallback((srcCol: number) => {
    pushHistory()
    lastMoveRef.current = null
    dispatch({ type: 'AUTO_MOVE_TO_FOUNDATION', srcCol })
  }, [pushHistory])

  const showHint = useCallback(() => {
    if (noMovesTimerRef.current) {
      clearTimeout(noMovesTimerRef.current)
      noMovesTimerRef.current = null
    }
    if (hintMove) {
      setHintMove(null)
      setHintNoMoves(false)
      return
    }
    const hint = findHint(stateRef.current, lastMoveRef.current)
    if (hint) {
      setHintMove(hint)
      setHintNoMoves(false)
    } else {
      setHintNoMoves(true)
      noMovesTimerRef.current = setTimeout(() => setHintNoMoves(false), 3000)
    }
  }, [hintMove])

  const validDestinations = useMemo<ValidDestination[]>(() => {
    if (!state.selectedCell) return []
    return getValidDestinations(state, state.selectedCell.col, state.selectedCell.cardIndex)
  }, [state])

  return {
    state,
    elapsed,
    bestRecords,
    finalScore,
    hintMove,
    hintNoMoves,
    canUndo: historyLength > 0,
    newDeal,
    restart,
    undo,
    selectCard,
    deselect,
    moveToTableau,
    moveToFoundation,
    autoMoveToFoundation,
    showHint,
    validDestinations,
  }
}
