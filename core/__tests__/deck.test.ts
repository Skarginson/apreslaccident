import { describe, it, expect } from "vitest";
import { buildStoryDeck, drawTopCard, insertPisteIntoDeck } from "../deck";
import { seededRng } from "../rng";

describe("buildStoryDeck", () => {
  it("returns exactly 20 cards", () => {
    const deck = buildStoryDeck([], seededRng(42));
    expect(deck).toHaveLength(20);
  });

  it("has spade-ace as the last card", () => {
    const deck = buildStoryDeck([], seededRng(42));
    expect(deck[deck.length - 1]).toBe("spade-ace");
  });

  it("has 6 hearts, 7 diamonds, 6 clubs in the first 19 positions", () => {
    const deck = buildStoryDeck([], seededRng(42));
    const main = deck.slice(0, 19);
    const hearts = main.filter((c) => c.startsWith("heart-"));
    const diamonds = main.filter((c) => c.startsWith("diamond-"));
    const clubs = main.filter((c) => c.startsWith("club-"));
    expect(hearts).toHaveLength(6);
    expect(diamonds).toHaveLength(7);
    expect(clubs).toHaveLength(6);
  });

  it("hearts come before diamonds, diamonds before clubs", () => {
    const deck = buildStoryDeck([], seededRng(42));
    const main = deck.slice(0, 19);
    const lastHeart = main.findLastIndex((c) => c.startsWith("heart-"));
    const firstDiamond = main.findIndex((c) => c.startsWith("diamond-"));
    const lastDiamond = main.findLastIndex((c) => c.startsWith("diamond-"));
    const firstClub = main.findIndex((c) => c.startsWith("club-"));
    expect(lastHeart).toBeLessThan(firstDiamond);
    expect(lastDiamond).toBeLessThan(firstClub);
  });

  it("is reproducible with the same seed", () => {
    const a = buildStoryDeck([], seededRng(99));
    const b = buildStoryDeck([], seededRng(99));
    expect(a).toEqual(b);
  });

  it("differs with different seeds", () => {
    const a = buildStoryDeck([], seededRng(1));
    const b = buildStoryDeck([], seededRng(2));
    expect(a).not.toEqual(b);
  });

  it("excludes the specified cards", () => {
    const excluded = ["heart-ace", "diamond-king"] as const;
    const deck = buildStoryDeck([...excluded], seededRng(42));
    for (const c of excluded) {
      expect(deck).not.toContain(c);
    }
  });

  it("has no duplicate cards", () => {
    const deck = buildStoryDeck([], seededRng(42));
    const unique = new Set(deck);
    expect(unique.size).toBe(deck.length);
  });
});

describe("drawTopCard", () => {
  it("returns the first card and the rest of the deck", () => {
    const deck = buildStoryDeck([], seededRng(42));
    const [card, remaining] = drawTopCard(deck);
    expect(card).toBe(deck[0]);
    expect(remaining).toHaveLength(19);
    expect(remaining).toEqual(deck.slice(1));
  });

  it("throws when deck is empty", () => {
    expect(() => drawTopCard([])).toThrow();
  });
});

describe("insertPisteIntoDeck", () => {
  it("increases deck length by 1", () => {
    const deck = buildStoryDeck([], seededRng(42));
    const result = insertPisteIntoDeck(deck, "spade-5", seededRng(1));
    expect(result).toHaveLength(deck.length + 1);
  });

  it("places the piste card in the top 6 positions", () => {
    const deck = buildStoryDeck([], seededRng(42));
    const result = insertPisteIntoDeck(deck, "spade-5", seededRng(1));
    expect(result.slice(0, 6)).toContain("spade-5");
  });

  it("preserves the rest of the deck after the top 6", () => {
    const deck = buildStoryDeck([], seededRng(42));
    const result = insertPisteIntoDeck(deck, "spade-5", seededRng(1));
    expect(result.slice(6)).toEqual(deck.slice(5));
  });

  it("works when deck has fewer than 5 cards", () => {
    const smallDeck: import("../types").CardId[] = ["spade-ace", "heart-2", "diamond-3"];
    const result = insertPisteIntoDeck(smallDeck, "spade-7", seededRng(1));
    expect(result).toHaveLength(4);
    expect(result).toContain("spade-7");
  });
});
