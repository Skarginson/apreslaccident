"use client";

import type { CardId, Rank } from "@/core/types";
import { rankLabel } from "@/lib/content";

interface PlayingCardProps {
  cardId: CardId;
  /** Incliner légèrement la carte (effet "posée sur une table") */
  tilted?: boolean;
  size?: "sm" | "md" | "lg";
}

const SUIT_SYMBOLS: Record<string, { symbol: string; color: string }> = {
  heart: { symbol: "♥", color: "#6c1518" },
  diamond: { symbol: "♦", color: "#6c1518" },
  club: { symbol: "♣", color: "#1d1c16" },
  spade: { symbol: "♠", color: "#1d1c16" },
};

const SIZE_CLASSES = {
  sm: "w-32 h-48",
  md: "w-44 h-64",
  lg: "w-56 h-80",
};

const FONT_SIZES = {
  sm: { rank: "text-lg", center: "text-4xl" },
  md: { rank: "text-xl", center: "text-5xl" },
  lg: { rank: "text-2xl", center: "text-6xl" },
};

export function PlayingCard({ cardId, tilted = false, size = "md" }: PlayingCardProps) {
  const dashIdx = cardId.indexOf("-");
  const suit = cardId.slice(0, dashIdx);
  const rank = cardId.slice(dashIdx + 1) as Rank;

  const suitData = SUIT_SYMBOLS[suit] ?? { symbol: "?", color: "#1d1c16" };
  const label = rankLabel(rank);
  const fonts = FONT_SIZES[size];

  return (
    <div
      className={[
        SIZE_CLASSES[size],
        "relative bg-surface-container-highest flex flex-col items-center justify-center ambient-shadow",
        "border border-outline-variant/30",
        tilted ? "-rotate-2 hover:rotate-0 transition-transform duration-700 ease-out" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* Bordure intérieure */}
      <div className="absolute inset-2 border border-outline-variant/40 pointer-events-none" />

      {/* Coin haut-gauche */}
      <div className="absolute top-3 left-3 flex flex-col items-center leading-none">
        <span className={`font-headline font-medium ${fonts.rank}`} style={{ color: suitData.color }}>
          {label}
        </span>
        <span className={`${fonts.rank} leading-none`} style={{ color: suitData.color }}>
          {suitData.symbol}
        </span>
      </div>

      {/* Centre */}
      <span className={`${fonts.center} select-none`} style={{ color: suitData.color }}>
        {suitData.symbol}
      </span>

      {/* Coin bas-droite (retourné) */}
      <div className="absolute bottom-3 right-3 flex flex-col items-center leading-none rotate-180">
        <span className={`font-headline font-medium ${fonts.rank}`} style={{ color: suitData.color }}>
          {label}
        </span>
        <span className={`${fonts.rank} leading-none`} style={{ color: suitData.color }}>
          {suitData.symbol}
        </span>
      </div>
    </div>
  );
}
