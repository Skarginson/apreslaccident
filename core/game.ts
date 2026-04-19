import type { CardId, Entry, Game, GameStatus, PisteWord } from "./types";
import { buildStoryDeck, drawTopCard } from "./deck";
import { buildInitialPistes, followPiste } from "./pistes";
import { defaultRng, type Rng } from "./rng";

let idCounter = 0;
function generateId(): string {
  return `${Date.now()}-${++idCounter}`;
}

export interface CreateGameInput {
  frame: Game["frame"];
  survivor?: Game["survivor"];
  woundCard: Game["woundCard"];
  excludedCards?: CardId[];
  excludedPisteWords?: PisteWord[];
}

export function createGame(input: CreateGameInput, rng: Rng = defaultRng): Game {
  const now = new Date().toISOString();
  const storyDeck = buildStoryDeck(input.excludedCards ?? [], rng);
  const pistes = buildInitialPistes(input.excludedPisteWords ?? []);

  return {
    id: generateId(),
    createdAt: now,
    updatedAt: now,
    status: "playing",
    frame: input.frame,
    ...(input.survivor !== undefined ? { survivor: input.survivor } : {}),
    woundCard: input.woundCard,
    epilogueCard: null,
    storyDeck,
    discardPile: [],
    pistes,
    excludedCards: input.excludedCards ?? [],
    entries: [],
  };
}

export interface PlayEntryInput {
  journalText: string;
  pisteFollowed?: PisteWord;
  pisteAssignedSlot?: CardId;
}

export interface PlayEntryResult {
  game: Game;
  drawnCard: CardId;
  gameEnded: boolean;
}

/**
 * Draw the top card, record an entry, optionally follow a piste.
 * If the drawn card is spade-ace, the game transitions to "concluded".
 */
export function playEntry(game: Game, input: PlayEntryInput, rng: Rng = defaultRng): PlayEntryResult {
  if (game.status !== "playing") {
    throw new Error("Cannot play entry on a game that is not in playing status");
  }

  const [drawnCard, remainingDeck] = drawTopCard(game.storyDeck);

  let updatedPistes = game.pistes;
  let updatedDeck = remainingDeck;

  if (input.pisteFollowed && input.pisteAssignedSlot) {
    const result = followPiste(input.pisteFollowed, updatedPistes, updatedDeck, input.pisteAssignedSlot, rng);
    updatedPistes = result.pistes;
    updatedDeck = result.storyDeck;
  }

  const entry: Entry = {
    id: generateId(),
    dayNumber: game.entries.length + 1,
    drawnAt: new Date().toISOString(),
    cardId: drawnCard,
    promptSnapshot: "",
    pistesOffered: null,
    pisteFollowed: input.pisteFollowed ?? null,
    journalText: input.journalText,
  };

  const isEnd = drawnCard === "spade-ace";
  const newStatus: GameStatus = isEnd ? "concluded" : "playing";

  const updatedGame: Game = {
    ...game,
    updatedAt: new Date().toISOString(),
    status: newStatus,
    storyDeck: updatedDeck,
    discardPile: [...game.discardPile, drawnCard],
    pistes: updatedPistes,
    entries: [...game.entries, entry],
  };

  return { game: updatedGame, drawnCard, gameEnded: isEnd };
}

export interface ConcludeGameInput {
  epilogueCard: Game["epilogueCard"];
}

/** Finalize the game with an epilogue card draw. */
export function concludeGame(game: Game, input: ConcludeGameInput): Game {
  if (game.status !== "concluded") {
    throw new Error("Cannot conclude a game that has not ended");
  }
  return {
    ...game,
    updatedAt: new Date().toISOString(),
    epilogueCard: input.epilogueCard,
  };
}
