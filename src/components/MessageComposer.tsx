"use client";

import EmojiPicker from "@/components/EmojiPicker";

interface MessageComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  placeholder?: string;
  sending?: boolean;
  submitLabel?: string;
}

export default function MessageComposer({
  value,
  onChange,
  onSubmit,
  placeholder = "Votre message…",
  sending = false,
  submitLabel = "Envoyer",
}: MessageComposerProps) {
  return (
    <form onSubmit={onSubmit} className="flex items-end gap-2 border-t border-rose/10 p-3 md:p-4">
      <EmojiPicker onPick={(emoji) => onChange(value + emoji)} />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="min-w-0 flex-1 rounded-xl border border-rose/20 px-3 py-2.5 text-base focus:border-rose focus:outline-none md:px-4"
      />
      <button
        type="submit"
        disabled={sending || !value.trim()}
        className="shrink-0 rounded-full gradient-pulse px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50 md:px-5"
      >
        {sending ? "Envoi…" : submitLabel}
      </button>
    </form>
  );
}
