"use client";

import { create } from "zustand";
import type { CardId, Game, PisteWord } from "@/core/types";
import {
  createGame as coreCreateGame,
  playEntry as corePlayEntry,
  concludeGame as coreConcludeGame,
  writeEpilogueEntry as coreWriteEpilogueEntry,
  type CreateGameInput,
  type WriteEpilogueInput,
} from "@/core/game";
import { availablePisteSlots } from "@/core/pistes";
import { defaultRng } from "@/core/rng";
import { saveGame, loadGame, loadLatestGame } from "@/lib/storage";

export interface PlayEntryStoreInput {
  journalText: string;
  promptSnapshot: string;
  pistesOffered: readonly string[] | null;
  pisteFollowed?: PisteWord;
  pisteAssignedSlot?: CardId;
}

interface GameStore {
  game: Game | null;
  isLoading: boolean;
  error: string | null;

  /* ─── Chargement ─── */
  loadGame: (id: string) => Promise<void>;
  loadLatestGame: () => Promise<void>;

  /* ─── Création ─── */
  createGame: (input: CreateGameInput) => Promise<Game>;

  /* ─── Actions de jeu ─── */
  playEntry: (input: PlayEntryStoreInput) => Promise<{ drawnCard: CardId; gameEnded: boolean }>;
  concludeGame: (epilogueCard: Game["epilogueCard"]) => Promise<void>;
  writeEpilogueEntry: (input: WriteEpilogueInput) => Promise<void>;

  /* ─── Utilitaires ─── */
  availableSlots: () => CardId[];
  clearGame: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  game: null,
  isLoading: false,
  error: null,

  loadGame: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const game = await loadGame(id);
      set({ game: game ?? null, isLoading: false });
    } catch (e) {
      set({ error: String(e), isLoading: false });
    }
  },

  loadLatestGame: async () => {
    set({ isLoading: true, error: null });
    try {
      const game = await loadLatestGame();
      set({ game: game ?? null, isLoading: false });
    } catch (e) {
      set({ error: String(e), isLoading: false });
    }
  },

  createGame: async (input) => {
    const game = coreCreateGame(input, defaultRng);
    await saveGame(game);
    set({ game });
    return game;
  },

  playEntry: async (input) => {
    const { game } = get();
    if (!game) throw new Error("Aucune partie active");

    const { game: updated, drawnCard, gameEnded } = corePlayEntry(game, input, defaultRng);

    // Patch le snapshot et les pistes proposées dans la dernière entrée
    const entries = [...updated.entries];
    const last = entries[entries.length - 1];
    if (last) {
      entries[entries.length - 1] = {
        ...last,
        promptSnapshot: input.promptSnapshot,
        pistesOffered: input.pistesOffered,
        pisteFollowed: input.pisteFollowed ?? null,
      };
    }
    const final: Game = { ...updated, entries };

    await saveGame(final);
    set({ game: final });

    return { drawnCard, gameEnded };
  },

  concludeGame: async (epilogueCard) => {
    const { game } = get();
    if (!game) throw new Error("Aucune partie active");
    const concluded = coreConcludeGame(game, { epilogueCard });
    await saveGame(concluded);
    set({ game: concluded });
  },

  writeEpilogueEntry: async (input) => {
    const { game } = get();
    if (!game) throw new Error("Aucune partie active");
    const updated = coreWriteEpilogueEntry(game, input);
    await saveGame(updated);
    set({ game: updated });
  },

  availableSlots: () => {
    const { game } = get();
    if (!game) return [];
    return availablePisteSlots(game.pistes);
  },

  clearGame: () => set({ game: null }),
}));
