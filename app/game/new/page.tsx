"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { CardId, PisteWord } from "@/core/types";
import { useGameStore } from "@/stores/useGameStore";
import { getAllFrames, getAllPistes, getWoundText, type FrameEntry } from "@/lib/content";
import { FrameSelector } from "@/components/game/FrameSelector";
import { PlayingCard } from "@/components/game/PlayingCard";
import { JournalEditor } from "@/components/game/JournalEditor";
import { seededRng } from "@/core/rng";

type Step =
  | "safety"
  | "frame-choice"
  | "frame-browse"
  | "frame-custom"
  | "frame-random"
  | "wound"
  | "first-entry";

const PISTE_WORDS: PisteWord[] = [
  "Amour", "Animal", "Autel", "Calme", "Cauchemars", "Chaos",
  "Culte", "Jouet", "Effrayant", "Esprit", "Famille", "Impossible",
  "Lueurs", "Mélodie", "Message", "Mourant", "Signal", "Vengeance",
];

const WOUND_CARDS: Array<"spade-king" | "spade-queen" | "spade-jack"> = [
  "spade-king",
  "spade-queen",
  "spade-jack",
];

function pickRandomWound(): "spade-king" | "spade-queen" | "spade-jack" {
  const rng = seededRng(Date.now() & 0xffff);
  const idx = Math.floor(rng() * 3);
  return WOUND_CARDS[idx] ?? "spade-king";
}

export default function NewGamePage() {
  const router = useRouter();
  const createGame = useGameStore((s) => s.createGame);
  const playEntry = useGameStore((s) => s.playEntry);

  const frames = getAllFrames();
  const allPistes = getAllPistes();

  /* ── État multi-étapes ── */
  const [step, setStep] = useState<Step>("safety");
  const [excludedPistes, setExcludedPistes] = useState<Set<PisteWord>>(new Set());
  const [frameType, setFrameType] = useState<"preset" | "random" | "custom" | null>(null);
  const [selectedFrame, setSelectedFrame] = useState<FrameEntry | null>(null);
  const [customTitle, setCustomTitle] = useState("");
  const [customDesc, setCustomDesc] = useState("");
  const [questionAnswers, setQuestionAnswers] = useState<Record<string, string>>({});
  const [woundCard, setWoundCard] = useState<"spade-king" | "spade-queen" | "spade-jack" | null>(null);
  const [journalText, setJournalText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  /* ── Sécurité émotionnelle ── */
  const togglePiste = useCallback((word: PisteWord) => {
    setExcludedPistes((prev) => {
      const next = new Set(prev);
      next.has(word) ? next.delete(word) : next.add(word);
      return next;
    });
  }, []);

  /* ── Choix du cadre ── */
  const handleFrameChoice = useCallback(
    (type: "preset" | "random" | "custom") => {
      setFrameType(type);
      if (type === "random") {
        const rng = seededRng(Date.now() & 0xffff);
        const idx = Math.floor(rng() * frames.length);
        const frame = frames[idx] ?? frames[0];
        if (frame) setSelectedFrame(frame);
        setQuestionAnswers({});
        setStep("frame-random");
      } else if (type === "preset") {
        setStep("frame-browse");
      } else {
        setStep("frame-custom");
      }
    },
    [frames],
  );

  /* ── Tirage blessure ── */
  const drawWound = useCallback(() => {
    setWoundCard(pickRandomWound());
    setStep("first-entry");
  }, []);

  /* ── Soumission finale ── */
  const handleSubmit = useCallback(async () => {
    if (!woundCard || !journalText.trim() || isSubmitting) return;

    const frame = (() => {
      if (frameType === "custom") {
        return {
          type: "custom" as const,
          title: customTitle || "Cadre personnel",
          description: customDesc || "",
        };
      }
      if (selectedFrame) {
        const desc = selectedFrame.sections.map((s) => s.text).join(" ");
        const answers: Record<string, string> = {};
        selectedFrame.sections.forEach((section, si) => {
          section.questions.forEach((q, qi) => {
            const key = `${si}-${qi}`;
            if (questionAnswers[key]) answers[q] = questionAnswers[key] ?? "";
          });
        });
        return {
          type: "preset" as const,
          title: selectedFrame.title,
          description: desc,
          ...(Object.keys(answers).length > 0 ? { customAnswers: answers } : {}),
        };
      }
      return { type: "preset" as const, title: "Inconnu", description: "" };
    })();

    setIsSubmitting(true);
    try {
      const game = await createGame({
        frame,
        woundCard,
        excludedPisteWords: [...excludedPistes],
      });

      const woundText = getWoundText(woundCard);
      await playEntry({
        journalText,
        promptSnapshot: woundText,
        pistesOffered: null,
      });

      router.push(`/game/${game.id}`);
    } catch (e) {
      console.error(e);
      setIsSubmitting(false);
    }
  }, [
    woundCard, journalText, isSubmitting, frameType, customTitle, customDesc,
    selectedFrame, questionAnswers, excludedPistes, createGame, playEntry, router,
  ]);

  /* ── Rendu par étape ── */
  return (
    <div className="min-h-screen flex flex-col">
      {step === "safety" && (
        <SafetyStep
          allPistesWords={PISTE_WORDS}
          excluded={excludedPistes}
          onToggle={togglePiste}
          onNext={() => setStep("frame-choice")}
        />
      )}

      {step === "frame-choice" && (
        <FrameChoiceStep onChoice={handleFrameChoice} onBack={() => setStep("safety")} />
      )}

      {step === "frame-browse" && (
        <FrameBrowseStep
          frames={frames}
          selectedId={selectedFrame?.id ?? null}
          onSelect={(id) => {
            const f = frames.find((fr) => fr.id === id);
            if (f) setSelectedFrame(f);
          }}
          onNext={() => setStep("wound")}
          onBack={() => setStep("frame-choice")}
          questionAnswers={questionAnswers}
          onAnswerChange={(key, val) => setQuestionAnswers((prev) => ({ ...prev, [key]: val }))}
        />
      )}

      {step === "frame-custom" && (
        <FrameCustomStep
          title={customTitle}
          description={customDesc}
          onTitleChange={setCustomTitle}
          onDescChange={setCustomDesc}
          onNext={() => setStep("wound")}
          onBack={() => setStep("frame-choice")}
        />
      )}

      {step === "frame-random" && selectedFrame && (
        <FrameRandomStep
          frame={selectedFrame}
          questionAnswers={questionAnswers}
          onAnswerChange={(key, val) => setQuestionAnswers((prev) => ({ ...prev, [key]: val }))}
          onNext={() => setStep("wound")}
          onBack={() => setStep("frame-choice")}
        />
      )}

      {step === "wound" && (
        <WoundStep onDraw={drawWound} onBack={() => setStep(frameType === "random" ? "frame-random" : frameType === "preset" ? "frame-browse" : "frame-custom")} />
      )}

      {step === "first-entry" && woundCard && (
        <FirstEntryStep
          woundCard={woundCard}
          woundText={getWoundText(woundCard)}
          journalText={journalText}
          onChange={setJournalText}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
}

/* ─────────────────────────────────────────
   Sous-composants des étapes
──────────────────────────────────────────── */

function StepHeader({
  step,
  title,
  onBack,
}: {
  step: string;
  title: string;
  onBack: () => void;
}) {
  return (
    <header className="w-full max-w-5xl flex justify-between items-start mb-16 md:mb-24">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-secondary hover:text-on-surface transition-colors duration-300 font-label text-[0.6875rem] uppercase tracking-[0.05rem]"
      >
        ← Retour
      </button>
      <div className="text-right">
        <p className="font-label tracking-[0.05rem] text-[0.6875rem] uppercase text-secondary mb-2">
          {step}
        </p>
        <h1 className="font-headline text-3xl md:text-5xl text-on-surface tracking-tight leading-none">
          {title}
        </h1>
      </div>
    </header>
  );
}

function SafetyStep({
  allPistesWords,
  excluded,
  onToggle,
  onNext,
}: {
  allPistesWords: PisteWord[];
  excluded: Set<PisteWord>;
  onToggle: (w: PisteWord) => void;
  onNext: () => void;
}) {
  return (
    <main className="flex-1 flex flex-col items-center p-8 md:p-16">
      <div className="w-full max-w-3xl">
        <div className="mb-16">
          <p className="font-label text-[0.6875rem] uppercase tracking-[0.05rem] text-secondary mb-4">
            Étape 1
          </p>
          <h1 className="font-headline text-4xl md:text-5xl text-on-surface tracking-tight leading-none mb-6">
            Sécurité émotionnelle
          </h1>
          <p className="font-body text-lg text-secondary leading-relaxed max-w-xl">
            Certains thèmes peuvent être difficiles à explorer. Vous pouvez exclure des
            pistes — elles n&apos;apparaîtront jamais dans votre partie.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 mb-12">
          {allPistesWords.map((word) => (
            <button
              key={word}
              onClick={() => onToggle(word)}
              className={[
                "px-5 py-2.5 font-label text-[0.6875rem] uppercase tracking-[0.05rem] transition-colors duration-200",
                excluded.has(word)
                  ? "bg-primary text-on-primary"
                  : "bg-surface-container-low text-secondary hover:bg-surface-container-high hover:text-on-surface border-b border-outline-variant/30",
              ].join(" ")}
            >
              {excluded.has(word) ? "✕ " : ""}{word}
            </button>
          ))}
        </div>

        {excluded.size > 0 && (
          <p className="font-label text-[0.6875rem] uppercase tracking-[0.05rem] text-secondary mb-8">
            {excluded.size} piste{excluded.size > 1 ? "s" : ""} exclue{excluded.size > 1 ? "s" : ""}
          </p>
        )}

        <button onClick={onNext} className="btn-primary px-10 py-4 font-label text-[0.6875rem] uppercase tracking-[0.05rem]">
          Continuer
        </button>
      </div>
    </main>
  );
}

function FrameChoiceStep({
  onChoice,
  onBack,
}: {
  onChoice: (t: "preset" | "random" | "custom") => void;
  onBack: () => void;
}) {
  return (
    <main className="flex-1 flex flex-col items-center justify-center p-6 md:p-16 lg:p-24">
      <div className="w-full max-w-5xl">
        <StepHeader step="Étape 2" title="Sélectionner un Cadre" onBack={onBack} />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 lg:gap-16 items-center">
          {/* Hasard */}
          <button
            type="button"
            onClick={() => onChoice("random")}
            className="group flex flex-col items-center text-left md:mt-16 w-full max-w-sm mx-auto"
          >
            <div className="w-full aspect-[2/3] bg-surface-container-high ambient-shadow mb-8 relative border border-outline-variant/15 flex items-center justify-center p-8 transition-shadow duration-300 group-hover:shadow-[0_30px_60px_rgba(29,28,22,0.12)]">
              <div className="absolute inset-4 border border-outline-variant/30 opacity-50" />
              <div className="absolute inset-6 border border-outline-variant/20 opacity-30" />
              <span className="text-4xl text-secondary group-hover:text-primary transition-colors duration-500">⚄</span>
            </div>
            <div className="w-full pl-4 border-l border-outline-variant/30 group-hover:border-primary/50 transition-colors duration-300">
              <h2 className="font-headline text-2xl mb-2 text-on-surface">Cadre au hasard</h2>
              <p className="font-body text-secondary text-sm leading-relaxed">
                Laissez le destin choisir le théâtre de votre prochain récit.
              </p>
            </div>
          </button>

          {/* Parcourir */}
          <button
            type="button"
            onClick={() => onChoice("preset")}
            className="group flex flex-col items-center text-left md:-mt-8 w-full max-w-sm mx-auto"
          >
            <div className="w-full aspect-[2/3] bg-surface-container-lowest ambient-shadow mb-8 relative border border-outline-variant/15 flex items-center justify-center p-8 group-hover:bg-surface-container transition-colors duration-300 group-hover:shadow-[0_30px_60px_rgba(29,28,22,0.12)]">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-surface-container-low/50" />
              <span className="text-4xl text-secondary group-hover:text-primary transition-colors duration-500 relative z-10">📖</span>
            </div>
            <div className="w-full pl-4 border-l border-outline-variant/30 group-hover:border-primary/50 transition-colors duration-300">
              <h2 className="font-headline text-2xl mb-2 text-on-surface">Parcourir les cadres</h2>
              <p className="font-body text-secondary text-sm leading-relaxed">
                Consultez les archives pour sélectionner un lieu spécifique.
              </p>
            </div>
          </button>

          {/* Personnel */}
          <button
            type="button"
            onClick={() => onChoice("custom")}
            className="group flex flex-col items-center text-left md:mt-24 w-full max-w-sm mx-auto"
          >
            <div className="w-full aspect-[2/3] bg-surface-container-low ambient-shadow mb-8 relative border border-outline-variant/15 flex items-center justify-center p-8 transition-shadow duration-300 group-hover:shadow-[0_30px_60px_rgba(29,28,22,0.12)]">
              <div className="w-3/4 h-px bg-outline-variant/30 absolute" style={{ top: "33%" }} />
              <div className="w-3/4 h-px bg-outline-variant/30 absolute" style={{ top: "50%" }} />
              <div className="w-1/2 h-px bg-outline-variant/30 absolute" style={{ top: "66%" }} />
              <span className="text-4xl text-secondary group-hover:text-primary transition-colors duration-500 relative z-10">✏️</span>
            </div>
            <div className="w-full pl-4 border-l border-outline-variant/30 group-hover:border-primary/50 transition-colors duration-300">
              <h2 className="font-headline text-2xl mb-2 text-on-surface">Cadre personnel</h2>
              <p className="font-body text-secondary text-sm leading-relaxed">
                Décrivez un lieu inédit, forgé par votre propre mémoire.
              </p>
            </div>
          </button>
        </div>
      </div>
    </main>
  );
}

function FrameBrowseStep({
  frames,
  selectedId,
  onSelect,
  onNext,
  onBack,
  questionAnswers,
  onAnswerChange,
}: {
  frames: FrameEntry[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onNext: () => void;
  onBack: () => void;
  questionAnswers: Record<string, string>;
  onAnswerChange: (key: string, val: string) => void;
}) {
  const selected = frames.find((f) => f.id === selectedId) ?? null;

  return (
    <main className="flex-1 flex flex-col items-center p-6 md:p-16">
      <div className="w-full max-w-5xl">
        <StepHeader step="Étape 2" title="Choisir un cadre" onBack={onBack} />

        <FrameSelector frames={frames} selectedId={selectedId} onSelect={onSelect} />

        {selected && (
          <div className="mt-12 border-l-2 border-primary/30 pl-8 flex flex-col gap-6">
            <h3 className="font-headline text-2xl text-primary">{selected.title}</h3>
            {selected.sections.map((section, si) => (
              <div key={si} className="flex flex-col gap-4">
                <p className="font-body text-base text-on-surface leading-relaxed italic">
                  {section.text}
                </p>
                {section.questions.map((q, qi) => (
                  <div key={qi} className="flex flex-col gap-2">
                    <label className="font-label text-[0.6875rem] uppercase tracking-[0.05rem] text-secondary">
                      {q}
                    </label>
                    <input
                      type="text"
                      value={questionAnswers[`${si}-${qi}`] ?? ""}
                      onChange={(e) => onAnswerChange(`${si}-${qi}`, e.target.value)}
                      className="bg-transparent border-b border-outline-variant focus:border-primary outline-none font-body text-base text-on-surface py-1 transition-colors duration-200"
                      placeholder="Votre réponse..."
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {selectedId && (
          <div className="mt-10">
            <button onClick={onNext} className="btn-primary px-10 py-4 font-label text-[0.6875rem] uppercase tracking-[0.05rem]">
              Continuer
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

function FrameCustomStep({
  title,
  description,
  onTitleChange,
  onDescChange,
  onNext,
  onBack,
}: {
  title: string;
  description: string;
  onTitleChange: (v: string) => void;
  onDescChange: (v: string) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <main className="flex-1 flex flex-col items-center p-6 md:p-16">
      <div className="w-full max-w-3xl">
        <StepHeader step="Étape 2" title="Cadre personnel" onBack={onBack} />

        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <label className="font-label text-[0.6875rem] uppercase tracking-[0.05rem] text-secondary">
              Titre du cadre
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder="L'endroit mystérieux..."
              className="bg-transparent border-b border-outline-variant focus:border-primary outline-none font-headline text-2xl text-on-surface py-2 transition-colors duration-200 w-full"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-label text-[0.6875rem] uppercase tracking-[0.05rem] text-secondary">
              Description — comment êtes-vous arrivée ici ?
            </label>
            <textarea
              value={description}
              onChange={(e) => onDescChange(e.target.value)}
              rows={5}
              placeholder="Décrivez votre situation de départ..."
              className="bg-transparent border-b border-outline-variant focus:border-primary outline-none font-body text-base text-on-surface py-2 transition-colors duration-200 resize-none w-full"
            />
          </div>

          <button
            onClick={onNext}
            disabled={!title.trim()}
            className="btn-primary px-10 py-4 font-label text-[0.6875rem] uppercase tracking-[0.05rem] w-fit"
          >
            Continuer
          </button>
        </div>
      </div>
    </main>
  );
}

function FrameRandomStep({
  frame,
  questionAnswers,
  onAnswerChange,
  onNext,
  onBack,
}: {
  frame: FrameEntry;
  questionAnswers: Record<string, string>;
  onAnswerChange: (key: string, val: string) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <main className="flex-1 flex flex-col items-center p-6 md:p-16">
      <div className="w-full max-w-3xl">
        <StepHeader step="Étape 2 — Cadre tiré au sort" title={frame.title} onBack={onBack} />

        <div className="border-l-2 border-primary/30 pl-8 flex flex-col gap-8">
          {frame.sections.map((section, si) => (
            <div key={si} className="flex flex-col gap-4">
              <p className="font-body text-base text-on-surface leading-relaxed italic">
                {section.text}
              </p>
              {section.questions.map((q, qi) => (
                <div key={qi} className="flex flex-col gap-2">
                  <label className="font-label text-[0.6875rem] uppercase tracking-[0.05rem] text-secondary">
                    {q}
                  </label>
                  <input
                    type="text"
                    value={questionAnswers[`${si}-${qi}`] ?? ""}
                    onChange={(e) => onAnswerChange(`${si}-${qi}`, e.target.value)}
                    className="bg-transparent border-b border-outline-variant focus:border-primary outline-none font-body text-base text-on-surface py-1 transition-colors duration-200"
                    placeholder="Votre réponse..."
                  />
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="mt-10">
          <button onClick={onNext} className="btn-primary px-10 py-4 font-label text-[0.6875rem] uppercase tracking-[0.05rem]">
            Continuer
          </button>
        </div>
      </div>
    </main>
  );
}

function WoundStep({ onDraw, onBack }: { onDraw: () => void; onBack: () => void }) {
  return (
    <main className="flex-1 flex flex-col items-center justify-center p-8 md:p-16">
      <div className="w-full max-w-2xl flex flex-col items-center gap-12">
        <div className="text-right w-full">
          <button
            onClick={onBack}
            className="text-secondary hover:text-on-surface transition-colors duration-200 font-label text-[0.6875rem] uppercase tracking-[0.05rem]"
          >
            ← Retour
          </button>
        </div>

        <div className="flex flex-col items-center gap-6">
          <p className="font-label text-[0.6875rem] uppercase tracking-[0.05rem] text-secondary">
            Étape 3
          </p>
          <h1 className="font-headline text-4xl md:text-5xl text-on-surface tracking-tight text-center leading-tight">
            Tirage de la blessure
          </h1>
          <p className="font-body text-lg text-secondary text-center max-w-md leading-relaxed">
            Tirez une figure de pique pour déterminer la nature de votre blessure initiale.
          </p>
        </div>

        {/* Deck face cachée */}
        <div className="relative w-44 h-64">
          <div className="absolute top-2 left-2 w-full h-full bg-surface-container-highest" />
          <div className="absolute top-1 left-1 w-full h-full bg-surface-variant" />
          <div className="absolute top-0 left-0 w-full h-full bg-surface-container-low border border-outline-variant/30 flex items-center justify-center">
            <div className="absolute inset-3 border border-outline-variant/20" />
            <span className="text-4xl opacity-40">♠</span>
          </div>
        </div>

        <button onClick={onDraw} className="btn-primary px-12 py-5 text-xl font-body tracking-wide">
          Tirer la blessure
        </button>
      </div>
    </main>
  );
}

function FirstEntryStep({
  woundCard,
  woundText,
  journalText,
  onChange,
  onSubmit,
  isSubmitting,
}: {
  woundCard: "spade-king" | "spade-queen" | "spade-jack";
  woundText: string;
  journalText: string;
  onChange: (t: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}) {
  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="bg-surface-container-low shrink-0 pt-10 pb-6 px-6 md:px-12 flex flex-col items-center justify-center relative">
        <div className="flex items-center gap-4 max-w-2xl mx-auto text-center">
          <PlayingCard cardId={woundCard as CardId} size="sm" />
          <div className="text-left">
            <p className="font-label text-[0.6875rem] uppercase tracking-[0.05rem] text-secondary mb-1">
              Première entrée — Blessure initiale
            </p>
            <h1 className="font-headline text-lg md:text-xl italic font-light text-on-surface">
              {woundText}
            </h1>
          </div>
        </div>
      </header>

      {/* Zone d'écriture */}
      <main className="flex-grow flex flex-col items-center w-full max-w-4xl mx-auto px-6 md:px-12 pt-10 pb-4 overflow-y-auto">
        <JournalEditor
          value={journalText}
          onChange={onChange}
          placeholder="La douleur s'est installée..."
          minRows={12}
        />
      </main>

      {/* Footer */}
      <footer className="shrink-0 pt-4 pb-10 px-6 md:px-12 flex justify-end max-w-4xl mx-auto w-full">
        <button
          onClick={onSubmit}
          disabled={!journalText.trim() || isSubmitting}
          className="btn-primary px-10 py-4 font-label text-[0.6875rem] uppercase tracking-[0.05rem] flex items-center gap-3"
        >
          {isSubmitting ? "En cours…" : "Commencer la partie"}
        </button>
      </footer>
    </div>
  );
}
