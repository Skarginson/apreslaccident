"use client";

import type { FrameEntry } from "@/lib/content";

interface FrameSelectorProps {
  frames: FrameEntry[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function FrameSelector({ frames, selectedId, onSelect }: FrameSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {frames.map((frame) => (
        <button
          key={frame.id}
          onClick={() => onSelect(frame.id)}
          className={[
            "text-left p-6 transition-all duration-300 border-b-2",
            selectedId === frame.id
              ? "bg-surface-container-high border-primary"
              : "bg-surface-container-low border-outline-variant/30 hover:bg-surface-container-high hover:border-primary/50",
          ].join(" ")}
        >
          <p className="font-label text-[0.6875rem] uppercase tracking-[0.05rem] text-secondary mb-1">
            Cadre {frame.rank}
          </p>
          <h3 className="font-headline text-xl text-on-surface">{frame.title}</h3>
          {frame.sections[0] && (
            <p className="font-body text-sm text-secondary mt-2 leading-relaxed line-clamp-3">
              {frame.sections[0].text}
            </p>
          )}
        </button>
      ))}
    </div>
  );
}
