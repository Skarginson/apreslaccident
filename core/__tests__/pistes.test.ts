import { describe, it, expect } from "vitest";
import { followPiste, availablePisteSlots, buildInitialPistes } from "../pistes";
import { buildStoryDeck } from "../deck";
import { seededRng } from "../rng";
import type { PisteState } from "../types";

function freshPistes(): PisteState[] {
  return buildInitialPistes();
}

describe("buildInitialPistes", () => {
  it("returns 18 piste states", () => {
    expect(buildInitialPistes()).toHaveLength(18);
  });

  it("all start as not followed, no assigned card", () => {
    for (const p of buildInitialPistes()) {
      expect(p.followed).toBe(false);
      expect(p.assignedCardId).toBeNull();
    }
  });

  it("marks excluded words", () => {
    const pistes = buildInitialPistes(["Amour", "Chaos"]);
    expect(pistes.find((p) => p.word === "Amour")?.excluded).toBe(true);
    expect(pistes.find((p) => p.word === "Chaos")?.excluded).toBe(true);
    expect(pistes.find((p) => p.word === "Animal")?.excluded).toBe(false);
  });
});

describe("availablePisteSlots", () => {
  it("returns 9 slots for a fresh game", () => {
    expect(availablePisteSlots(freshPistes())).toHaveLength(9);
  });

  it("decreases by 1 when a piste is followed", () => {
    const pistes = freshPistes();
    const deck = buildStoryDeck([], seededRng(1));
    const { pistes: updated } = followPiste("Amour", pistes, deck, "spade-2", seededRng(1));
    expect(availablePisteSlots(updated)).toHaveLength(8);
  });

  it("returns empty when all 9 slots used", () => {
    let pistes = freshPistes();
    let deck = buildStoryDeck([], seededRng(1));
    const slots = availablePisteSlots(pistes);
    const words = ["Amour", "Animal", "Autel", "Calme", "Cauchemars", "Chaos", "Culte", "Jouet", "Effrayant"] as const;
    for (let i = 0; i < 9; i++) {
      const result = followPiste(words[i]!, pistes, deck, slots[i]!, seededRng(i));
      pistes = result.pistes;
      deck = result.storyDeck;
    }
    expect(availablePisteSlots(pistes)).toHaveLength(0);
  });
});

describe("followPiste", () => {
  it("marks the piste as followed", () => {
    const pistes = freshPistes();
    const deck = buildStoryDeck([], seededRng(1));
    const { pistes: updated } = followPiste("Animal", pistes, deck, "spade-3", seededRng(1));
    expect(updated.find((p) => p.word === "Animal")?.followed).toBe(true);
  });

  it("assigns the spade card to the piste", () => {
    const pistes = freshPistes();
    const deck = buildStoryDeck([], seededRng(1));
    const { pistes: updated } = followPiste("Animal", pistes, deck, "spade-4", seededRng(1));
    expect(updated.find((p) => p.word === "Animal")?.assignedCardId).toBe("spade-4");
  });

  it("increases deck length by 1", () => {
    const pistes = freshPistes();
    const deck = buildStoryDeck([], seededRng(1));
    const { storyDeck } = followPiste("Animal", pistes, deck, "spade-5", seededRng(1));
    expect(storyDeck).toHaveLength(deck.length + 1);
  });

  it("does not change deck if piste already followed", () => {
    let pistes = freshPistes();
    let deck = buildStoryDeck([], seededRng(1));
    ({ pistes, storyDeck: deck } = followPiste("Amour", pistes, deck, "spade-2", seededRng(1)));
    const deckBefore = [...deck];
    const { storyDeck, assignedCard } = followPiste("Amour", pistes, deck, "spade-3", seededRng(2));
    expect(storyDeck).toEqual(deckBefore);
    expect(assignedCard).toBeNull();
  });

  it("does not change deck if piste is excluded", () => {
    const pistes = buildInitialPistes(["Calme"]);
    const deck = buildStoryDeck([], seededRng(1));
    const deckBefore = [...deck];
    const { storyDeck, assignedCard } = followPiste("Calme", pistes, deck, "spade-2", seededRng(1));
    expect(storyDeck).toEqual(deckBefore);
    expect(assignedCard).toBeNull();
  });

  it("does not mutate the original piste array", () => {
    const pistes = freshPistes();
    const deck = buildStoryDeck([], seededRng(1));
    followPiste("Esprit", pistes, deck, "spade-6", seededRng(1));
    expect(pistes.find((p) => p.word === "Esprit")?.followed).toBe(false);
  });
});
