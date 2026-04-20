"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useGameStore } from "@/stores/useGameStore";
import { getEpilogueText } from "@/lib/content";
import { downloadMarkdown } from "@/lib/export";
import { JournalEditor } from "@/components/game/JournalEditor";
import { seededRng } from "@/core/rng";

const EPILOGUE_CARDS: Array<"spade-king" | "spade-queen" | "spade-jack"> = [
  "spade-king",
  "spade-queen",
  "spade-jack",
];

function pickEpilogueCard(): "spade-king" | "spade-queen" | "spade-jack" {
  const rng = seededRng(Date.now() & 0xffff);
  const idx = Math.floor(rng() * 3);
  return EPILOGUE_CARDS[idx] ?? "spade-king";
}

export default function EndPage() {
  const { id } = useParams<{ id: string }>();
  const { game, isLoading, loadGame, writeEpilogueEntry } = useGameStore();

  const [epilogueCard, setEpilogueCard] = useState<"spade-king" | "spade-queen" | "spade-jack" | null>(null);
  const [journalText, setJournalText] = useState("");
  const [isClosed, setIsClosed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!game || game.id !== id) {
      loadGame(id);
    }
  }, [id, game, loadGame]);

  useEffect(() => {
    if (game?.epilogueCard) {
      setEpilogueCard(game.epilogueCard);
      setIsClosed(true);
    }
  }, [game?.epilogueCard]);

  const handleDrawEpilogue = useCallback(() => {
    setEpilogueCard(pickEpilogueCard());
  }, []);

  const handleClose = useCallback(async () => {
    if (!epilogueCard || !journalText.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await writeEpilogueEntry({
        journalText,
        promptSnapshot: getEpilogueText(epilogueCard),
        epilogueCard,
      });
      setIsClosed(true);
    } catch (e) {
      console.error(e);
      setIsSubmitting(false);
    }
  }, [epilogueCard, journalText, isSubmitting, writeEpilogueEntry]);

  const handleExport = useCallback(() => {
    if (game) downloadMarkdown(game);
  }, [game]);

  if (isLoading || !game) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="font-label text-[0.6875rem] uppercase tracking-[0.05rem] text-secondary">
          Chargement…
        </p>
      </div>
    );
  }

  const SUIT_SYMBOLS: Record<string, string> = {
    king: "R",
    queen: "D",
    jack: "V",
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative p-6 md:p-12 w-full max-w-5xl mx-auto">
      {/* Boutons d'export */}
      {isClosed && (
        <div className="absolute top-8 right-8 flex gap-6">
          <button
            onClick={handleExport}
            className="font-label text-[0.6875rem] uppercase tracking-widest text-secondary hover:text-on-surface transition-colors pb-1 border-b border-outline-variant/30 hover:border-outline-variant flex items-center gap-2"
          >
            ↓ Exporter en Markdown
          </button>
        </div>
      )}

      <article className="w-full max-w-2xl flex flex-col items-center text-center gap-14 mt-16 md:mt-0">
        {/* Annonce solennelle */}
        <header>
          <h1
            className="font-headline text-5xl md:text-6xl text-on-surface tracking-tight"
            style={{ fontWeight: 300 }}
          >
            L&apos;histoire touche à sa fin.
          </h1>
        </header>

        {/* As de pique SVG */}
        <div className="relative w-44 h-72 flex items-center justify-center">
          <svg width="100%" height="100%" viewBox="0 0 200 300" xmlns="http://www.w3.org/2000/svg">
            <rect
              fill="none"
              stroke="#897170"
              strokeWidth="1.5"
              opacity="0.3"
              width="190"
              height="290"
              x="5"
              y="5"
            />
            <text fill="#1d1c16" fontFamily="Newsreader" fontSize="22" x="18" y="38">A</text>
            <path d="M 22 42 C 27 37, 32 42, 27 52 C 22 57, 17 52, 22 42 Z" fill="#1d1c16" opacity="0.8" />
            <text fill="#1d1c16" fontFamily="Newsreader" fontSize="22" transform="rotate(180 175 258)" x="175" y="258">A</text>
            <g transform="translate(100, 152) scale(1.8)">
              <path d="M 0 -30 C 20 -10, 30 10, 0 30 C -30 10, -20 -10, 0 -30 Z" fill="#1d1c16" opacity="0.88" />
              <path d="M -5 30 L 5 30 L 2 44 L -2 44 Z" fill="#1d1c16" opacity="0.88" />
            </g>
          </svg>
        </div>

        {!epilogueCard && (
          <div className="flex flex-col items-center gap-6">
            <p className="font-body text-lg text-secondary leading-relaxed max-w-md">
              Tirez une figure de pique pour votre épilogue.
            </p>
            <button onClick={handleDrawEpilogue} className="btn-primary px-10 py-4 font-label text-[0.6875rem] uppercase tracking-[0.05rem]">
              Tirer l&apos;épilogue
            </button>
          </div>
        )}

        {epilogueCard && !isClosed && (
          <div className="w-full flex flex-col gap-8 bg-surface-container-low p-8 md:p-12 ambient-shadow">
            <div>
              <p className="font-label text-[0.6875rem] uppercase tracking-[0.05rem] text-secondary mb-3">
                {SUIT_SYMBOLS[epilogueCard.split("-")[1] ?? ""] ?? ""} de Pique — Épilogue
              </p>
              <label className="block font-headline text-2xl text-on-surface italic text-left">
                {getEpilogueText(epilogueCard)}
              </label>
            </div>

            <JournalEditor
              value={journalText}
              onChange={setJournalText}
              placeholder="L'encre sèche sur la page..."
              minRows={8}
            />

            <div className="flex justify-end">
              <button
                onClick={handleClose}
                disabled={!journalText.trim() || isSubmitting}
                className="btn-primary px-10 py-4 font-headline text-lg tracking-wide flex items-center gap-3"
              >
                {isSubmitting ? "En cours…" : "Refermer le journal"}
                <span>📖</span>
              </button>
            </div>
          </div>
        )}

        {isClosed && (
          <div className="flex flex-col items-center gap-6">
            <p className="font-headline text-xl text-on-surface-variant italic">
              Le journal est refermé.
            </p>
            <div className="flex gap-8">
              <Link
                href={`/game/${id}/journal`}
                className="font-label text-[0.6875rem] uppercase tracking-[0.05rem] text-secondary hover:text-on-surface transition-colors pb-1 border-b border-outline-variant/30"
              >
                Relire le journal
              </Link>
              <Link
                href="/"
                className="font-label text-[0.6875rem] uppercase tracking-[0.05rem] text-secondary hover:text-on-surface transition-colors pb-1 border-b border-outline-variant/30"
              >
                Accueil
              </Link>
            </div>
          </div>
        )}
      </article>
    </div>
  );
}
