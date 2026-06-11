# Yukon Solitaire

**[▶ Play it here](https://alvarocavalcanti.github.io/yukon-solitaire/)**

A web-based implementation of Yukon Solitaire built with React and TypeScript, designed with Android conversion in mind via Capacitor.

If you enjoy the game, consider supporting:

[![Buy Me A Coffee](https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png)](https://www.buymeacoffee.com/alvarocavalcanti)

[![Support on Ko-fi](https://storage.ko-fi.com/cdn/kofi6.png?v=6)](https://ko-fi.com/O4O1WSP5B)

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
- **Scoring** — +10 per foundation placement, +5 per hidden card revealed, −1 per move, −15 for moving a card back from a foundation; time bonus at win (under 3 min: +500, under 6 min: +300, under 10 min: +100)
- **Best records** — best final score, fastest time, and fewest moves persisted in localStorage
- **Session persistence** — game state (including timer) is saved to localStorage and restored on page refresh
- **Foundation retrieval** — cards can be moved back from a foundation to the tableau (−15 score penalty)
- **Auto-complete** — once all cards are face-up, eligible bottom cards move to the foundations automatically at two moves per second; an "Auto-completing…" label appears top-left while active; pauses if no move is available and resumes when the player frees a card
- **Responsive layout** — card size adapts so all 7 columns always fit on narrow screens

## Interaction

- **Click** a face-up card to select it (and all face-up cards above it in the column)
- **Click** a highlighted destination to move the selected group
- **Click** the selected card again, or anywhere neutral, to deselect
- **Double-click** the top card of a column to auto-move it to its foundation
- **Click** a foundation pile to select its top card, then click a valid tableau column to move it back

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
