export type Suit = "heart" | "diamond" | "club" | "spade";
export type Rank =
  | "ace"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10"
  | "jack"
  | "queen"
  | "king";
export type CardId = `${Suit}-${Rank}`;

export interface CardData {
  id: CardId;
  suit: Suit;
  rank: Rank;
  act?: 1 | 2 | 3;
  prompt?: {
    text: string;
    pistes?: readonly [string, string, string];
  };
}

export type PisteWord =
  | "Amour"
  | "Animal"
  | "Autel"
  | "Calme"
  | "Cauchemars"
  | "Chaos"
  | "Culte"
  | "Jouet"
  | "Effrayant"
  | "Esprit"
  | "Famille"
  | "Impossible"
  | "Lueurs"
  | "Mélodie"
  | "Message"
  | "Mourant"
  | "Signal"
  | "Vengeance";

export interface PisteData {
  word: PisteWord;
  entryText: string;
}

export interface Frame {
  id: string;
  title: string;
  description: string;
  customQuestions?: string[];
}

export interface PisteState {
  word: PisteWord;
  followed: boolean;
  assignedCardId: CardId | null;
  excluded: boolean;
}

export interface Entry {
  id: string;
  dayNumber: number;
  drawnAt: string;
  cardId: CardId;
  promptSnapshot: string;
  pistesOffered: readonly string[] | null;
  pisteFollowed: PisteWord | null;
  journalText: string;
}

export type GameStatus = "setup" | "playing" | "concluded";

export interface Game {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: GameStatus;
  frame: {
    type: "preset" | "custom";
    title: string;
    description: string;
    customAnswers?: Record<string, string>;
  };
  survivor?: {
    name?: string;
    notes?: string;
  };
  woundCard: "spade-king" | "spade-queen" | "spade-jack";
  epilogueCard: "spade-king" | "spade-queen" | "spade-jack" | null;
  storyDeck: CardId[];
  discardPile: CardId[];
  pistes: PisteState[];
  excludedCards: CardId[];
  entries: Entry[];
}
