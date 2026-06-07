"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye } from "lucide-react";
import Header from "@/components/Header";
import { fetchJson } from "@/lib/fetch-json";

interface Visit {
  id: string;
  visitorId: string;
  firstName: string;
  age?: number | null;
  location?: string | null;
  visitedAt: string;
}

export default function VisitesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/connexion");
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;

    async function load() {
      const { data } = await fetchJson<{ visits: Visit[] }>("/api/profile/visits");
      if (data?.visits) setVisits(data.visits);
      setLoading(false);
    }

    load();
  }, [status]);

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  if (status === "loading" || loading) {
    return <div className="flex min-h-screen items-center justify-center text-warm-muted">Chargement...</div>;
  }

  return (
    <>
      <Header user={session?.user} />
      <main className="page-container max-w-2xl">
        <div className="mb-8">
          <h1 className="flex items-center gap-2 font-serif text-2xl font-bold text-warm">
            <Eye className="h-6 w-6 text-rose" />
            Visites de mon profil
          </h1>
          <p className="mt-2 text-warm-muted">
            Personnes qui ont consulté votre profil récemment
          </p>
        </div>

        <div className="rounded-2xl border border-rose/15 bg-white/85 shadow-sm backdrop-blur-sm">
          {visits.length === 0 ? (
            <div className="p-12 text-center text-warm-muted">
              <Eye className="mx-auto h-10 w-10 text-rose/30" />
              <p className="mt-4">Personne n&apos;a encore visité votre profil</p>
              <Link href="/decouvrir" className="mt-4 inline-block text-sm text-rose hover:underline">
                Découvrir des profils
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-rose/10">
              {visits.map((visit) => (
                <li key={visit.id}>
                  <Link
                    href={`/profil/${visit.visitorId}`}
                    className="flex items-center justify-between px-5 py-4 transition-colors hover:bg-cream/50"
                  >
                    <div>
                      <span className="font-medium text-warm">{visit.firstName}</span>
                      {visit.age && (
                        <span className="text-warm-muted">, {visit.age} ans</span>
                      )}
                      {visit.location && (
                        <p className="text-sm text-warm-muted">{visit.location}</p>
                      )}
                    </div>
                    <span className="text-xs text-warm-muted">{formatDate(visit.visitedAt)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </>
  );
}
