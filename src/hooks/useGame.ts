import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { computeFinalScore } from '../game/scoring'
import { clearGameSession, loadBestRecords, loadGameSession, saveBestRecords, saveGameSession } from '../game/storage'
import type { BestRecords, SavedSession } from '../game/storage'
import type { GameState, ValidDestination } from '../game/types'
import type { HintMove, LastMove } from '../game/yukon'
import { trackEvent } from '../analytics'
import { createInitialState, findAutoFoundationMove, findHint, gameReducer, getFoundationCardDestinations, getValidDestinations } from '../game/yukon'
import { useTimer } from './useTimer'

export interface GameAPI {
  state: GameState
  elapsed: number
  bestRecords: BestRecords
  finalScore: number | null
  hintMove: HintMove | null
  hintNoMoves: boolean
  canUndo: boolean
  autoCompleting: boolean
  newDeal: () => void
  restart: () => void
  undo: () => void
  selectCard: (col: number, cardIndex: number) => void
  deselect: () => void
  selectFoundation: (foundationIndex: number) => void
  deselectFoundation: () => void
  moveToTableau: (dstCol: number) => void
  moveToFoundation: (foundationIndex: number) => void
  autoMoveToFoundation: (srcCol: number) => void
  moveFromFoundation: (foundationIndex: number, dstCol: number) => void
  showHint: () => void
  validDestinations: ValidDestination[]
}

export function useGame(): GameAPI {
  const [session] = useState<SavedSession | null>(loadGameSession)

  const [state, dispatch] = useReducer(gameReducer, undefined, () =>
    session
      ? { ...session.state, selectedCell: null, selectedFoundation: null }
      : createInitialState(Date.now())
  )
  const [bestRecords, setBestRecords] = useState<BestRecords>(loadBestRecords)
  const [timerRunning, setTimerRunning] = useState(false)
  const { elapsed, reset: resetTimer } = useTimer(timerRunning, session?.elapsed ?? 0)
  const [hintMove, setHintMove] = useState<HintMove | null>(null)
  const [hintNoMoves, setHintNoMoves] = useState(false)
  const noMovesTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const autoCompleteRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const lastMoveRef = useRef<LastMove | null>(null)
  const [historyLength, setHistoryLength] = useState(session?.history.length ?? 0)
  const winHandled = useRef(false)
  const elapsedRef = useRef(session?.elapsed ?? 0)
  const stateRef = useRef(state)
  const historyRef = useRef<GameState[]>(session?.history ?? [])
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
      clearGameSession()
      trackEvent('win', { score: fs, moves: state.moveCount, time: e })
    }
  }, [state.status, state.score, state.moveCount, timerRunning])

  // Persist session after every move, new deal, or restart
  useEffect(() => {
    if (state.status === 'won') return  // cleared above on win
    saveGameSession(state, elapsedRef.current, historyRef.current)
  }, [state.moveCount, state.seed, state.status])

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

  // Auto-complete: when every card is face-up, move bottom cards to foundation at 2/sec
  const allFaceUp = useMemo(
    () =>
      state.status === 'playing' &&
      state.tableau.some(col => col.length > 0) &&
      state.tableau.every(col => col.every(card => card.faceUp)),
    [state.tableau, state.status]
  )

  useEffect(() => {
    if (!allFaceUp) {
      if (autoCompleteRef.current !== null) {
        clearInterval(autoCompleteRef.current)
        autoCompleteRef.current = null
      }
      return
    }
    autoCompleteRef.current = setInterval(() => {
      const srcCol = findAutoFoundationMove(stateRef.current)
      if (srcCol !== null) dispatch({ type: 'AUTO_MOVE_TO_FOUNDATION', srcCol })
    }, 500)
    return () => {
      if (autoCompleteRef.current !== null) {
        clearInterval(autoCompleteRef.current)
        autoCompleteRef.current = null
      }
    }
  }, [allFaceUp])

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
    clearGameSession()
    lastMoveRef.current = null
    setTimerRunning(false)
    setFinalScore(null)
    resetTimer()
    trackEvent('new-deal')
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

  const selectFoundation = useCallback(
    (foundationIndex: number) => dispatch({ type: 'SELECT_FOUNDATION', foundationIndex }),
    []
  )

  const deselectFoundation = useCallback(() => dispatch({ type: 'DESELECT_FOUNDATION' }), [])

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

  const moveFromFoundation = useCallback((foundationIndex: number, dstCol: number) => {
    pushHistory()
    lastMoveRef.current = null
    dispatch({ type: 'MOVE_FROM_FOUNDATION', foundationIndex, dstCol })
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
    if (state.selectedFoundation !== null) {
      return getFoundationCardDestinations(state, state.selectedFoundation)
    }
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
    autoCompleting: allFaceUp,
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
  }
}
