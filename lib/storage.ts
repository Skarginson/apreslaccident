import Dexie, { type Table } from "dexie";
import type { Game } from "@/core/types";

class AppDatabase extends Dexie {
  games!: Table<Game>;

  constructor() {
    super("apreslaccident-v1");
    this.version(1).stores({
      games: "id, status, updatedAt",
    });
  }
}

let _db: AppDatabase | null = null;

export function getDb(): AppDatabase {
  if (!_db) _db = new AppDatabase();
  return _db;
}

export async function saveGame(game: Game): Promise<void> {
  await getDb().games.put(game);
}

export async function loadGame(id: string): Promise<Game | undefined> {
  return getDb().games.get(id);
}

export async function loadLatestGame(): Promise<Game | undefined> {
  return getDb().games.orderBy("updatedAt").last();
}

export async function listGames(): Promise<Game[]> {
  return getDb().games.orderBy("updatedAt").reverse().toArray();
}

export async function deleteGame(id: string): Promise<void> {
  await getDb().games.delete(id);
}
