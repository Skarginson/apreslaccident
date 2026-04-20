"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useGameStore } from "@/stores/useGameStore";
import { cardLabel } from "@/lib/content";

export default function PrintPage() {
  const { id } = useParams<{ id: string }>();
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
    <>
      <style>{`
        @page { size: A4; margin: 2.5cm 3cm; }
        @media print { body { background: white !important; } }
      `}</style>

      {/* Contrôles — masqués à l'impression */}
      <div className="print:hidden fixed top-6 right-6 flex items-center gap-6 z-50">
        <a
          href={`/game/${id}/end`}
          className="font-label text-[0.6875rem] uppercase tracking-[0.05rem] text-secondary hover:text-on-surface transition-colors"
        >
          ← Retour
        </a>
        <button
          onClick={() => window.print()}
          className="btn-primary px-8 py-3 font-label text-[0.6875rem] uppercase tracking-[0.05rem]"
        >
          Imprimer / PDF
        </button>
      </div>

      <main className="max-w-[660px] mx-auto px-8 py-20 print:px-0 print:py-0">

        {/* Couverture */}
        <header className="mb-20 pb-10 border-b border-outline-variant/40 print:border-gray-300">
          <p className="font-label text-[0.6875rem] uppercase tracking-[0.3rem] text-secondary print:text-gray-400 mb-6">
            Après l&apos;accident
          </p>
          <h1 className="font-headline text-5xl text-on-surface print:text-black tracking-tight leading-none mb-6">
            {game.frame.title}
          </h1>
          <p className="font-body text-base text-secondary print:text-gray-600 leading-relaxed italic max-w-lg">
            {game.frame.description}
          </p>
          <div className="mt-8 flex flex-wrap gap-x-8 gap-y-1">
            {game.survivor?.name && (
              <p className="font-label text-[0.6875rem] uppercase tracking-[0.05rem] text-secondary print:text-gray-500">
                Survivante : {game.survivor.name}
              </p>
            )}
            <p className="font-label text-[0.6875rem] uppercase tracking-[0.05rem] text-secondary print:text-gray-400">
              {new Date(game.createdAt).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
            <p className="font-label text-[0.6875rem] uppercase tracking-[0.05rem] text-secondary print:text-gray-400">
              {game.entries.length} entrée{game.entries.length > 1 ? "s" : ""}
            </p>
          </div>
        </header>

        {/* Entrées */}
        <div className="flex flex-col gap-16">
          {game.entries.map((entry) => (
            <article key={entry.id} className="break-inside-avoid">

              {/* En-tête de l'entrée */}
              <div className="flex justify-between items-baseline mb-3 break-after-avoid">
                <h2 className="font-headline text-lg text-primary print:text-black font-medium tracking-tight">
                  Jour {entry.dayNumber} &mdash; {cardLabel(entry.cardId)}
                </h2>
                <div className="flex items-center gap-3 shrink-0 ml-4">
                  {entry.pisteFollowed && (
                    <span className="font-label text-[0.6rem] uppercase tracking-[0.05rem] text-secondary print:text-gray-500 border border-outline-variant/30 print:border-gray-300 px-2 py-0.5">
                      {entry.pisteFollowed}
                    </span>
                  )}
                  <span className="font-label text-[0.6rem] text-secondary print:text-gray-400">
                    {new Date(entry.drawnAt).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                    })}
                  </span>
                </div>
              </div>

              {/* Prompt */}
              {entry.promptSnapshot && (
                <p className="font-headline text-sm italic text-on-surface-variant print:text-gray-500 leading-relaxed mb-5 pl-4 border-l-2 border-outline-variant/30 print:border-gray-300 break-after-avoid">
                  {entry.promptSnapshot}
                </p>
              )}

              {/* Texte du journal */}
              <p className="font-journal text-xl print:text-[1.15rem] text-on-surface print:text-black leading-9 whitespace-pre-wrap">
                {entry.journalText}
              </p>

            </article>
          ))}
        </div>

        {/* Pied de page */}
        <footer className="mt-24 pt-8 border-t border-outline-variant/30 print:border-gray-300">
          <p className="font-label text-[0.6rem] uppercase tracking-[0.05rem] text-secondary print:text-gray-400 text-center leading-loose">
            Adapté du jeu <em className="normal-case not-italic font-medium">Après l&apos;accident</em>{" "}
            de Nicolas &ldquo;Gulix&rdquo; Ronvel / Neoludis, 2025
            <br />
            Adaptation réalisée avec l&apos;accord de l&apos;auteur
          </p>
        </footer>

      </main>
    </>
  );
}
