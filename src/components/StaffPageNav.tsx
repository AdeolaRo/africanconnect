import Link from "next/link";
import { ArrowLeft, Compass, Shield, Flag, Mail } from "lucide-react";
import { isAdmin, isModerator } from "@/lib/roles";

interface StaffPageNavProps {
  backHref: string;
  backLabel: string;
  role?: string | null;
}

const linkClass =
  "inline-flex items-center gap-2 rounded-full border border-rose/15 bg-white px-4 py-2 text-sm font-medium transition-colors hover:border-rose/30 hover:bg-cream/80";

export default function StaffPageNav({ backHref, backLabel, role }: StaffPageNavProps) {
  return (
    <nav className="mb-6 flex flex-wrap items-center gap-2 sm:gap-3">
      <Link href={backHref} className={`${linkClass} text-warm-muted hover:text-rose`}>
        <ArrowLeft className="h-4 w-4" />
        {backLabel}
      </Link>

      <span className="hidden h-4 w-px bg-rose/20 sm:block" aria-hidden />

      <Link href="/decouvrir" className={`${linkClass} text-rose`}>
        <Compass className="h-4 w-4" />
        Découvrir
      </Link>

      {isAdmin(role) && (
        <Link href="/admin" className={`${linkClass} text-plum`}>
          <Shield className="h-4 w-4" />
          Admin
        </Link>
      )}

      {isModerator(role) && (
        <>
          <Link href="/moderation" className={`${linkClass} text-warm`}>
            <Flag className="h-4 w-4" />
            Modération
          </Link>
          <Link href="/staff-messagerie" className={`${linkClass} text-warm-muted hover:text-rose`}>
            <Mail className="h-4 w-4" />
            Messagerie
          </Link>
        </>
      )}
    </nav>
  );
}
