"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import type { CardId, PisteWord } from "@/core/types";
import { useGameStore } from "@/stores/useGameStore";
import { drawTopCard } from "@/core/deck";
import {
  getStoryCardPrompt,
  getWoundText,
  getPisteEntryText,
  cardLabel,
  type CardPrompt,
} from "@/lib/content";
import { PlayingCard } from "@/components/game/PlayingCard";
import { PromptDisplay } from "@/components/game/PromptDisplay";
import { JournalEditor } from "@/components/game/JournalEditor";
import { GameSideNav } from "@/components/game/GameSideNav";

type DrawStep = "draw" | "piste-choice" | "slot-assignment" | "write";

export default function DrawPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { game, isLoading, loadGame, playEntry, availableSlots } = useGameStore();

  const [step, setStep] = useState<DrawStep>("draw");
  const [drawnCard, setDrawnCard] = useState<CardId | null>(null);
  const [prompt, setPrompt] = useState<CardPrompt | null>(null);
  const [selectedPiste, setSelectedPiste] = useState<PisteWord | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<CardId | null>(null);
  const [journalText, setJournalText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!game || game.id !== id) {
      loadGame(id);
    }
  }, [id, game, loadGame]);

  /* ─── Tirage de la carte ─── */
  const handleDraw = useCallback(() => {
    if (!game) return;
    const [card] = drawTopCard(game.storyDeck);

    const suit = card.split("-")[0] ?? "";
    const rank = card.split("-").slice(1).join("-");

    let resolvedPrompt: CardPrompt | null = null;

    if (card === "spade-ace") {
      resolvedPrompt = { text: "L'histoire touche à sa fin." };
    } else if (suit === "spade" && (rank === "2" || rank === "3" || rank === "4" || rank === "5" || rank === "6" || rank === "7" || rank === "8" || rank === "9" || rank === "10")) {
      const piste = game.pistes.find((p) => p.assignedCardId === card);
      const pisteText = piste ? getPisteEntryText(piste.word) : "Une piste inconnue…";
      resolvedPrompt = { text: pisteText };
    } else if (suit === "spade" && (rank === "king" || rank === "queen" || rank === "jack")) {
      resolvedPrompt = { text: getWoundText(card as "spade-king" | "spade-queen" | "spade-jack") };
    } else {
      resolvedPrompt = getStoryCardPrompt(card);
    }

    setDrawnCard(card);
    setPrompt(resolvedPrompt);

    /* Si des pistes sont proposées et que certaines ne sont pas encore suivies → choix de piste */
    const hasPistes = resolvedPrompt?.pistes && resolvedPrompt.pistes.length > 0;
    const followedSet = new Set(game.pistes.filter((p) => p.followed).map((p) => p.word));
    const excludedSet = new Set(game.pistes.filter((p) => p.excluded).map((p) => p.word));
    const hasNewPiste = hasPistes && resolvedPrompt!.pistes!.some(
      (p) => !followedSet.has(p as PisteWord) && !excludedSet.has(p as PisteWord),
    );

    setStep(hasNewPiste ? "piste-choice" : "write");
  }, [game]);

  /* ─── Sélection de piste ─── */
  const handlePisteSelect = useCallback(
    (word: PisteWord | null) => {
      setSelectedPiste(word);
      if (!word) {
        setStep("write");
        return;
      }
      const piste = game?.pistes.find((p) => p.word === word);
      if (piste?.followed) {
        setStep("write");
        return;
      }
      /* Piste nouvelle → assignation d'un emplacement de pique */
      setStep("slot-assignment");
    },
    [game],
  );

  /* ─── Soumission de l'entrée ─── */
  const handleSubmit = useCallback(async () => {
    if (!drawnCard || !journalText.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const { gameEnded } = await playEntry({
        journalText,
        promptSnapshot: prompt?.text ?? "",
        pistesOffered: prompt?.pistes ?? null,
        ...(selectedPiste ? { pisteFollowed: selectedPiste } : {}),
        ...(selectedSlot ? { pisteAssignedSlot: selectedSlot } : {}),
      });

      if (gameEnded) {
        router.push(`/game/${id}/end`);
      } else {
        router.push(`/game/${id}`);
      }
    } catch (e) {
      console.error(e);
      setIsSubmitting(false);
    }
  }, [drawnCard, journalText, isSubmitting, playEntry, prompt, selectedPiste, selectedSlot, id, router]);

  if (isLoading || !game) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="font-label text-[0.6875rem] uppercase tracking-[0.05rem] text-secondary">
          Chargement…
        </p>
      </div>
    );
  }

  const followedSet = new Set(game.pistes.filter((p) => p.followed).map((p) => p.word));
  const excludedSet = new Set(game.pistes.filter((p) => p.excluded).map((p) => p.word));
  const slots = availableSlots();

  /* ─── Étape : Tirer la carte ─── */
  if (step === "draw") {
    return (
      <div className="min-h-screen flex flex-col md:flex-row">
        <GameSideNav game={game} />
        <main className="flex-1 flex flex-col items-center justify-center p-8 md:p-16 min-h-screen">
          <div className="w-full max-w-2xl flex flex-col items-center gap-14">
            <div className="text-center max-w-md">
              <p className="font-journal text-2xl text-on-surface-variant leading-relaxed opacity-75 mb-3">
                Le silence pèse sur cette journée.
              </p>
              <p className="font-headline text-lg text-on-surface opacity-55 italic">
                Que dévoile ce nouveau jour ?
              </p>
            </div>

            {/* Bouton carte */}
            <button
              onClick={handleDraw}
              className="group relative flex flex-col items-center justify-center w-64 h-80 bg-surface-container-lowest border border-outline-variant/20 ambient-shadow hover:shadow-[0_30px_60px_rgba(29,28,22,0.10)] transition-all duration-700 ease-out"
            >
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
          </div>
        </main>
      </div>
    );
  }

  /* ─── Étape : Choix de piste ─── */
  if (step === "piste-choice" && drawnCard && prompt) {
    return (
      <div className="min-h-screen flex flex-col md:flex-row">
        <GameSideNav game={game} />
        <main className="flex-1 flex flex-col items-center justify-center p-8 md:p-16 relative">
          {/* Carte tirée en décor */}
          <div className="absolute top-8 right-8 opacity-20 pointer-events-none select-none hidden md:block">
            <span className="font-headline text-7xl text-surface-container-high rotate-90 origin-top-right whitespace-nowrap">
              {cardLabel(drawnCard).toUpperCase()}
            </span>
          </div>

          <div className="w-full max-w-4xl flex flex-col items-center gap-12 relative z-10">
            <PlayingCard cardId={drawnCard} tilted size="md" />

            <PromptDisplay
              promptText={prompt.text}
              pistes={prompt.pistes ?? null}
              selectedPiste={selectedPiste}
              followedPistes={followedSet}
              excludedPistes={excludedSet}
              onSelectPiste={handlePisteSelect}
            />
          </div>
        </main>
      </div>
    );
  }

  /* ─── Étape : Assignation d'emplacement de pique ─── */
  if (step === "slot-assignment" && selectedPiste) {
    return (
      <div className="min-h-screen flex flex-col md:flex-row">
        <GameSideNav game={game} />
        <main className="flex-1 flex flex-col items-center justify-center p-8 md:p-16">
          <div className="w-full max-w-2xl flex flex-col gap-10">
            <div>
              <p className="font-label text-[0.6875rem] uppercase tracking-[0.05rem] text-secondary mb-3">
                Piste — {selectedPiste}
              </p>
              <h2 className="font-headline text-3xl text-on-surface">
                Choisir une carte de pique
              </h2>
              <p className="font-body text-secondary text-base mt-2 leading-relaxed">
                Associez la piste <strong>{selectedPiste}</strong> à l&apos;une des cartes
                disponibles. Cette carte sera insérée dans le Paquet Histoire.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              {slots.map((slot) => (
                <button
                  key={slot}
                  onClick={() => {
                    setSelectedSlot(slot);
                    setStep("write");
                  }}
                  className={[
                    "px-6 py-3 font-headline text-base transition-colors duration-200 border-b-2",
                    selectedSlot === slot
                      ? "bg-primary text-on-primary border-primary"
                      : "bg-surface-container-low text-on-surface border-outline-variant/30 hover:bg-surface-container-high hover:border-primary/50",
                  ].join(" ")}
                >
                  ♠ {slot.split("-")[1]}
                </button>
              ))}
            </div>

            <button
              onClick={() => setStep("piste-choice")}
              className="btn-secondary w-fit font-label text-[0.6875rem] uppercase tracking-[0.05rem]"
            >
              ← Changer de piste
            </button>
          </div>
        </main>
      </div>
    );
  }

  /* ─── Étape : Écriture ─── */
  if (step === "write" && drawnCard && prompt) {
    return (
      <div className="h-screen flex flex-col">
        {/* Header */}
        <header className="bg-surface-container-low shrink-0 pt-10 pb-6 px-6 md:px-12 flex flex-col items-center justify-center relative">
          <button
            onClick={() => setStep(prompt.pistes ? "piste-choice" : "draw")}
            className="absolute top-6 left-6 md:left-12 text-secondary hover:text-on-surface transition-colors duration-200 font-label text-[0.6875rem] uppercase tracking-[0.05rem] flex items-center gap-1"
          >
            ← Retour
          </button>

          <div className="flex items-center gap-4 max-w-2xl mx-auto text-center mt-4">
            <PlayingCard cardId={drawnCard} size="sm" />
            <div className="text-left">
              <p className="font-label text-[0.6875rem] uppercase tracking-[0.05rem] text-secondary mb-1">
                {cardLabel(drawnCard)}
                {selectedPiste && (
                  <span className="ml-3 text-primary">— Piste : {selectedPiste}</span>
                )}
              </p>
              <h1 className="font-headline text-base md:text-lg italic font-light text-on-surface">
                {prompt.text}
              </h1>
            </div>
          </div>
        </header>

        {/* Zone d'écriture */}
        <main className="flex-grow flex flex-col items-center w-full max-w-4xl mx-auto px-6 md:px-12 pt-10 pb-4 overflow-y-auto">
          <JournalEditor
            value={journalText}
            onChange={setJournalText}
            placeholder="Aujourd'hui..."
            minRows={12}
          />
        </main>

        {/* Footer */}
        <footer className="shrink-0 pt-4 pb-10 px-6 md:px-12 flex justify-between items-end max-w-4xl mx-auto w-full">
          <div />
          <button
            onClick={handleSubmit}
            disabled={!journalText.trim() || isSubmitting}
            className="btn-primary px-10 py-4 font-label text-[0.6875rem] uppercase tracking-[0.05rem] flex items-center gap-3"
          >
            {isSubmitting ? "Enregistrement…" : "Terminer l'entrée"}
          </button>
        </footer>
      </div>
    );
  }

  return null;
}
