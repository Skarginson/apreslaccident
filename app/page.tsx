"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { loadLatestGame } from "@/lib/storage";
import type { Game } from "@/core/types";

export default function HomePage() {
  const [latestGame, setLatestGame] = useState<Game | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    loadLatestGame()
      .then((g) => setLatestGame(g ?? null))
      .catch(() => setLatestGame(null))
      .finally(() => setChecked(true));
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-between p-8 md:p-16">
      {/* Zone principale */}
      <div className="flex-grow flex items-center justify-center w-full max-w-4xl">
        <main className="flex flex-col items-center text-center w-full gap-16">
          {/* Illustration esquisse */}
          <div className="relative w-full max-w-md aspect-video opacity-70">
            {/* Placeholder SVG — avion échoué, style esquisse */}
            <svg
              viewBox="0 0 400 225"
              className="w-full h-full"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <line x1="20" y1="180" x2="380" y2="180" stroke="#897170" strokeWidth="1" opacity="0.4" />
              {/* Corps de l'avion */}
              <ellipse cx="200" cy="160" rx="90" ry="18" stroke="#564240" strokeWidth="1.5" />
              {/* Aile gauche */}
              <path d="M 140 160 L 60 130 L 80 165" stroke="#564240" strokeWidth="1.5" />
              {/* Aile droite */}
              <path d="M 260 160 L 340 130 L 320 165" stroke="#564240" strokeWidth="1.5" />
              {/* Stabilisateur */}
              <path d="M 290 160 L 310 140 L 310 160" stroke="#564240" strokeWidth="1.2" />
              {/* Nez cassé */}
              <path d="M 200 142 C 240 138, 285 148, 290 160" stroke="#564240" strokeWidth="1.2" />
              {/* Débris */}
              <line x1="100" y1="180" x2="110" y2="168" stroke="#897170" strokeWidth="1" />
              <line x1="280" y1="180" x2="295" y2="172" stroke="#897170" strokeWidth="1" />
              <line x1="160" y1="180" x2="155" y2="170" stroke="#897170" strokeWidth="0.8" />
              {/* Horizon lointain */}
              <line x1="20" y1="100" x2="380" y2="100" stroke="#ddc0be" strokeWidth="0.5" />
            </svg>
          </div>

          {/* Titre monumental */}
          <h1 className="text-6xl md:text-[5rem] lg:text-[6rem] font-headline font-semibold tracking-tighter leading-none text-on-surface">
            Après l&apos;accident
          </h1>
          <h2 className="text-2xl md:text-3xl font-label uppercase tracking-wide text-secondary">
            Journal d'une rescapée
          </h2>
          {/* Actions */}
          <div className="flex flex-col items-center gap-8 mt-4">
            <Link href="/game/new">
              <button className="btn-primary px-12 py-5 text-xl md:text-2xl font-body tracking-wide ambient-shadow">
                Nouvelle partie
              </button>
            </Link>

            {checked && latestGame && latestGame.status === "playing" && (
              <Link href={`/game/${latestGame.id}`}>
                <button className="btn-secondary px-4 py-2 text-lg md:text-xl font-body tracking-wide pb-1">
                  Reprendre la partie
                </button>
              </Link>
            )}
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="w-full max-w-4xl flex justify-center gap-12 mt-16 pt-8">
        <Link
          href="/about"
          className="text-[0.6875rem] font-label uppercase tracking-[0.05rem] text-secondary hover:text-on-surface transition-colors duration-300 pb-1 border-b border-transparent hover:border-outline-variant/30"
        >
          À propos du jeu
        </Link>
        <a
          href="https://gulix.itch.io/leads"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[0.6875rem] font-label uppercase tracking-[0.05rem] text-secondary hover:text-on-surface transition-colors duration-300 pb-1 border-b border-transparent hover:border-outline-variant/30"
        >
          Système LEADS
        </a>
      </footer>
    </div>
  );
}
