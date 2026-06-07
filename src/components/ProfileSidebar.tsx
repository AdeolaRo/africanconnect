"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, MessageCircle, ShieldCheck, UserMinus, UserPlus } from "lucide-react";
import ValidationModal from "@/components/ValidationModal";
import { fetchJson } from "@/lib/fetch-json";

interface PersonItem {
  id: string;
  partnerId: string;
  firstName: string;
  age?: number | null;
  location?: string | null;
  createdAt: string;
}

interface InterestData {
  interests: PersonItem[];
  matches: PersonItem[];
}

interface ProfileSidebarProps {
  onRefresh?: () => void;
}

export default function ProfileSidebar({ onRefresh }: ProfileSidebarProps) {
  const [data, setData] = useState<InterestData | null>(null);
  const [loading, setLoading] = useState(true);
  const [unmatching, setUnmatching] = useState<string | null>(null);
  const [validating, setValidating] = useState<{ id: string; name: string } | null>(null);

  async function load() {
    setLoading(true);
    const { data: result } = await fetchJson<InterestData>("/api/interest");
    if (result) setData(result);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleUnmatch(partnerId: string, name: string) {
    if (!confirm(`Dématcher avec ${name} ? Les messages seront supprimés.`)) return;

    setUnmatching(partnerId);
    const { error } = await fetchJson(`/api/interest/${partnerId}`, { method: "DELETE" });
    if (!error) {
      await load();
      onRefresh?.();
    }
    setUnmatching(null);
  }

  if (loading) {
    return (
      <aside className="w-full shrink-0 space-y-4 lg:w-72">
        <div className="rounded-2xl border border-rose/15 bg-white/80 p-4 backdrop-blur-sm">
          <p className="text-sm text-warm-muted">Chargement...</p>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-full shrink-0 space-y-4 lg:w-72">
      <section className="rounded-2xl border border-rose/15 bg-white/85 p-4 shadow-sm backdrop-blur-sm">
        <h2 className="flex items-center gap-2 font-semibold text-warm">
          <UserPlus className="h-4 w-4 text-rose" />
          Mes intérêts
        </h2>
        <p className="mt-1 text-xs text-warm-muted">Personnes pour qui j&apos;ai marqué de l&apos;intérêt</p>

        {data?.interests.length === 0 ? (
          <p className="mt-4 text-sm text-warm-muted">Aucun intérêt envoyé pour le moment</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {data?.interests.map((item) => (
              <li key={item.id}>
                <Link
                  href={`/profil/${item.partnerId}`}
                  className="flex items-center justify-between rounded-xl border border-rose/10 bg-cream/50 px-3 py-2.5 text-sm transition-colors hover:border-rose/30 hover:bg-cream"
                >
                  <div>
                    <span className="font-medium text-warm">{item.firstName}</span>
                    {item.age && (
                      <span className="ml-1 text-warm-muted">, {item.age} ans</span>
                    )}
                    {item.location && (
                      <p className="text-xs text-warm-muted">{item.location}</p>
                    )}
                  </div>
                  <Heart className="h-4 w-4 shrink-0 text-rose" fill="currentColor" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-2xl border border-rose/15 bg-white/85 p-4 shadow-sm backdrop-blur-sm">
        <h2 className="flex items-center gap-2 font-semibold text-warm">
          <Heart className="h-4 w-4 text-rose" fill="currentColor" />
          Mes matchs
        </h2>
        <p className="mt-1 text-xs text-warm-muted">Intérêt mutuel — photos et messages débloqués</p>

        {data?.matches.length === 0 ? (
          <p className="mt-4 text-sm text-warm-muted">Aucun match pour le moment</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {data?.matches.map((item) => (
              <li key={item.id} className="rounded-xl border border-rose/10 bg-cream/50 p-3">
                <div className="flex items-start justify-between gap-2">
                  <Link href={`/profil/${item.partnerId}`} className="flex-1 hover:text-rose">
                    <span className="font-medium text-warm">{item.firstName}</span>
                    {item.age && (
                      <span className="text-warm-muted">, {item.age} ans</span>
                    )}
                    {item.location && (
                      <p className="text-xs text-warm-muted">{item.location}</p>
                    )}
                  </Link>
                </div>
                <div className="mt-2 flex gap-2">
                  <Link
                    href={`/messages?with=${item.partnerId}`}
                    className="inline-flex items-center gap-1 rounded-full bg-warm px-3 py-1 text-xs font-medium text-cream"
                  >
                    <MessageCircle className="h-3 w-3" />
                    Message
                  </Link>
                  <button
                    onClick={() => handleUnmatch(item.partnerId, item.firstName)}
                    disabled={unmatching === item.partnerId}
                    className="inline-flex items-center gap-1 rounded-full border border-rose/30 px-3 py-1 text-xs text-rose hover:bg-rose/5 disabled:opacity-50"
                  >
                    <UserMinus className="h-3 w-3" />
                    {unmatching === item.partnerId ? "..." : "Dématcher"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
      {validating && (
        <ValidationModal
          partnerId={validating.id}
          partnerName={validating.name}
          onClose={() => setValidating(null)}
          onSuccess={() => load()}
        />
      )}
    </aside>
  );
}
