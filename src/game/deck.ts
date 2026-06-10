import type { Card, Rank, Suit } from './types'

const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades']

function mulberry32(seed: number): () => number {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function createDeck(): Card[] {
  const cards: Card[] = []
  for (const suit of SUITS) {
    for (let rank = 1; rank <= 13; rank++) {
      cards.push({ suit, rank: rank as Rank, faceUp: false })
    }
  }
  return cards
}

export function shuffleDeck(cards: Card[], seed: number): Card[] {
  const rng = mulberry32(seed)
  const deck = [...cards]
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[deck[i], deck[j]] = [deck[j], deck[i]]
  }
  return deck
}

export function isRed(card: Card): boolean {
  return card.suit === 'hearts' || card.suit === 'diamonds'
}
