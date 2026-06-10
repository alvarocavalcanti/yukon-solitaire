# Yukon Solitaire

**[▶ Play it here](https://alvarocavalcanti.github.io/yukon-solitaire/)**

A web-based implementation of Yukon Solitaire built with React and TypeScript, designed with Android conversion in mind via Capacitor.

## Rules

Yukon Solitaire is a variant of Klondike with one key difference: **any face-up card — and all face-up cards stacked on top of it — can be moved as a group**, regardless of whether they form a proper sequence. The only placement rule is that the bottom card of the moving group must be one lower in rank and opposite in colour from the top card of the destination column.

- 7 tableau columns, all 52 cards dealt upfront (no stock pile)
- Columns start with 0–6 face-down cards plus 5 face-up cards each
- Empty columns accept Kings only
- Four foundations built Ace → King by suit
- Win by moving all 52 cards to the foundations

## Features

- **New Deal** — generates a new random deal
- **Restart** — replays the exact same deal from the beginning
- **Undo** — unlimited; each undo costs one move
- **Hint** — highlights a suggested move in green; shows "Try Undo" when no productive move is found
- **Timer** — starts on the first move, pauses when the tab loses focus
- **Scoring** — +10 per foundation placement, +5 per hidden card revealed, −1 per move, time bonus at win
- **Best records** — best score, fastest time, and fewest moves persisted across sessions

## Tech stack

| Layer | Choice |
|---|---|
| Framework | React 18 + TypeScript |
| Build | Vite |
| Styling | CSS Modules |
| State | `useReducer` + custom hooks (no external library) |
| Cards | SVG-rendered in-browser (no image assets) |
| Persistence | `localStorage` |
| Android path | Capacitor (config stub included) |

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

To build for production:

```bash
npm run build
```

The `dist/` folder is ready to be packaged with Capacitor for Android.

## Project structure

```
src/
├── game/
│   ├── types.ts       # Shared types (Card, GameState, …)
│   ├── deck.ts        # Deck creation and seeded shuffle (mulberry32 PRNG)
│   ├── yukon.ts       # Deal, move validation, reducer, hint logic
│   ├── scoring.ts     # Score and time-bonus calculations
│   └── storage.ts     # localStorage best-record persistence
├── hooks/
│   ├── useGame.ts     # Main game hook — wraps reducer, timer, history
│   └── useTimer.ts    # Seconds counter, pauses on visibility change
└── components/
    ├── CardFace.tsx   # SVG card face and back rendering
    ├── Card.tsx       # Card wrapper with selection/hint/valid-dest styles
    ├── Column.tsx     # Tableau column with stacked card layout
    ├── Foundation.tsx # Foundation pile slot
    ├── GameHeader.tsx # Score, timer, move count, action buttons
    ├── GameBoard.tsx  # Layout root, interaction dispatcher
    └── WinDialog.tsx  # Win overlay with score breakdown
```

## Interaction

- **Click** a face-up card to select it (and all face-up cards above it in the column)
- **Click** a highlighted destination to move
- **Double-click** the top card of a column to auto-move it to the foundation
- **Click** the selected card again, or anywhere neutral, to deselect
