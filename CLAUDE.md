# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # start dev server (http://localhost:5173)
npm run build     # type-check + Vite production build → dist/
npm run lint      # type-check only (tsc --noEmit); no test suite exists
```

After editing any TypeScript file, always run `npm run lint` to verify.

Deploy is automatic: every push to `main` triggers the GitHub Actions workflow that builds and publishes to GitHub Pages via `peaceiris/actions-gh-pages`.

## Architecture

The game is a pure React + TypeScript SPA with no external state library. The layers are:

### Game logic (`src/game/`)

All game rules live here, framework-agnostic.

- **`types.ts`** — shared types: `Card`, `GameState`, `GameStatus`, `ValidDestination`, `SUIT_ORDER`
- **`deck.ts`** — deck creation and seeded shuffle (mulberry32 PRNG; same seed → same deal)
- **`yukon.ts`** — the core module:
  - `deal()` / `createInitialState()` — Yukon layout (cols 0–6 get 0–6 face-down cards + 1 face-up, then 4 extra face-up cards distributed to cols 1–6)
  - `gameReducer()` — pure reducer handling all game actions
  - `getValidDestinations()` — move validation for tableau/foundation
  - `findHint()` — prioritised hint search (foundation first, then uncover face-down, then any tableau)
  - `findAutoFoundationMove()` — finds first column whose bottom card can legally go to a foundation (used for auto-complete)
- **`scoring.ts`** — score and time-bonus calculations
- **`storage.ts`** — localStorage: session persistence (`saveGameSession` / `loadGameSession`) and best records

### Hooks (`src/hooks/`)

- **`useGame.ts`** — the single game hook consumed by `GameBoard`. Wraps the reducer with: undo history (ref-based, not in state), timer control, hint state, win handling, session save/restore, and auto-complete (interval that fires `AUTO_MOVE_TO_FOUNDATION` at 500 ms when all cards are face-up).
- **`useTimer.ts`** — simple seconds counter, pauses on tab visibility change.

### Components (`src/components/`)

- **`GameBoard.tsx`** — layout root and interaction dispatcher. Owns responsive card sizing (`cardWidth`, `cardHeight`, `faceDownOffset`, `faceUpOffset`) and routes all click/double-click events to the correct `useGame` actions.
- **`CardFace.tsx`** — SVG card rendering. Rank + suit are shown inline at the top of every card (both visible in the peek strip when stacked); a large centered suit symbol fills the lower portion. `CardBack` renders the blue patterned back.
- **`Column.tsx`** — positions cards absolutely using cumulative `top` offsets (`faceDownOffset` for face-down, `faceUpOffset` for face-up cards).
- **`Foundation.tsx`**, **`GameHeader.tsx`**, **`WinDialog.tsx`**, **`AboutDialog.tsx`** — self-contained presentational components.

### Key constants (in `GameBoard.tsx`)

```ts
BASE_CARD_WIDTH = 90   // px, capped by viewport
CARD_RATIO      = 1.4  // height = width × ratio
FACE_DOWN_RATIO = 0.17 // peek offset for face-down cards
FACE_UP_RATIO   = 0.36 // peek offset for face-up cards
```

### State shape

`GameState` lives entirely in the reducer. `selectedCell` / `selectedFoundation` are inside the state (not separate useState). Undo history is kept in a ref (`historyRef`) to avoid triggering re-renders on every push.

### Scoring

+10 per card moved to foundation, +5 per face-down card flipped, −1 per move, −15 for moving a card back from foundation. Time bonus applied at win. Score is floored at 0.
