"use client";

import { useEffect, useRef, useState } from "react";
import { Smile } from "lucide-react";

const EMOJIS = [
  "😀", "😊", "😍", "🥰", "😘", "😉", "🙂", "😂", "🤣", "😅",
  "❤️", "💕", "💖", "💗", "👍", "👋", "🙏", "✨", "🎉", "🔥",
  "😢", "😭", "😡", "🤔", "😴", "🥳", "💯", "☀️", "🌹", "💐",
];

interface EmojiPickerProps {
  onPick: (emoji: string) => void;
}

export default function EmojiPicker({ onPick }: EmojiPickerProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-rose/20 text-warm-muted transition-colors hover:bg-cream hover:text-rose"
        aria-label="Insérer un emoji"
      >
        <Smile className="h-5 w-5" />
      </button>
      {open && (
        <div className="absolute bottom-full right-0 z-20 mb-2 grid w-[min(16rem,calc(100vw-2rem))] grid-cols-5 gap-1 rounded-2xl border border-rose/15 bg-white p-2 shadow-lg sm:grid-cols-6">
          {EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => {
                onPick(emoji);
                setOpen(false);
              }}
              className="rounded-lg p-2 text-xl hover:bg-cream"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
