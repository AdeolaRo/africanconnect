"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import CVMatrimonial from "@/components/CVMatrimonial";
import ScoreBadge from "@/components/ScoreBadge";
import StepIndicator from "@/components/StepIndicator";
import ProfileNavBar from "@/components/ProfileNavBar";
import InterestButton from "@/components/InterestButton";
import ValidationModal from "@/components/ValidationModal";
import { ShieldCheck } from "lucide-react";
import { fetchJson } from "@/lib/fetch-json";
import { discoverProfileUrl, getDiscoverNavIndex, saveDiscoverNav } from "@/lib/discover-nav";
import type { MatchDetail } from "@/types";

interface MatchResponse {
  user: { id: string; firstName: string };
  profile: Record<string, unknown>;
  match: { score: number; details: MatchDetail[] };
  photoRevealed: boolean;
  step: number;
  stepLabel: string;
  error?: string;
}

export default function ProfilContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const userId = params.id as string;
  const fromDiscover = searchParams.get("from") === "discover";

  const [data, setData] = useState<MatchResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [nav, setNav] = useState<{ index: number; total: number; ids: string[] } | null>(null);
  const [interestSent, setInterestSent] = useState(false);
  const [interestLoading, setInterestLoading] = useState(false);
  const [testimonials, setTestimonials] = useState<{ authorName: string; content: string; rating?: number | null }[]>([]);
  const [avgRating, setAvgRating] = useState<number | null>(null);
  const [earnedBadges, setEarnedBadges] = useState<{ name: string; count: number }[]>([]);
  const [showValidation, setShowValidation] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/connexion");
  }, [status, router]);

  useEffect(() => {
    if (!fromDiscover) {
      setNav(null);
      return;
    }

    const cached = getDiscoverNavIndex(userId);
    if (cached) {
      setNav(cached);
      return;
    }

    async function rebuildNav() {
      const { data } = await fetchJson<{ profiles?: { id: string }[]; myUserId?: string }>("/api/discover");
      if (!data?.profiles?.length) return;

      const myId = data.myUserId ?? session?.user?.id;
      const ids = data.profiles.filter((p) => p.id !== myId).map((p) => p.id);
      if (ids.length === 0) return;

      saveDiscoverNav(ids);
      const index = ids.indexOf(userId);
      if (index !== -1) setNav({ index, total: ids.length, ids });
    }

    rebuildNav();
  }, [userId, fromDiscover, session?.user?.id]);

  async function loadProfile() {
    setLoading(true);
    setError("");
    const { data: result, error: err } = await fetchJson<MatchResponse>(`/api/match/${userId}`);
    if (result) {
      setData(result);
    } else {
      setError(err || "Impossible de charger le profil");
      setData(null);
    }
    setLoading(false);
  }

  useEffect(() => {
    if (session && userId) loadProfile();
  }, [session, userId]);

  useEffect(() => {
    if (!session || !userId) return;
    fetchJson<{
      testimonials: { authorName: string; content: string; rating?: number | null }[];
      badges: { name: string; count: number }[];
      avgRating: number | null;
    }>(`/api/testimonials/${userId}`).then(({ data }) => {
      if (data) {
        setTestimonials(data.testimonials);
        setEarnedBadges(data.badges);
        setAvgRating(data.avgRating);
      }
    });
  }, [session, userId]);

  const goToAdjacent = useCallback(
    (direction: "prev" | "next") => {
      if (!nav) return;
      const newIndex = direction === "prev" ? nav.index - 1 : nav.index + 1;
      if (newIndex < 0 || newIndex >= nav.total) return;
      router.push(discoverProfileUrl(nav.ids[newIndex]));
    },
    [nav, router]
  );

  useEffect(() => {
    if (!fromDiscover || !nav) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") goToAdjacent("prev");
      if (e.key === "ArrowRight") goToAdjacent("next");
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [fromDiscover, nav, goToAdjacent]);

  async function toggleInterest() {
    setInterestLoading(true);

    if (interestSent) {
      const { error: err } = await fetchJson(`/api/interest/${userId}`, { method: "DELETE" });
      if (!err) setInterestSent(false);
      else alert(err);
    } else {
      const { data: result, error: err } = await fetchJson<{ matched?: boolean }>("/api/interest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toUserId: userId }),
      });

      if (err) {
        alert(err);
      } else if (result?.matched) {
        await loadProfile();
        router.push(`/messages?with=${userId}`);
      } else {
        setInterestSent(true);
      }
    }

    setInterestLoading(false);
  }

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-warm-muted">Chargement...</div>;
  }

  if (error || !data) {
    return (
      <>
        <Header user={session?.user} />
        <main className="mx-auto max-w-md px-4 py-20 text-center">
          <p className="text-warm-muted">{error || "Profil introuvable"}</p>
          <Link href="/decouvrir" className="mt-4 inline-block text-rose hover:underline">
            ← Retour à Découvrir
          </Link>
        </main>
      </>
    );
  }

  const currentStep = data.photoRevealed ? 3 : 1;

  return (
    <>
      <Header user={session?.user} />
      <main className="page-container">
        {fromDiscover && nav && (
          <ProfileNavBar
            currentId={userId}
            firstName={data.user.firstName}
            nav={nav}
          />
        )}

        {!fromDiscover && (
          <div className="mx-auto mb-6 max-w-3xl">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 text-sm font-medium text-warm-muted transition-colors hover:text-rose"
            >
              ← Retour
            </button>
          </div>
        )}

        <div className="mx-auto mb-6 max-w-3xl space-y-4">
          <StepIndicator currentStep={currentStep as 1 | 2 | 3} />
          <p className="text-center text-sm text-warm-muted">{data.stepLabel}</p>
          <div className="flex items-center justify-between">
            <ScoreBadge score={data.match.score} />
            {!data.photoRevealed && (
              <InterestButton
                interestSent={interestSent}
                loading={interestLoading}
                onClick={toggleInterest}
              />
            )}
            {data.photoRevealed && (
              <div className="flex gap-2">
                <button
                  onClick={() => setShowValidation(true)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-plum/30 bg-plum/10 px-4 py-2.5 text-sm font-medium text-plum"
                >
                  <ShieldCheck className="h-4 w-4" />
                  Valider rencontre
                </button>
                <button
                  onClick={() => router.push(`/messages?with=${userId}`)}
                  className="rounded-full gradient-pulse px-6 py-2.5 font-semibold text-white shadow-md"
                >
                  Message
                </button>
              </div>
            )}
          </div>
        </div>
        <CVMatrimonial
          firstName={data.user.firstName}
          profile={data.profile as Parameters<typeof CVMatrimonial>[0]["profile"]}
          matchDetails={data.match.details}
          score={data.match.score}
          photoRevealed={data.photoRevealed}
          testimonials={testimonials}
          earnedBadges={earnedBadges}
          avgRating={avgRating}
        />
      </main>
      {showValidation && (
        <ValidationModal
          partnerId={userId}
          partnerName={data.user.firstName}
          onClose={() => setShowValidation(false)}
          onSuccess={() => loadProfile()}
        />
      )}
    </>
  );
}
