"use client";

import type { PisteWord } from "@/core/types";

interface PisteTagProps {
  word: PisteWord;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

export function PisteTag({ word, selected = false, disabled = false, onClick }: PisteTagProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={[
        "px-6 py-3 font-headline text-base transition-colors duration-300",
        "border-b border-outline-variant/30",
        selected
          ? "bg-primary text-on-primary border-primary"
          : disabled
            ? "bg-surface-container text-secondary/50 cursor-not-allowed"
            : "bg-surface-container-low hover:bg-surface-container-high text-on-surface cursor-pointer",
      ].join(" ")}
    >
      {word}
    </button>
  );
}
