"use client";

import { useRouter } from "next/navigation";
import { Heart, Lock, MapPin, Briefcase, Sparkles, Check, X } from "lucide-react";
import { discoverProfileUrl, saveDiscoverNav } from "@/lib/discover-nav";
import AvatarPlaceholder from "@/components/AvatarPlaceholder";
import TrustScoreBadge from "@/components/TrustScoreBadge";
import { getScoreLabel } from "@/lib/matching";

export interface DiscoverProfile {
  id: string;
  firstName: string;
  profileTitle?: string | null;
  trustScore?: number;
  verified?: boolean;
  lookingFor?: string | null;
  matchScore: number;
  matchLabel?: string;
  matchedCriteria?: string[];
  commonInterests?: string[];
  photoRevealed: boolean;
  profile: {
    age: number | null;
    location: string | null;
    profession: string | null;
    origin?: string | null;
    bio: string | null;
    gender: string | null;
  };
}

interface DiscoverCardProps {
  profile: DiscoverProfile;
  featured?: boolean;
  interestSent?: boolean;
  onInterest: (id: string) => void;
  onPass?: (id: string) => void;
  sending?: boolean;
  discoverIds?: string[];
  readOnly?: boolean;
}

function scoreRingColor(score: number) {
  if (score >= 85) return "from-plum to-rose";
  if (score >= 70) return "from-rose to-amber";
  return "from-warm-muted to-rose/60";
}

export default function DiscoverCard({
  profile: p,
  featured,
  interestSent,
  onInterest,
  onPass,
  sending,
  discoverIds,
  readOnly,
}: DiscoverCardProps) {
  const router = useRouter();
  const { profile } = p;

  function viewProfile() {
    if (discoverIds?.length) saveDiscoverNav(discoverIds);
    router.push(discoverProfileUrl(p.id, !!discoverIds?.length));
  }

  return (
    <article
      className={`group relative flex flex-col overflow-hidden rounded-3xl border bg-white/90 shadow-sm backdrop-blur-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-rose/15 ${
        featured
          ? "border-rose/40 ring-2 ring-rose/20 lg:col-span-2"
          : "border-rose/15"
      }`}
    >
      {featured && (
        <div className="absolute right-4 top-4 z-10 flex items-center gap-1 rounded-full gradient-pulse px-3 py-1 text-xs font-semibold text-white shadow-md">
          <Sparkles className="h-3 w-3" />
          Meilleur match
        </div>
      )}

      <div className={`relative p-5 ${featured ? "sm:flex sm:gap-6" : ""}`}>
        <div className={`flex items-start gap-4 ${featured ? "sm:flex-1" : ""}`}>
          <div className="relative shrink-0">
            <div
              className={`rounded-2xl bg-gradient-to-br p-[3px] ${scoreRingColor(p.matchScore)}`}
            >
              <div className="rounded-[13px] bg-white p-0.5">
                <AvatarPlaceholder firstName={p.firstName} size={featured ? "lg" : "md"} photoRevealed={false} />
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-white shadow-md">
              <span className="text-sm font-bold text-rose">{p.matchScore}%</span>
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-2">
              <h2 className="font-serif text-xl font-bold text-warm">
                {p.firstName}
                {profile.age && (
                  <span className="ml-1 text-lg font-normal text-warm-muted">, {profile.age}</span>
                )}
              </h2>
            </div>
            {p.profileTitle && (
              <p className="mt-0.5 text-sm font-medium text-rose">{p.profileTitle}</p>
            )}
            <p className="mt-0.5 text-xs text-warm-muted">{getScoreLabel(p.matchScore)}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <TrustScoreBadge score={p.trustScore ?? 0} verified={p.verified} size="sm" />
              {p.verified && (
                <span className="rounded-full border border-plum/25 bg-plum/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-plum">
                  Vérifié
                </span>
              )}
            </div>
            {p.lookingFor && (
              <p className="mt-1 text-xs text-warm-muted">Cherche : {p.lookingFor}</p>
            )}

            <div className="mt-3 flex flex-wrap gap-1.5">
              {profile.location && (
                <span className="inline-flex items-center gap-1 rounded-full bg-cream px-2.5 py-1 text-xs text-warm-muted">
                  <MapPin className="h-3 w-3 text-rose/70" />
                  {profile.location}
                </span>
              )}
              {profile.profession && (
                <span className="inline-flex items-center gap-1 rounded-full bg-cream px-2.5 py-1 text-xs text-warm-muted">
                  <Briefcase className="h-3 w-3 text-rose/70" />
                  {profile.profession}
                </span>
              )}
              {profile.origin && (
                <span className="rounded-full bg-cream px-2.5 py-1 text-xs text-warm-muted">
                  {profile.origin}
                </span>
              )}
            </div>

            {profile.bio && (
              <p className={`mt-3 text-sm leading-relaxed text-warm-muted ${featured ? "" : "line-clamp-2"}`}>
                &ldquo;{profile.bio}&rdquo;
              </p>
            )}

            {p.commonInterests && p.commonInterests.length > 0 && (
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {p.commonInterests.slice(0, 3).map((i) => (
                  <li
                    key={i}
                    className="inline-flex items-center gap-1 rounded-full border border-amber/30 bg-amber/10 px-2 py-0.5 text-xs text-warm"
                  >
                    <Sparkles className="h-3 w-3 text-amber" />
                    {i}
                  </li>
                ))}
              </ul>
            )}

            {p.matchedCriteria && p.matchedCriteria.length > 0 && (
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {p.matchedCriteria.filter((c) => c !== "Centres d'intérêt").slice(0, 3).map((c) => (
                  <li
                    key={c}
                    className="inline-flex items-center gap-1 rounded-full border border-plum/20 bg-plum/5 px-2 py-0.5 text-xs text-plum"
                  >
                    <Check className="h-3 w-3" />
                    {c}
                  </li>
                ))}
              </ul>
            )}

            <p className="mt-3 flex items-center gap-1 text-xs text-rose/60">
              <Lock className="h-3 w-3" /> Photo révélée après match mutuel
            </p>
          </div>
        </div>
      </div>

      <div className="mt-auto flex gap-2 border-t border-rose/10 bg-cream/30 p-4">
        {!readOnly && onPass && (
          <button
            onClick={() => onPass(p.id)}
            aria-label="Passer ce profil"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-rose/20 text-warm-muted hover:bg-cream hover:text-rose"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        <button
          onClick={viewProfile}
          className={`rounded-full border border-rose/20 bg-white px-4 py-2.5 text-center text-sm font-medium text-warm transition-colors hover:border-rose/40 hover:bg-cream ${readOnly ? "w-full" : "flex-1"}`}
        >
          Voir le profil
        </button>
        {!readOnly && (
          <button
            onClick={() => onInterest(p.id)}
            disabled={sending}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-semibold transition-all disabled:opacity-60 ${
              interestSent
                ? "border border-rose/30 bg-rose/10 text-rose hover:bg-rose/15"
                : "gradient-pulse text-white shadow-md shadow-rose/20 hover:shadow-lg"
            }`}
          >
            <Heart className="h-4 w-4" fill={interestSent ? "currentColor" : "none"} />
            {sending ? "..." : interestSent ? "Intérêt exprimé" : "Intérêt"}
          </button>
        )}
      </div>
    </article>
  );
}
