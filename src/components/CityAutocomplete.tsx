"use client";

import { useState, useRef, useEffect } from "react";
import { MapPin } from "lucide-react";
import { searchCities } from "@/lib/cities";

interface CityAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}

export default function CityAutocomplete({
  value,
  onChange,
  placeholder = "Tapez votre ville...",
  required,
}: CityAutocompleteProps) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleInput(val: string) {
    setQuery(val);
    onChange(val);
    const results = searchCities(val);
    setSuggestions(results);
    setOpen(results.length > 0);
  }

  function selectCity(city: string) {
    setQuery(city);
    onChange(city);
    setOpen(false);
    setSuggestions([]);
  }

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-rose/50" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleInput(e.target.value)}
          onFocus={() => {
            const results = searchCities(query);
            setSuggestions(results);
            setOpen(results.length > 0);
          }}
          placeholder={placeholder}
          required={required}
          autoComplete="off"
          className="w-full rounded-xl border border-rose/20 bg-white pl-10 pr-4 py-3 focus:border-rose focus:outline-none focus:ring-2 focus:ring-rose/20"
        />
      </div>
      {open && suggestions.length > 0 && (
        <ul className="absolute z-50 mt-1 max-h-48 w-full overflow-auto rounded-xl border border-rose/20 bg-white py-1 shadow-xl">
          {suggestions.map((city) => (
            <li key={city}>
              <button
                type="button"
                onClick={() => selectCity(city)}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-warm hover:bg-rose/10 transition-colors"
              >
                <MapPin className="h-3.5 w-3.5 text-rose/60" />
                {city}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
