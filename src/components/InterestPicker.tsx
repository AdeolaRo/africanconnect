"use client";

import { INTEREST_CATEGORIES, MAX_INTERESTS } from "@/lib/interests";

interface InterestPickerProps {
  selected?: string[];
  onChange: (interests: string[]) => void;
}

export default function InterestPicker({ selected = [], onChange }: InterestPickerProps) {
  const items = selected ?? [];

  function toggle(item: string) {
    if (items.includes(item)) {
      onChange(items.filter((i) => i !== item));
    } else if (items.length < MAX_INTERESTS) {
      onChange([...items, item]);
    }
  }

  return (
    <div className="space-y-5">
      <p className="text-sm text-warm-muted">
        Sélectionnez jusqu&apos;à {MAX_INTERESTS} passions — elles enrichissent votre score de compatibilité.
        <span className="ml-1 font-medium text-rose">{selected.length}/{MAX_INTERESTS}</span>
      </p>

      {INTEREST_CATEGORIES.map((cat) => (
        <div key={cat.id}>
          <h3 className="mb-2 text-sm font-semibold text-warm">
            {cat.emoji} {cat.label}
          </h3>
          <div className="flex flex-wrap gap-2">
            {cat.items.map((item) => {
              const isSelected = items.includes(item);
              const disabled = !isSelected && items.length >= MAX_INTERESTS;
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => toggle(item)}
                  disabled={disabled}
                  className={`rounded-full border px-3.5 py-1.5 text-sm transition-all ${
                    isSelected
                      ? "gradient-pulse border-transparent text-white shadow-sm"
                      : disabled
                        ? "cursor-not-allowed border-rose/10 text-warm-muted/40"
                        : "border-rose/20 text-warm-muted hover:border-rose hover:text-warm"
                  }`}
                >
                  {item}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
