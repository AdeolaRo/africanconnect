"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import CVMatrimonial from "@/components/CVMatrimonial";
import ProfileSidebar from "@/components/ProfileSidebar";
import Link from "next/link";
import { fetchJson } from "@/lib/fetch-json";

interface ProfilePhoto {
  id: string;
  url: string;
  order: number;
}

interface ProfileResponse {
  user: { firstName: string };
  photos?: ProfilePhoto[];
  gender: string | null;
  age: number | null;
  height: number | null;
  profession: string | null;
  religion: string | null;
  origin: string | null;
  maritalStatus: string | null;
  location: string | null;
  bio: string | null;
  qualities: string | null;
  seekingAgeMax: number | null;
  seekingHeightMax: number | null;
  seekingProfession: string | null;
  seekingReligion: string | null;
  seekingOrigin: string | null;
  seekingMaritalStatus: string | null;
  seekingLocation: string | null;
  photoUrl: string | null;
  completionPct: number;
  completed: boolean;
}

export default function MonCVPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/connexion");
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated" || !session) return;

    async function load() {
      setLoading(true);
      setError("");
      const { data, error: err } = await fetchJson<ProfileResponse>("/api/profile");

      if (data?.user) {
        setProfile(data);
      } else if (err?.includes("404") || err?.includes("introuvable")) {
        router.push("/onboarding");
        return;
      } else {
        setError(err || "Impossible de charger le profil");
      }
      setLoading(false);
    }

    load();
  }, [session, status, router]);

  if (status === "loading" || loading) {
    return <div className="flex min-h-screen items-center justify-center text-warm-muted">Chargement...</div>;
  }

  if (error) {
    return (
      <>
        <Header user={session?.user} />
        <main className="mx-auto max-w-md px-4 py-20 text-center">
          <p className="text-rose">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-full gradient-pulse px-6 py-2 text-sm font-medium text-white"
          >
            Réessayer
          </button>
        </main>
      </>
    );
  }

  if (!profile) {
    return null;
  }

  if (!profile.completed) {
    return (
      <>
        <Header user={session?.user} />
        <main className="mx-auto max-w-md px-4 py-20 text-center">
          <p className="text-warm-muted">Votre profil est complété à {profile.completionPct}%</p>
          <Link href="/onboarding" className="mt-4 inline-block rounded-full gradient-pulse px-8 py-3 font-semibold text-white">
            Compléter mon profil
          </Link>
        </main>
      </>
    );
  }

  return (
    <>
      <Header user={session?.user} />
      <main className="px-4 py-10">
        <div className="mx-auto mb-6 flex max-w-6xl items-center justify-between">
          <h1 className="font-serif text-2xl font-bold text-warm">Mon profil</h1>
          <div className="flex gap-3">
            <Link href="/modifier-profil" className="text-sm text-rose hover:underline">Modifier</Link>
            <Link href="/decouvrir" className="rounded-full bg-warm px-5 py-2 text-sm font-medium text-cream">
              Découvrir
            </Link>
          </div>
        </div>
        <div className="mx-auto flex max-w-6xl flex-col gap-6 lg:flex-row lg:items-start">
          <div className="min-w-0 flex-1">
            <CVMatrimonial
              firstName={profile.user.firstName}
              profile={{
                ...profile,
                photoUrl: profile.photos?.[0]?.url ?? profile.photoUrl,
              }}
              isOwnProfile
              photoRevealed
            />
          </div>
          <ProfileSidebar />
        </div>
      </main>
    </>
  );
}
