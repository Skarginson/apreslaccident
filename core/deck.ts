import type { CardId, Rank } from "./types";
import { shuffle, type Rng, defaultRng } from "./rng";

const HEART_RANKS: Rank[] = ["ace", "2", "3", "4", "5", "6", "7", "8", "9", "10", "jack", "queen", "king"];
const DIAMOND_RANKS: Rank[] = [...HEART_RANKS];
const CLUB_RANKS: Rank[] = [...HEART_RANKS];

const HEARTS_COUNT = 6;
const DIAMONDS_COUNT = 7;
const CLUBS_COUNT = 6;

function pickN<T>(arr: T[], n: number, rng: Rng): T[] {
  return shuffle(arr, rng).slice(0, n);
}

/**
 * Build the Story Deck: 6 hearts + 7 diamonds + 6 clubs, shuffled within each act,
 * then concatenated in act order with spade-ace at the bottom.
 * Excluded cards are removed before picking.
 */
export function buildStoryDeck(excludedCards: CardId[] = [], rng: Rng = defaultRng): CardId[] {
  const excluded = new Set(excludedCards);

  const hearts = HEART_RANKS.map((r): CardId => `heart-${r}`).filter((c) => !excluded.has(c));
  const diamonds = DIAMOND_RANKS.map((r): CardId => `diamond-${r}`).filter((c) => !excluded.has(c));
  const clubs = CLUB_RANKS.map((r): CardId => `club-${r}`).filter((c) => !excluded.has(c));

  const pickedHearts = pickN(hearts, HEARTS_COUNT, rng);
  const pickedDiamonds = pickN(diamonds, DIAMONDS_COUNT, rng);
  const pickedClubs = pickN(clubs, CLUBS_COUNT, rng);

  return [...pickedHearts, ...pickedDiamonds, ...pickedClubs, "spade-ace"];
}

/** Draw the top card from the deck. Returns [card, remaining deck]. */
export function drawTopCard(deck: CardId[]): [CardId, CardId[]] {
  const top = deck[0];
  if (top === undefined) {
    throw new Error("Cannot draw from an empty deck");
  }
  return [top, deck.slice(1)];
}

/**
 * Insert a piste card into the deck.
 * Takes the top 5 cards (or all remaining if fewer), adds the piste card,
 * shuffles those cards, and puts them back on top.
 */
export function insertPisteIntoDeck(deck: CardId[], pisteCardId: CardId, rng: Rng = defaultRng): CardId[] {
  const topCount = Math.min(5, deck.length);
  const top = deck.slice(0, topCount);
  const rest = deck.slice(topCount);
  const mixed = shuffle([...top, pisteCardId], rng);
  return [...mixed, ...rest];
}
