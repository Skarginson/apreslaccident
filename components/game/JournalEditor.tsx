"use client";

import { useEffect, useRef, useState } from "react";

interface JournalEditorProps {
  value: string;
  onChange: (text: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  minRows?: number;
}

export function JournalEditor({
  value,
  onChange,
  placeholder = "Commencez à écrire...",
  autoFocus = true,
  minRows = 8,
}: JournalEditorProps) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [wordCount, setWordCount] = useState(0);

  useEffect(() => {
    const words = value.trim() ? value.trim().split(/\s+/).length : 0;
    setWordCount(words);
  }, [value]);

  useEffect(() => {
    if (autoFocus && ref.current) {
      ref.current.focus();
    }
  }, [autoFocus]);

  return (
    <div className="flex flex-col gap-2 w-full">
      <textarea
        ref={ref}
        className="journal-textarea"
        style={{ minHeight: `${minRows * 2.5}rem` }}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={minRows}
      />
      <div className="text-right font-label text-[0.6875rem] uppercase tracking-[0.05rem] text-secondary">
        {wordCount} {wordCount === 1 ? "mot" : "mots"}
      </div>
    </div>
  );
}
