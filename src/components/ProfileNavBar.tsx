"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { discoverProfileUrl } from "@/lib/discover-nav";

interface ProfileNavBarProps {
  currentId: string;
  firstName: string;
  nav: { index: number; total: number; ids: string[] };
}

export default function ProfileNavBar({ currentId, firstName, nav }: ProfileNavBarProps) {
  const router = useRouter();
  const { index, total, ids } = nav;
  const hasPrev = index > 0;
  const hasNext = index < total - 1;

  return (
    <div className="mx-auto mb-6 flex max-w-3xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <Link
        href="/decouvrir"
        className="inline-flex items-center gap-2 text-sm font-medium text-warm-muted transition-colors hover:text-rose"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour à Découvrir
      </Link>

      <div className="flex items-center justify-center gap-2">
        <button
          onClick={() => hasPrev && router.push(discoverProfileUrl(ids[index - 1]))}
          disabled={!hasPrev}
          aria-label="Profil précédent"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-rose/20 bg-white text-warm transition-all hover:border-rose/40 hover:bg-cream disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <div className="min-w-[140px] text-center">
          <p className="font-serif font-semibold text-warm">{firstName}</p>
          <p className="text-xs text-warm-muted">
            {index + 1} / {total}
          </p>
        </div>

        <button
          onClick={() => hasNext && router.push(discoverProfileUrl(ids[index + 1]))}
          disabled={!hasNext}
          aria-label="Profil suivant"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-rose/20 bg-white text-warm transition-all hover:border-rose/40 hover:bg-cream disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div className="hidden w-[140px] sm:block" aria-hidden />
    </div>
  );
}
