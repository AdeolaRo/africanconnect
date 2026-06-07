"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SlidersHorizontal, Users, Sparkles } from "lucide-react";
import Header from "@/components/Header";
import DiscoverCard, { type DiscoverProfile } from "@/components/DiscoverCard";
import StepIndicator from "@/components/StepIndicator";
import { fetchJson } from "@/lib/fetch-json";
import { discoverProfileUrl, saveDiscoverNav } from "@/lib/discover-nav";
import StaffPageNav from "@/components/StaffPageNav";
import { isStaff, staffHomePath } from "@/lib/roles";

type SortOption = "score" | "age-asc" | "age-desc" | "city";
type ScoreFilter = "all" | "70" | "85";
type VerifiedFilter = "all" | "verified";

export default function DecouvrirPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profiles, setProfiles] = useState<DiscoverProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [sort, setSort] = useState<SortOption>("score");
  const [scoreFilter, setScoreFilter] = useState<ScoreFilter>("all");
  const [cityFilter, setCityFilter] = useState("all");
  const [verifiedFilter, setVerifiedFilter] = useState<VerifiedFilter>("all");
  const [sentInterests, setSentInterests] = useState<Set<string>>(new Set());
  const [sending, setSending] = useState<string | null>(null);
  const [staffPreview, setStaffPreview] = useState(false);

  const role = session?.user?.role;
  const staffMode = isStaff(role);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/connexion");
  }, [status, router]);

  useEffect(() => {
    if (!session) return;

    async function load() {
      const discoverUrl =
        verifiedFilter === "verified" ? "/api/discover?verifiedOnly=true" : "/api/discover";
      const [discoverRes, interestRes] = await Promise.all([
        fetchJson<{ profiles?: DiscoverProfile[]; myUserId?: string; error?: string; staffPreview?: boolean }>(discoverUrl),
        fetchJson<{ interests: { partnerId: string }[] }>("/api/interest"),
      ]);

      if (discoverRes.data?.profiles) {
        const myId = discoverRes.data.myUserId ?? session?.user?.id;
        const others = discoverRes.data.profiles.filter((p) => p.id !== myId);
        setProfiles(others);
        setStaffPreview(!!discoverRes.data.staffPreview);
      }
      if (discoverRes.data?.error) setMessage(discoverRes.data.error);

      if (interestRes.data?.interests) {
        setSentInterests(new Set(interestRes.data.interests.map((i) => i.partnerId)));
      }
      setLoading(false);
    }

    load();
  }, [session, verifiedFilter]);

  const cities = useMemo(() => {
    const set = new Set(profiles.map((p) => p.profile.location).filter(Boolean) as string[]);
    return Array.from(set).sort();
  }, [profiles]);

  const filtered = useMemo(() => {
    let list = [...profiles];

    if (scoreFilter === "70") list = list.filter((p) => p.matchScore >= 70);
    if (scoreFilter === "85") list = list.filter((p) => p.matchScore >= 85);
    if (cityFilter !== "all") list = list.filter((p) => p.profile.location === cityFilter);

    list.sort((a, b) => {
      if (sort === "score") return b.matchScore - a.matchScore;
      if (sort === "age-asc") return (a.profile.age ?? 99) - (b.profile.age ?? 99);
      if (sort === "age-desc") return (b.profile.age ?? 0) - (a.profile.age ?? 0);
      if (sort === "city") return (a.profile.location ?? "").localeCompare(b.profile.location ?? "");
      return 0;
    });

    return list;
  }, [profiles, sort, scoreFilter, cityFilter]);

  const topMatch = filtered[0];
  const discoverIds = useMemo(() => filtered.map((p) => p.id), [filtered]);

  useEffect(() => {
    if (discoverIds.length > 0) saveDiscoverNav(discoverIds);
  }, [discoverIds]);

  async function toggleInterest(userId: string) {
    setSending(userId);

    if (sentInterests.has(userId)) {
      const { error } = await fetchJson(`/api/interest/${userId}`, { method: "DELETE" });
      if (!error) {
        setSentInterests((prev) => {
          const next = new Set(prev);
          next.delete(userId);
          return next;
        });
      } else {
        alert(error);
      }
    } else {
      const { data, error } = await fetchJson<{ matched?: boolean }>("/api/interest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toUserId: userId }),
      });

      if (error) {
        alert(error);
      } else {
        setSentInterests((prev) => new Set([...prev, userId]));
        if (data?.matched) router.push(`/messages?with=${userId}`);
      }
    }

    setSending(null);
  }

  async function passProfile(userId: string) {
    await fetchJson("/api/pass", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ toUserId: userId }),
    });
    setProfiles((prev) => prev.filter((p) => p.id !== userId));
  }

  return (
    <>
      <Header user={session?.user} />
      <main className="mx-auto max-w-6xl px-4 py-10">
        {staffMode && staffHomePath(role) && (
          <StaffPageNav
            backHref={staffHomePath(role)!}
            backLabel={role === "ADMIN" ? "Retour admin" : "Retour modération"}
            role={role}
          />
        )}

        {staffPreview && (
          <p className="mb-6 rounded-xl border border-plum/20 bg-plum/5 px-4 py-3 text-center text-sm text-plum">
            Mode consultation équipe — parcours membre en lecture seule (sans intérêt ni match).
          </p>
        )}

        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose/10 px-4 py-1.5 text-sm font-medium text-rose">
            <Sparkles className="h-4 w-4" />
            Étape 1 — Découverte sans photo
          </span>
          <h1 className="mt-4 font-serif text-3xl font-bold text-warm md:text-4xl">
            Profils compatibles
          </h1>
          <div className="mt-5 flex justify-center">
            <StepIndicator currentStep={1} />
          </div>
        </div>

        {!loading && profiles.length > 0 && (
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 rounded-2xl border border-rose/15 bg-white/80 px-5 py-4 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-sm text-warm">
              <Users className="h-4 w-4 text-rose" />
              <span>
                <strong>{filtered.length}</strong> profil{filtered.length > 1 ? "s" : ""} affiché{filtered.length > 1 ? "s" : ""}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-warm-muted" />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortOption)}
                className="rounded-full border border-rose/20 bg-cream px-3 py-1.5 text-sm text-warm focus:border-rose focus:outline-none"
              >
                <option value="score">Meilleure compatibilité</option>
                <option value="age-asc">Âge croissant</option>
                <option value="age-desc">Âge décroissant</option>
                <option value="city">Ville (A→Z)</option>
              </select>

              <select
                value={scoreFilter}
                onChange={(e) => setScoreFilter(e.target.value as ScoreFilter)}
                className="rounded-full border border-rose/20 bg-cream px-3 py-1.5 text-sm text-warm focus:border-rose focus:outline-none"
              >
                <option value="all">Tous les scores</option>
                <option value="70">70% et plus</option>
                <option value="85">85% et plus</option>
              </select>

              {cities.length > 1 && (
                <select
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.target.value)}
                  className="rounded-full border border-rose/20 bg-cream px-3 py-1.5 text-sm text-warm focus:border-rose focus:outline-none"
                >
                  <option value="all">Toutes les villes</option>
                  {cities.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              )}

              <select
                value={verifiedFilter}
                onChange={(e) => setVerifiedFilter(e.target.value as VerifiedFilter)}
                className="rounded-full border border-rose/20 bg-cream px-3 py-1.5 text-sm text-warm focus:border-rose focus:outline-none"
              >
                <option value="all">Tous les profils</option>
                <option value="verified">Profils vérifiés uniquement</option>
              </select>
            </div>
          </div>
        )}

        {loading && (
          <div className="mt-16 flex flex-col items-center gap-3 text-warm-muted">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-rose/30 border-t-rose" />
            <p>Recherche de profils compatibles...</p>
          </div>
        )}

        {message && !loading && profiles.length === 0 && (
          <div className="mt-12 rounded-2xl border border-rose/15 bg-white/85 p-10 text-center shadow-sm backdrop-blur-sm">
            <p className="text-warm-muted">{message}</p>
            <Link href="/onboarding" className="mt-4 inline-block text-rose hover:underline">
              Compléter mon profil →
            </Link>
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p, i) => (
              <DiscoverCard
                key={p.id}
                profile={p}
                featured={i === 0 && sort === "score" && scoreFilter === "all" && cityFilter === "all"}
                interestSent={sentInterests.has(p.id)}
                sending={sending === p.id}
                onInterest={staffPreview ? () => {} : toggleInterest}
                onPass={staffPreview ? undefined : passProfile}
                readOnly={staffPreview}
                discoverIds={discoverIds}
              />
            ))}
          </div>
        )}

        {!loading && profiles.length > 0 && filtered.length === 0 && (
          <p className="mt-12 text-center text-warm-muted">
            Aucun profil ne correspond à ces filtres — élargissez votre recherche.
          </p>
        )}

        {!loading && profiles.length === 0 && !message && (
          <p className="mt-12 text-center text-warm-muted">
            Aucun profil compatible pour le moment — revenez bientôt !
          </p>
        )}

        {!loading && topMatch && (
          <p className="mt-10 text-center text-xs text-warm-muted">
            Le score combine vos critères essentiels (70%) et vos affinités secondaires (30%).
            {" "}
            <button
              onClick={() => {
                saveDiscoverNav(discoverIds);
                router.push(discoverProfileUrl(topMatch.id));
              }}
              className="text-rose hover:underline"
            >
              Voir le détail avec {topMatch.firstName} →
            </button>
          </p>
        )}
      </main>
    </>
  );
}
