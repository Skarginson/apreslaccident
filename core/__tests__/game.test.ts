import { describe, it, expect } from "vitest";
import { createGame, playEntry, concludeGame } from "../game";
import { seededRng } from "../rng";
import type { Game } from "../types";

function makeGame(): Game {
  return createGame(
    {
      frame: { type: "preset", title: "L'Île Déserte", description: "Test" },
      woundCard: "spade-king",
    },
    seededRng(42),
  );
}

describe("createGame", () => {
  it("creates a game in playing status", () => {
    expect(makeGame().status).toBe("playing");
  });

  it("starts with an empty journal", () => {
    expect(makeGame().entries).toHaveLength(0);
  });

  it("storyDeck has 20 cards", () => {
    expect(makeGame().storyDeck).toHaveLength(20);
  });

  it("spade-ace is at the bottom of the deck", () => {
    const game = makeGame();
    expect(game.storyDeck[game.storyDeck.length - 1]).toBe("spade-ace");
  });

  it("has 18 piste states", () => {
    expect(makeGame().pistes).toHaveLength(18);
  });

  it("epilogueCard is null at start", () => {
    expect(makeGame().epilogueCard).toBeNull();
  });
});

describe("playEntry", () => {
  it("adds an entry to the journal", () => {
    const game = makeGame();
    const { game: updated } = playEntry(game, { journalText: "Jour 1." }, seededRng(1));
    expect(updated.entries).toHaveLength(1);
  });

  it("increments dayNumber sequentially", () => {
    let game = makeGame();
    for (let i = 1; i <= 3; i++) {
      const result = playEntry(game, { journalText: `Jour ${i}.` }, seededRng(i));
      game = result.game;
      expect(game.entries[i - 1]?.dayNumber).toBe(i);
    }
  });

  it("reduces storyDeck by 1 when no piste followed", () => {
    const game = makeGame();
    const { game: updated } = playEntry(game, { journalText: "." }, seededRng(1));
    expect(updated.storyDeck).toHaveLength(19);
  });

  it("adds drawn card to discard pile", () => {
    const game = makeGame();
    const firstCard = game.storyDeck[0]!;
    const { game: updated } = playEntry(game, { journalText: "." }, seededRng(1));
    expect(updated.discardPile).toContain(firstCard);
  });

  it("does not mutate the original game", () => {
    const game = makeGame();
    const original = JSON.stringify(game);
    playEntry(game, { journalText: "." }, seededRng(1));
    expect(JSON.stringify(game)).toBe(original);
  });

  it("throws if game is not in playing status", () => {
    let game = makeGame();
    // drain all cards to reach spade-ace
    while (game.status === "playing") {
      const result = playEntry(game, { journalText: "." }, seededRng(1));
      game = result.game;
    }
    expect(() => playEntry(game, { journalText: "." }, seededRng(1))).toThrow();
  });
});

describe("full game — 20 draws leading to concluded", () => {
  it("concludes when spade-ace is drawn (bottom of fresh deck = draw 20)", () => {
    let game = makeGame();
    let gameEnded = false;
    let turns = 0;

    while (!gameEnded) {
      const result = playEntry(game, { journalText: `Entrée ${turns + 1}.` }, seededRng(turns));
      game = result.game;
      gameEnded = result.gameEnded;
      turns++;
      if (turns > 40) throw new Error("Game did not end after 40 turns");
    }

    expect(game.status).toBe("concluded");
    expect(game.entries.length).toBeGreaterThanOrEqual(20);
  });

  it("entries are added in sequential order", () => {
    let game = makeGame();
    while (game.status === "playing") {
      game = playEntry(game, { journalText: "." }, seededRng(game.entries.length)).game;
    }
    for (let i = 0; i < game.entries.length; i++) {
      expect(game.entries[i]?.dayNumber).toBe(i + 1);
    }
  });

  it("spade-ace drawn triggers end even if inserted via piste earlier", () => {
    let game = createGame(
      { frame: { type: "custom", title: "T", description: "D" }, woundCard: "spade-jack" },
      seededRng(10),
    );
    // Follow a piste to insert a spade card, potentially moving spade-ace
    const slot = "spade-2";
    const result = playEntry(
      game,
      { journalText: ".", pisteFollowed: "Amour", pisteAssignedSlot: slot },
      seededRng(1),
    );
    game = result.game;
    // Continue until game ends
    let turns = 0;
    while (game.status === "playing") {
      game = playEntry(game, { journalText: "." }, seededRng(turns++)).game;
      if (turns > 50) throw new Error("Game never ended");
    }
    expect(game.status).toBe("concluded");
  });
});

describe("concludeGame", () => {
  it("sets the epilogue card", () => {
    let game = makeGame();
    while (game.status === "playing") {
      game = playEntry(game, { journalText: "." }, seededRng(0)).game;
    }
    const concluded = concludeGame(game, { epilogueCard: "spade-queen" });
    expect(concluded.epilogueCard).toBe("spade-queen");
  });

  it("throws if game is still playing", () => {
    expect(() => concludeGame(makeGame(), { epilogueCard: "spade-king" })).toThrow();
  });
});
