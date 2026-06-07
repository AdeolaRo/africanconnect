"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import BrandBadge from "@/components/BrandBadge";
import { fetchJson } from "@/lib/fetch-json";
import { isModerator } from "@/lib/roles";
import { Flag, Check, X } from "lucide-react";

interface Report {
  id: string;
  targetType: string;
  targetId: string;
  targetUserId: string | null;
  reason: string;
  details: string | null;
  status: string;
  createdAt: string;
  reporter: { firstName: string; email: string };
}

export default function ModerationPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [filter, setFilter] = useState("PENDING");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/connexion");
    if (status === "authenticated" && !isModerator(session?.user?.role)) router.push("/decouvrir");
  }, [status, session, router]);

  async function load() {
    const { data } = await fetchJson<{ reports: Report[] }>(`/api/moderation/reports?status=${filter}`);
    if (data) setReports(data.reports);
  }

  useEffect(() => {
    if (isModerator(session?.user?.role)) load();
  }, [session, filter]);

  async function resolve(id: string, action: "RESOLVED" | "DISMISSED") {
    await fetchJson(`/api/moderation/reports/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, resolution: action === "RESOLVED" ? "Contenu traité" : "Non fondé" }),
    });
    load();
  }

  if (status === "loading") {
    return <div className="flex min-h-screen items-center justify-center text-warm-muted">Chargement...</div>;
  }

  return (
    <>
      <Header user={session?.user} />
      <main className="mx-auto max-w-4xl px-4 py-10">
        <div className="mb-8 flex items-center gap-3">
          <BrandBadge size="lg" />
          <div>
            <h1 className="flex items-center gap-2 font-serif text-2xl font-bold text-warm">
              <Flag className="h-6 w-6 text-amber" />
              Modération
            </h1>
            <p className="text-sm text-warm-muted">Signalements profils, messages et témoignages</p>
          </div>
        </div>

        <div className="mb-6 flex gap-2">
          {["PENDING", "RESOLVED", "DISMISSED", "ALL"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-4 py-1.5 text-sm ${
                filter === f ? "gradient-pulse text-white" : "border border-rose/20 text-warm-muted"
              }`}
            >
              {f === "PENDING" ? "En attente" : f === "RESOLVED" ? "Résolus" : f === "DISMISSED" ? "Rejetés" : "Tous"}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {reports.length === 0 && (
            <p className="rounded-2xl border border-rose/15 bg-white/90 p-10 text-center text-warm-muted">
              Aucun signalement dans cette catégorie
            </p>
          )}
          {reports.map((r) => (
            <article key={r.id} className="rounded-2xl border border-rose/15 bg-white/90 p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium text-warm">{r.reason}</p>
                  <p className="mt-1 text-sm text-warm-muted">
                    {r.targetType} · signalé par {r.reporter.firstName}
                  </p>
                  {r.details && <p className="mt-2 text-sm italic text-warm-muted">&ldquo;{r.details}&rdquo;</p>}
                  <p className="mt-1 text-xs text-warm-muted">{new Date(r.createdAt).toLocaleString("fr-FR")}</p>
                </div>
                <span className="rounded-full bg-cream px-2 py-0.5 text-xs text-warm-muted">{r.status}</span>
              </div>
              {r.status === "PENDING" && (
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => resolve(r.id, "RESOLVED")}
                    className="inline-flex items-center gap-1 rounded-full bg-plum/10 px-4 py-2 text-sm text-plum"
                  >
                    <Check className="h-4 w-4" /> Valider & désactiver
                  </button>
                  <button
                    onClick={() => resolve(r.id, "DISMISSED")}
                    className="inline-flex items-center gap-1 rounded-full border border-rose/20 px-4 py-2 text-sm text-warm-muted"
                  >
                    <X className="h-4 w-4" /> Rejeter
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      </main>
    </>
  );
}
