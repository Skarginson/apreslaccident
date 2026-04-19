"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useGameStore } from "@/stores/useGameStore";
import { GameSideNav } from "@/components/game/GameSideNav";
import { cardLabel } from "@/lib/content";

export default function JournalPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { game, isLoading, loadGame } = useGameStore();

  useEffect(() => {
    if (!game || game.id !== id) {
      loadGame(id);
    }
  }, [id, game, loadGame]);

  if (isLoading || !game) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="font-label text-[0.6875rem] uppercase tracking-[0.05rem] text-secondary">
          Chargement…
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <GameSideNav game={game} />

      <main className="flex-1 overflow-y-auto flex justify-center pt-16 pb-24 px-6 md:px-12 relative">
        <div className="max-w-[680px] w-full">
          {/* En-tête */}
          <header className="mb-20 flex justify-between items-end border-b border-outline-variant/30 pb-6">
            <div>
              <h2 className="text-5xl md:text-6xl font-headline text-primary tracking-tighter mb-3 italic">
                Relecture
              </h2>
              <p className="text-lg text-on-surface-variant font-headline">
                {game.entries.length} entrée{game.entries.length > 1 ? "s" : ""} —{" "}
                {game.frame.title}
              </p>
            </div>
            <Link
              href={`/game/${id}`}
              className="font-label text-[0.6875rem] uppercase tracking-[0.05rem] text-secondary hover:text-on-surface transition-colors pb-1 border-b border-transparent hover:border-outline-variant/30"
            >
              ← Retour
            </Link>
          </header>

          {/* Entrées */}
          <div className="space-y-24">
            {game.entries.map((entry) => (
              <article key={entry.id} className="relative">
                {/* En-tête de l'entrée */}
                <div className="mb-5 flex justify-between items-baseline">
                  <h3 className="text-2xl font-headline text-primary font-medium tracking-tight">
                    Jour {entry.dayNumber} — {cardLabel(entry.cardId)}
                  </h3>
                  {entry.pisteFollowed && (
                    <span className="text-[0.6875rem] uppercase tracking-[0.05rem] text-secondary border border-outline-variant/30 px-2 py-1">
                      {entry.pisteFollowed}
                    </span>
                  )}
                </div>

                {/* Prompt */}
                <div className="pl-6 border-l-2 border-surface-container-highest">
                  {entry.promptSnapshot && (
                    <div className="mb-6">
                      <p className="text-lg text-on-surface-variant font-headline italic leading-relaxed">
                        &ldquo;{entry.promptSnapshot}&rdquo;
                      </p>
                    </div>
                  )}

                  {/* Texte du journal */}
                  <div className="bg-surface-container-low p-8 relative">
                    {/* Lignes de papier */}
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        backgroundImage:
                          "repeating-linear-gradient(transparent, transparent 39px, rgba(221,192,190,0.25) 39px, rgba(221,192,190,0.25) 40px)",
                        backgroundPosition: "0 8px",
                      }}
                    />
                    <p className="font-journal text-2xl text-on-background leading-10 relative z-10 whitespace-pre-wrap">
                      {entry.journalText}
                    </p>
                  </div>

                  {/* Date */}
                  <p className="mt-3 text-right font-label text-[0.6875rem] uppercase tracking-[0.05rem] text-secondary">
                    {new Date(entry.drawnAt).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                    })}
                  </p>
                </div>
              </article>
            ))}
          </div>

          {/* Séparateur de fin */}
          <div className="mt-24 flex justify-center">
            <span className="text-outline-variant text-2xl">△</span>
          </div>
        </div>
      </main>
    </div>
  );
}
