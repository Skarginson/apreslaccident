import type { CardId, PisteData, PisteWord, Rank } from "@/core/types";

import heartsJson from "@/content/cards/hearts.json";
import diamondsJson from "@/content/cards/diamonds.json";
import clubsJson from "@/content/cards/clubs.json";
import spadesJson from "@/content/cards/spades.json";
import pistesJson from "@/content/pistes.json";
import framesJson from "@/content/frames.json";

export type CardPrompt = {
  text: string;
  pistes?: readonly [PisteWord, PisteWord, PisteWord];
};

type SuitCardFile = {
  suit: string;
  act?: number;
  title?: string;
  cards: Record<string, { text: string; pistes?: string[] }>;
};

function getPromptFromFile(file: SuitCardFile, rank: string): CardPrompt | null {
  const card = file.cards[rank];
  if (!card) return null;
  if (card.pistes && card.pistes.length === 3) {
    return {
      text: card.text,
      pistes: card.pistes as [PisteWord, PisteWord, PisteWord],
    };
  }
  return { text: card.text };
}

/** Returns the prompt for any story card (heart/diamond/club). */
export function getStoryCardPrompt(cardId: CardId): CardPrompt | null {
  const dashIdx = cardId.indexOf("-");
  const suit = cardId.slice(0, dashIdx);
  const rank = cardId.slice(dashIdx + 1);

  switch (suit) {
    case "heart":
      return getPromptFromFile(heartsJson as SuitCardFile, rank);
    case "diamond":
      return getPromptFromFile(diamondsJson as SuitCardFile, rank);
    case "club":
      return getPromptFromFile(clubsJson as SuitCardFile, rank);
    default:
      return null;
  }
}

/** Returns the wound prompt for a spade face card. */
export function getWoundText(cardId: "spade-king" | "spade-queen" | "spade-jack"): string {
  const rank = cardId.split("-")[1] as "king" | "queen" | "jack";
  const card = (spadesJson.cards as Record<string, { woundText?: string }>)[rank];
  return card?.woundText ?? "";
}

/** Returns the epilogue prompt for a spade face card. */
export function getEpilogueText(cardId: "spade-king" | "spade-queen" | "spade-jack"): string {
  const rank = cardId.split("-")[1] as "king" | "queen" | "jack";
  const card = (spadesJson.cards as Record<string, { epilogueText?: string }>)[rank];
  return card?.epilogueText ?? "";
}

/** Returns the piste prompt text when a spade 2-10 card is drawn. */
export function getPisteEntryText(word: PisteWord): string {
  const piste = (pistesJson.pistes as PisteData[]).find((p) => p.word === word);
  return piste?.entryText ?? "";
}

/** Returns all 18 piste data entries. */
export function getAllPistes(): PisteData[] {
  return pistesJson.pistes as PisteData[];
}

export type FrameSection = {
  text: string;
  questions: string[];
};

export type FrameEntry = {
  id: string;
  rank: string;
  title: string;
  sections: FrameSection[];
};

/** Returns all 13 preset frames. */
export function getAllFrames(): FrameEntry[] {
  return framesJson.frames as FrameEntry[];
}

/** Returns a single frame by id. */
export function getFrame(id: string): FrameEntry | null {
  return (framesJson.frames as FrameEntry[]).find((f) => f.id === id) ?? null;
}

/** Returns the suit label for display. */
export function suitLabel(suit: string): string {
  switch (suit) {
    case "heart":
      return "Cœur";
    case "diamond":
      return "Carreau";
    case "club":
      return "Trèfle";
    case "spade":
      return "Pique";
    default:
      return suit;
  }
}

/** Returns the rank label for display. */
export function rankLabel(rank: Rank): string {
  const labels: Record<Rank, string> = {
    ace: "As",
    "2": "2",
    "3": "3",
    "4": "4",
    "5": "5",
    "6": "6",
    "7": "7",
    "8": "8",
    "9": "9",
    "10": "10",
    jack: "Valet",
    queen: "Dame",
    king: "Roi",
  };
  return labels[rank];
}

/** Returns the full card name for display. */
export function cardLabel(cardId: CardId): string {
  const dashIdx = cardId.indexOf("-");
  const suit = cardId.slice(0, dashIdx);
  const rank = cardId.slice(dashIdx + 1) as Rank;
  return `${rankLabel(rank)} de ${suitLabel(suit)}`;
}
