"use client";

interface DeckStackProps {
  remaining: number;
}

export function DeckStack({ remaining }: DeckStackProps) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="font-label uppercase tracking-[0.05rem] text-[0.6875rem] text-on-surface">
        Le Paquet
      </h2>

      <div className="relative w-24 h-36">
        {/* Cartes empilées en arrière-plan */}
        <div className="absolute top-2 left-2 w-full h-full bg-surface-container-highest ambient-shadow" />
        <div className="absolute top-1 left-1 w-full h-full bg-surface-variant ambient-shadow" />

        {/* Carte du dessus */}
        <div className="absolute top-0 left-0 w-full h-full bg-surface border border-outline-variant/30 ambient-shadow flex flex-col items-center justify-center p-2 group hover:-translate-y-1 hover:translate-x-1 transition-transform duration-300">
          <div className="absolute inset-2 border border-outline-variant/20 pointer-events-none" />
          <span className="font-headline text-2xl font-medium text-on-surface relative z-10">
            {remaining}
          </span>
        </div>
      </div>

      <p className="font-label text-xs text-secondary italic">
        {remaining === 1 ? "Carte restante" : "Cartes restantes"}
      </p>
    </div>
  );
}
