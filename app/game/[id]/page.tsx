"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useGameStore } from "@/stores/useGameStore";
import { GameSideNav } from "@/components/game/GameSideNav";

export default function GameHubPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { game, isLoading, loadGame } = useGameStore();

  useEffect(() => {
    if (!game || game.id !== id) {
      loadGame(id);
    }
  }, [id, game, loadGame]);

  useEffect(() => {
    if (game && game.status === "concluded") {
      router.replace(`/game/${id}/end`);
    }
  }, [game, id, router]);

  if (isLoading || !game) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="font-label text-[0.6875rem] uppercase tracking-[0.05rem] text-secondary">
          Chargement…
        </p>
      </div>
    );
  }

  const dayNumber = game.entries.length + 1;

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <GameSideNav game={game} />

      <main className="flex-1 relative flex flex-col items-center justify-center p-8 md:p-16 min-h-screen">
        {/* Décor atmosphérique */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.025] flex items-center justify-center select-none">
          <span className="font-headline text-[30rem] text-on-surface">♦</span>
        </div>

        <div className="w-full max-w-2xl flex flex-col items-center gap-14 relative z-10">
          {/* Texte de contexte */}
          <div className="text-center max-w-md">
            <p className="font-journal text-2xl text-on-surface-variant leading-relaxed opacity-80 mb-3">
              {game.frame.description.slice(0, 120)}
              {game.frame.description.length > 120 ? "…" : ""}
            </p>
            <p className="font-headline text-lg text-on-surface opacity-60 italic">
              Que réserve le jour {dayNumber} ?
            </p>
          </div>

          {/* CTA principal : tirer la carte */}
          <Link href={`/game/${id}/draw`}>
            <button className="group relative flex flex-col items-center justify-center w-64 h-80 bg-surface-container-lowest border border-outline-variant/20 ambient-shadow hover:shadow-[0_30px_60px_rgba(29,28,22,0.10)] transition-all duration-700 ease-out">
              <div className="absolute inset-2 bg-surface-container-low opacity-50 transition-opacity duration-500 group-hover:opacity-100" />
              <div className="relative z-10 flex flex-col items-center gap-8">
                <span className="text-primary text-5xl opacity-70 group-hover:scale-110 transition-transform duration-500">
                  ♦
                </span>
                <div className="flex flex-col items-center gap-2 px-6 text-center">
                  <span className="font-headline text-xl text-primary-container tracking-wide group-hover:text-primary transition-colors">
                    Tirer la carte
                  </span>
                  <span className="font-label text-[0.65rem] uppercase tracking-widest text-secondary">
                    du jour
                  </span>
                </div>
              </div>
            </button>
          </Link>

          {/* Actions secondaires */}
          <div className="flex flex-row gap-12">
            <Link
              href={`/game/${id}/journal`}
              className="group flex flex-col items-center gap-1"
            >
              <span className="font-headline text-sm text-secondary group-hover:text-on-surface transition-colors">
                Relire mon journal
              </span>
              <div className="h-px w-0 bg-outline-variant/30 group-hover:w-full transition-all duration-300 ease-out" />
            </Link>
            <Link href="/" className="group flex flex-col items-center gap-1">
              <span className="font-headline text-sm text-secondary group-hover:text-on-surface transition-colors">
                Accueil
              </span>
              <div className="h-px w-0 bg-outline-variant/30 group-hover:w-full transition-all duration-300 ease-out" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
