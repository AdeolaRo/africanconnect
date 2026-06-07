"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import BrandBadge from "@/components/BrandBadge";
import UserMenu from "@/components/UserMenu";
import NotificationBadge from "@/components/NotificationBadge";
import { useMessageUnreadCount } from "@/hooks/useMessageUnreadCount";
import { isAdmin, isModerator, isStaff } from "@/lib/roles";

interface HeaderProps {
  user?: { name?: string | null; role?: string | null } | null;
}

function NavLinkWithBadge({
  href,
  children,
  count,
  className,
}: {
  href: string;
  children: React.ReactNode;
  count?: number;
  className?: string;
}) {
  return (
    <Link href={href} className={`relative inline-flex items-center ${className ?? ""}`}>
      {children}
      {count != null && count > 0 && <NotificationBadge count={count} />}
    </Link>
  );
}

export default function Header({ user: userProp }: HeaderProps) {
  const { data: session } = useSession();
  const user = userProp ?? session?.user;
  const role = user?.role;
  const { counts } = useMessageUnreadCount();

  return (
    <header className="sticky top-0 z-50 border-b border-rose/15 bg-cream/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:py-4">
        <Link href="/" className="flex items-center gap-2">
          <BrandBadge size="sm" showLabel />
        </Link>
        <nav className="flex items-center justify-end gap-2 text-sm text-warm-muted md:gap-3">
          {user ? (
            <>
              <div className="hidden items-center gap-3 md:flex">
                {isAdmin(role) && (
                  <Link href="/admin" className="font-medium text-plum hover:underline">Admin</Link>
                )}
                <Link href="/decouvrir" className="hover:text-rose transition-colors">Découvrir</Link>
                {isModerator(role) && (
                  <>
                    <Link href="/moderation" className="font-medium text-amber hover:underline">Modération</Link>
                    <NavLinkWithBadge href="/staff-messagerie" count={counts.staff} className="font-medium text-rose hover:underline">
                      Messagerie
                    </NavLinkWithBadge>
                  </>
                )}
                {!isStaff(role) && (
                  <>
                    <Link href="/mon-cv" className="hover:text-rose transition-colors">Mon profil</Link>
                    <Link href="/visites" className="hover:text-rose transition-colors">Visites</Link>
                    <NavLinkWithBadge href="/messages" count={counts.total} className="hover:text-rose transition-colors">
                      Messages
                    </NavLinkWithBadge>
                  </>
                )}
              </div>
              <UserMenu name={user.name ?? "Profil"} role={role} />
            </>
          ) : (
            <>
              <Link href="/connexion" className="hover:text-rose transition-colors">Connexion</Link>
              <Link
                href="/inscription"
                className="rounded-full gradient-pulse px-4 py-2 text-sm font-medium text-white shadow-md shadow-rose/30 md:px-5"
              >
                <span className="hidden sm:inline">S&apos;inscrire — Gratuit</span>
                <span className="sm:hidden">S&apos;inscrire</span>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
