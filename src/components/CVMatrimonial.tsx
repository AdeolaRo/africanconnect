import { Check, X, MapPin, Briefcase, Heart, Lock, Sparkles } from "lucide-react";
import type { MatchDetail } from "@/types";
import AvatarPlaceholder from "@/components/AvatarPlaceholder";
import TrustScoreBadge from "@/components/TrustScoreBadge";
import { parseInterests } from "@/lib/interests";

interface CVProps {
  firstName: string;
  profile: {
    gender?: string | null;
    age?: number | null;
    height?: number | null;
    profession?: string | null;
    religion?: string | null;
    origin?: string | null;
    maritalStatus?: string | null;
    location?: string | null;
    bio?: string | null;
    qualities?: string | null;
    interests?: string | null;
    profileTitle?: string | null;
    lookingFor?: string | null;
    children?: string | null;
    alcohol?: string | null;
    smoking?: string | null;
    pets?: string | null;
    trustScore?: number | null;
    verified?: boolean;
    seekingAgeMax?: number | null;
    seekingHeightMax?: number | null;
    seekingProfession?: string | null;
    seekingReligion?: string | null;
    seekingOrigin?: string | null;
    seekingMaritalStatus?: string | null;
    seekingLocation?: string | null;
    photoUrl?: string | null;
  };
  matchDetails?: MatchDetail[];
  score?: number;
  photoRevealed?: boolean;
  isOwnProfile?: boolean;
  testimonials?: { authorName: string; content: string; rating?: number | null }[];
  earnedBadges?: { name: string; count: number }[];
  avgRating?: number | null;
}

function parseQualities(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

function CVRow({ label, value }: { label: string; value?: string | number | null }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 border-b border-rose/10 py-2.5 last:border-0">
      <span className="w-28 shrink-0 text-xs font-semibold uppercase tracking-wide text-warm-muted">{label}</span>
      <span className="text-sm text-warm">{value}</span>
    </div>
  );
}

export default function CVMatrimonial({
  firstName,
  profile,
  matchDetails,
  score,
  photoRevealed = false,
  isOwnProfile = false,
  testimonials = [],
  earnedBadges = [],
  avgRating = null,
}: CVProps) {
  const qualities = parseQualities(profile.qualities);
  const interests = parseInterests(profile.interests);
  const showPhoto = isOwnProfile || photoRevealed;

  return (
    <div className="mx-auto max-w-3xl overflow-hidden rounded-3xl border border-rose/20 bg-white shadow-xl shadow-rose/10">
      <div className="gradient-pulse px-8 py-8">
        <div className="flex items-center gap-5">
          <AvatarPlaceholder
            firstName={firstName}
            size="md"
            photoRevealed={showPhoto}
            photoUrl={profile.photoUrl}
          />
          <div className="text-white">
            <p className="text-sm font-medium text-white/80">
              {profile.profileTitle || (isOwnProfile ? "Mon profil de rencontre" : "Profil de rencontre")}
            </p>
            <h1 className="font-serif text-3xl font-bold">{firstName}</h1>
            <div className="mt-2">
              <TrustScoreBadge
                score={profile.trustScore ?? 0}
                verified={profile.verified}
                size="sm"
              />
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-white/80">
              {profile.gender && <span>{profile.gender}</span>}
              {profile.age && <span>{profile.age} ans</span>}
              {profile.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {profile.location}
                </span>
              )}
              {profile.profession && (
                <span className="flex items-center gap-1">
                  <Briefcase className="h-3.5 w-3.5" />
                  {profile.profession}
                </span>
              )}
            </div>
          </div>
          {score != null && (
            <div className="ml-auto hidden rounded-2xl bg-white/20 px-4 py-3 text-center backdrop-blur-sm sm:block">
              <p className="text-2xl font-bold text-white">{score}%</p>
              <p className="text-xs text-white/80">compatible</p>
            </div>
          )}
        </div>
        {!showPhoto && !isOwnProfile && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2 text-sm text-white/90 backdrop-blur-sm">
            <Lock className="h-4 w-4" />
            Photo révélée uniquement après un match mutuel
          </div>
        )}
      </div>

      <div className="border-b border-rose/10 bg-cream/50 px-8 py-5">
        <p className="text-center text-sm leading-relaxed text-warm-muted italic">
          &ldquo;{profile.bio || `${firstName} cherche une belle histoire, sincère et durable.`}&rdquo;
        </p>
      </div>

      <div className="grid gap-0 md:grid-cols-2">
        <div className="border-b border-rose/10 p-6 md:border-b-0 md:border-r">
          <h2 className="mb-4 flex items-center gap-2 font-serif text-lg font-bold text-warm">
            <Heart className="h-4 w-4 text-rose" fill="currentColor" />
            Qui je suis
          </h2>
          <CVRow label="Je suis" value={profile.gender} />
          <CVRow label="Âge" value={profile.age ? `${profile.age} ans` : null} />
          <CVRow label="Taille" value={profile.height ? `${profile.height} cm` : null} />
          <CVRow label="Profession" value={profile.profession} />
          <CVRow label="Valeurs" value={profile.religion} />
          <CVRow label="Origines" value={profile.origin} />
          <CVRow label="Situation" value={profile.maritalStatus} />
          <CVRow label="Ville" value={profile.location} />
          <CVRow label="Objectif" value={profile.lookingFor} />
          <CVRow label="Enfants" value={profile.children} />
          <CVRow label="Alcool" value={profile.alcohol} />
          <CVRow label="Tabac" value={profile.smoking} />
          <CVRow label="Animaux" value={profile.pets} />
        </div>

        <div className="bg-cream/30 p-6">
          <h2 className="mb-4 flex items-center gap-2 font-serif text-lg font-bold text-warm">
            <Heart className="h-4 w-4 text-plum" />
            Ce que je cherche
          </h2>
          <CVRow label="Âge max" value={profile.seekingAgeMax ? `${profile.seekingAgeMax} ans` : null} />
          <CVRow label="Taille max" value={profile.seekingHeightMax ? `${profile.seekingHeightMax} cm` : null} />
          <CVRow label="Profession" value={profile.seekingProfession} />
          <CVRow label="Valeurs" value={profile.seekingReligion} />
          <CVRow label="Origines" value={profile.seekingOrigin} />
          <CVRow label="Situation" value={profile.seekingMaritalStatus} />
          <CVRow label="Ville" value={profile.seekingLocation} />
        </div>
      </div>

      {interests.length > 0 && (
        <div className="border-t border-rose/10 px-8 py-5">
          <h2 className="mb-3 flex items-center gap-2 font-serif text-lg font-bold text-warm">
            <Sparkles className="h-4 w-4 text-amber" />
            Centres d&apos;intérêt
          </h2>
          <div className="flex flex-wrap gap-2">
            {interests.map((i) => (
              <span
                key={i}
                className="rounded-full border border-amber/25 bg-amber/10 px-4 py-1.5 text-sm font-medium text-warm"
              >
                {i}
              </span>
            ))}
          </div>
        </div>
      )}

      {qualities.length > 0 && (
        <div className="border-t border-rose/10 px-8 py-5">
          <h2 className="mb-3 font-serif text-lg font-bold text-warm">Mes qualités</h2>
          <div className="flex flex-wrap gap-2">
            {qualities.map((q) => (
              <span
                key={q}
                className="rounded-full bg-gradient-to-r from-rose/15 to-plum/15 px-4 py-1.5 text-sm font-medium text-warm"
              >
                {q}
              </span>
            ))}
          </div>
        </div>
      )}

      {earnedBadges.length > 0 && (
        <div className="border-t border-rose/10 px-8 py-5">
          <h2 className="mb-3 font-serif text-lg font-bold text-warm">Badges reçus après rencontre</h2>
          <div className="flex flex-wrap gap-2">
            {earnedBadges.map((b) => (
              <span key={b.name} className="rounded-full border border-plum/25 bg-plum/10 px-3 py-1 text-sm text-plum">
                {b.name} {b.count > 1 && `×${b.count}`}
              </span>
            ))}
          </div>
        </div>
      )}

      {testimonials.length > 0 && (
        <div className="border-t border-rose/10 bg-cream/30 px-8 py-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-serif text-lg font-bold text-warm">Témoignages</h2>
            {avgRating != null && (
              <span className="rounded-full bg-amber/15 px-3 py-1 text-sm font-medium text-amber">
                ★ {avgRating}/5
              </span>
            )}
          </div>
          <ul className="space-y-3">
            {testimonials.map((t, i) => (
              <li key={i} className="rounded-xl border border-rose/10 bg-white px-4 py-3 text-sm">
                <p className="text-warm-muted italic">&ldquo;{t.content}&rdquo;</p>
                <p className="mt-1 text-xs text-warm-muted">
                  — {t.authorName}
                  {t.rating ? ` · ★ ${t.rating}/5` : ""}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {matchDetails && matchDetails.length > 0 && (
        <div className="border-t border-rose/10 bg-plum/5 px-8 py-5">
          <h2 className="mb-3 font-serif text-lg font-bold text-warm">Votre compatibilité</h2>
          <div className="space-y-2">
            {matchDetails.map((d) => (
              <div
                key={d.label}
                className={`flex items-center justify-between rounded-xl px-4 py-2.5 text-sm ${
                  d.match ? "bg-plum/10" : "bg-cream-dark/50"
                }`}
              >
                <span className="font-medium text-warm">{d.label}</span>
                <span className="flex items-center gap-2 text-warm-muted">
                  {d.theirValue}
                  {d.match ? (
                    <Check className="h-4 w-4 text-plum" />
                  ) : (
                    <X className="h-4 w-4 text-rose/50" />
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
