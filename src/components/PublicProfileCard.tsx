import Link from "next/link";
import { Lock, MapPin, Briefcase, Sparkles } from "lucide-react";
import AvatarPlaceholder from "@/components/AvatarPlaceholder";
import TrustScoreBadge from "@/components/TrustScoreBadge";

export interface PublicProfile {
  firstName: string;
  profileTitle?: string | null;
  lookingFor?: string | null;
  verified?: boolean;
  trustScore?: number;
  age?: number | null;
  location?: string | null;
  profession?: string | null;
  origin?: string | null;
  bio?: string | null;
  interests?: string[];
}

export default function PublicProfileCard({ profile: p }: { profile: PublicProfile }) {
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-3xl border border-rose/15 bg-white/90 shadow-sm backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-rose/10">
      <div className="p-5">
        <div className="flex items-start gap-4">
          <div className="relative shrink-0">
            <div className="rounded-2xl bg-gradient-to-br from-plum/20 via-rose/20 to-amber/20 p-[3px]">
              <div className="rounded-[13px] bg-white p-0.5 opacity-90">
                <AvatarPlaceholder firstName={p.firstName} size="md" photoRevealed={false} />
              </div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-warm/5 opacity-0 transition-opacity group-hover:opacity-100">
              <Lock className="h-5 w-5 text-warm/60" />
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="font-serif text-lg font-bold text-warm">
              {p.firstName}
              {p.age != null && (
                <span className="ml-1 text-base font-normal text-warm-muted">, {p.age}</span>
              )}
            </h3>
            {p.profileTitle && (
              <p className="mt-0.5 text-sm font-medium text-rose">{p.profileTitle}</p>
            )}
            <div className="mt-2">
              <TrustScoreBadge score={p.trustScore ?? 0} verified={p.verified} size="sm" />
            </div>

            <div className="mt-2 flex flex-wrap gap-1.5">
              {p.location && (
                <span className="inline-flex items-center gap-1 rounded-full bg-cream px-2 py-0.5 text-xs text-warm-muted">
                  <MapPin className="h-3 w-3 text-rose/70" />
                  {p.location}
                </span>
              )}
              {p.profession && (
                <span className="inline-flex items-center gap-1 rounded-full bg-cream px-2 py-0.5 text-xs text-warm-muted">
                  <Briefcase className="h-3 w-3 text-rose/70" />
                  {p.profession}
                </span>
              )}
            </div>

            {p.bio && (
              <p className="mt-2 line-clamp-2 text-sm text-warm-muted">&ldquo;{p.bio}&rdquo;</p>
            )}

            {p.interests && p.interests.length > 0 && (
              <ul className="mt-2 flex flex-wrap gap-1">
                {p.interests.map((i) => (
                  <li
                    key={i}
                    className="inline-flex items-center gap-0.5 rounded-full border border-amber/25 bg-amber/10 px-2 py-0.5 text-[11px] text-warm"
                  >
                    <Sparkles className="h-2.5 w-2.5 text-amber" />
                    {i}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <div className="mt-auto border-t border-rose/10 bg-cream/40 px-5 py-3">
        <Link
          href="/inscription"
          className="flex items-center justify-center gap-2 text-sm font-medium text-rose hover:underline"
        >
          <Lock className="h-3.5 w-3.5" />
          Inscrivez-vous pour découvrir
        </Link>
      </div>
    </article>
  );
}
