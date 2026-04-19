"use client";

import type { PisteWord } from "@/core/types";
import { PisteTag } from "./PisteTag";

interface PromptDisplayProps {
  promptText: string;
  pistes?: readonly [PisteWord, PisteWord, PisteWord] | null;
  selectedPiste?: PisteWord | null;
  followedPistes?: Set<PisteWord>;
  excludedPistes?: Set<PisteWord>;
  onSelectPiste?: (word: PisteWord | null) => void;
}

export function PromptDisplay({
  promptText,
  pistes,
  selectedPiste,
  followedPistes = new Set(),
  excludedPistes = new Set(),
  onSelectPiste,
}: PromptDisplayProps) {
  const availablePistes = pistes?.filter((p) => !excludedPistes.has(p)) ?? [];

  return (
    <div className="w-full max-w-2xl">
      {/* Texte du prompt */}
      <div className="mb-10 border-l border-outline-variant/30 pl-8 py-2">
        <p className="font-journal text-3xl md:text-4xl text-on-surface leading-relaxed">
          {promptText}
        </p>
      </div>

      {/* Sélection de piste */}
      {availablePistes.length > 0 && onSelectPiste && (
        <div className="flex flex-col gap-5 pl-8">
          <p className="font-label uppercase tracking-[0.05rem] text-[0.6875rem] text-secondary">
            Sélecteur de piste
          </p>

          <div className="flex flex-wrap gap-4">
            {availablePistes.map((word) => (
              <PisteTag
                key={word}
                word={word}
                selected={selectedPiste === word}
                disabled={followedPistes.has(word)}
                onClick={() => onSelectPiste(selectedPiste === word ? null : word)}
              />
            ))}
          </div>

          <button
            className="group flex items-center gap-2 text-secondary hover:text-on-surface transition-colors duration-300 w-fit"
            onClick={() => onSelectPiste(null)}
          >
            <span className="font-headline text-sm border-b border-outline-variant/30 pb-1 group-hover:border-on-surface/50 transition-colors">
              Je ne suis pas de piste cette fois
            </span>
            <span className="text-sm opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
              →
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
