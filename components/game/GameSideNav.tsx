"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Game } from "@/core/types";
import { DeckStack } from "./DeckStack";

interface GameSideNavProps {
  game: Game;
}

export function GameSideNav({ game }: GameSideNavProps) {
  const pathname = usePathname();
  const base = `/game/${game.id}`;

  const followedPistes = game.pistes.filter((p) => p.followed && !p.excluded);
  const totalPistes = game.pistes.filter((p) => !p.excluded).length;

  return (
    <nav className="hidden md:flex flex-col p-8 gap-10 h-full w-64 bg-surface-container-low shrink-0">
      {/* En-tête */}
      <div className="flex flex-col gap-1">
        <h1 className="font-headline text-xl font-medium text-on-surface tracking-wide">
          {game.frame.title}
        </h1>
        <p className="font-label uppercase tracking-[0.05rem] text-[0.6875rem] text-secondary">
          Jour {game.entries.length + (game.status === "concluded" ? 0 : 0)}
        </p>
      </div>

      {/* Paquet Histoire */}
      <DeckStack remaining={game.storyDeck.length} />

      {/* Pistes suivies */}
      <div className="flex flex-col gap-3 flex-1 overflow-y-auto">
        <h2 className="font-label uppercase tracking-[0.05rem] text-[0.6875rem] text-on-surface">
          Pistes ({followedPistes.length}/{totalPistes})
        </h2>
        <ul className="flex flex-col gap-2">
          {game.pistes
            .filter((p) => !p.excluded)
            .map((p) => (
              <li
                key={p.word}
                className={[
                  "flex items-center gap-2 text-[0.6875rem] font-label uppercase tracking-[0.05rem]",
                  p.followed
                    ? "text-primary border-b border-primary/30 pb-1"
                    : "text-secondary",
                ].join(" ")}
              >
                <span className="opacity-60">{p.followed ? "●" : "○"}</span>
                <span>{p.word}</span>
              </li>
            ))}
        </ul>
      </div>

      {/* Navigation */}
      <div className="flex flex-col gap-3 mt-auto pt-6">
        <Link
          href={`${base}/journal`}
          className={[
            "font-label uppercase tracking-[0.05rem] text-[0.6875rem] transition-colors duration-200",
            pathname.includes("/journal")
              ? "text-primary"
              : "text-secondary hover:text-on-surface",
          ].join(" ")}
        >
          Relire mon journal
        </Link>
        <Link
          href="/"
          className="font-label uppercase tracking-[0.05rem] text-[0.6875rem] text-secondary hover:text-on-surface transition-colors duration-200"
        >
          Accueil
        </Link>
      </div>
    </nav>
  );
}
