"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, ArrowRight } from "lucide-react";
import PublicProfileCard, { type PublicProfile } from "@/components/PublicProfileCard";
import { fetchJson } from "@/lib/fetch-json";

export default function HomePreviewProfiles() {
  const [profiles, setProfiles] = useState<PublicProfile[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJson<{ profiles: PublicProfile[]; total: number }>("/api/preview-profiles").then(({ data }) => {
      if (data) {
        setProfiles(data.profiles.slice(0, 6));
        setTotal(data.total);
      }
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-rose/30 border-t-rose" />
        </div>
      </section>
    );
  }

  if (profiles.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 md:py-20">
      <div className="text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-rose/10 px-4 py-1.5 text-sm font-medium text-rose">
          <Users className="h-4 w-4" />
          {total} profil{total > 1 ? "s" : ""} sur AfricanConnect
        </span>
        <h2 className="mt-4 font-serif text-3xl font-bold text-warm md:text-4xl">
          Ils et elles nous font déjà confiance
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-warm-muted">
          Aperçu des profils actifs — connectez-vous pour voir votre compatibilité
          et exprimer votre intérêt.
        </p>
      </div>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {profiles.map((p, i) => (
          <PublicProfileCard key={`${p.firstName}-${i}`} profile={p} />
        ))}
      </div>

      <div className="mt-10 text-center">
        <Link
          href="/inscription"
          className="inline-flex items-center gap-2 rounded-full gradient-pulse px-8 py-3.5 font-semibold text-white shadow-md shadow-rose/25 hover:shadow-lg"
        >
          Voir tous les profils compatibles
          <ArrowRight className="h-4 w-4" />
        </Link>
        <p className="mt-3 text-xs text-warm-muted">
          Gratuit · Sans photo visible avant match mutuel
        </p>
      </div>
    </section>
  );
}
