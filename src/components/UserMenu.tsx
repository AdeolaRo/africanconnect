"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { ChevronDown, LogOut, Settings, Eye, EyeOff } from "lucide-react";
import { fetchJson } from "@/lib/fetch-json";

interface UserMenuProps {
  name: string;
  role?: string | null;
}

export default function UserMenu({ name, role }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(true);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchJson<{ discoverVisible?: boolean }>("/api/settings").then(({ data }) => {
      if (data && typeof data.discoverVisible === "boolean") {
        setVisible(data.discoverVisible);
      }
    });
  }, []);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  async function toggleVisibility() {
    setLoading(true);
    const next = !visible;
    const { data, error } = await fetchJson<{ discoverVisible: boolean }>("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ discoverVisible: next }),
    });
    if (!error && data) setVisible(data.discoverVisible);
    setLoading(false);
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 rounded-full bg-rose/10 px-3 py-1.5 text-warm transition-colors hover:bg-rose/20"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <span className="font-medium text-rose">{name}</span>
        {role && role !== "USER" && (
          <span className="text-xs text-plum">({role})</span>
        )}
        <ChevronDown className={`h-4 w-4 text-rose transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-2xl border border-rose/15 bg-white py-1 shadow-xl shadow-rose/10"
        >
          <button
            role="menuitem"
            onClick={toggleVisibility}
            disabled={loading}
            className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-warm hover:bg-cream/80 disabled:opacity-50"
          >
            {visible ? (
              <Eye className="h-4 w-4 shrink-0 text-plum" />
            ) : (
              <EyeOff className="h-4 w-4 shrink-0 text-warm-muted" />
            )}
            <span>
              {visible ? "Profil visible dans Découvrir" : "Profil invisible dans Découvrir"}
              <span className="mt-0.5 block text-xs text-warm-muted">
                {visible ? "Les autres peuvent vous voir" : "Vous êtes masqué des recherches"}
              </span>
            </span>
          </button>

          <Link
            href="/parametres"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-3 text-sm text-warm hover:bg-cream/80"
          >
            <Settings className="h-4 w-4 shrink-0 text-rose" />
            Paramètres de recherche
          </Link>

          <div className="my-1 border-t border-rose/10" />

          <button
            role="menuitem"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-rose hover:bg-rose/5"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Déconnexion
          </button>
        </div>
      )}
    </div>
  );
}
