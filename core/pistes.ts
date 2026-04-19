import type { CardId, PisteState, PisteWord } from "./types";
import { insertPisteIntoDeck } from "./deck";
import type { Rng } from "./rng";
import { defaultRng } from "./rng";

const PISTE_SPADE_RANKS = ["2", "3", "4", "5", "6", "7", "8", "9", "10"] as const;

/** Returns the spade card IDs that are not yet assigned to any piste. */
export function availablePisteSlots(pistes: PisteState[]): CardId[] {
  const used = new Set(pistes.filter((p) => p.assignedCardId !== null).map((p) => p.assignedCardId as CardId));
  return PISTE_SPADE_RANKS.map((r): CardId => `spade-${r}`).filter((c) => !used.has(c));
}

export interface FollowPisteResult {
  pistes: PisteState[];
  storyDeck: CardId[];
  assignedCard: CardId | null;
}

/**
 * Follow a piste during an entry.
 * - Already followed or excluded pistes: no-op.
 * - Otherwise: mark followed, assign spade slot, insert into deck.
 */
export function followPiste(
  word: PisteWord,
  pistes: PisteState[],
  storyDeck: CardId[],
  assignedSlot: CardId,
  rng: Rng = defaultRng,
): FollowPisteResult {
  const pisteState = pistes.find((p) => p.word === word);

  if (!pisteState || pisteState.excluded || pisteState.followed) {
    return { pistes, storyDeck, assignedCard: null };
  }

  const updatedPistes: PisteState[] = pistes.map((p) =>
    p.word === word ? { ...p, followed: true, assignedCardId: assignedSlot } : p,
  );

  const updatedDeck = insertPisteIntoDeck(storyDeck, assignedSlot, rng);

  return { pistes: updatedPistes, storyDeck: updatedDeck, assignedCard: assignedSlot };
}

/** Build the initial piste states for a new game. */
export function buildInitialPistes(excludedWords: PisteWord[] = []): PisteState[] {
  const excluded = new Set(excludedWords);
  const allWords: PisteWord[] = [
    "Amour", "Animal", "Autel", "Calme", "Cauchemars", "Chaos",
    "Culte", "Jouet", "Effrayant", "Esprit", "Famille", "Impossible",
    "Lueurs", "Mélodie", "Message", "Mourant", "Signal", "Vengeance",
  ];
  return allWords.map((word) => ({
    word,
    followed: false,
    assignedCardId: null,
    excluded: excluded.has(word),
  }));
}
