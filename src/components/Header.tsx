"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import BrandBadge from "@/components/BrandBadge";
import UserMenu from "@/components/UserMenu";
import { isAdmin, isModerator, isStaff } from "@/lib/roles";

interface HeaderProps {
  user?: { name?: string | null; role?: string | null } | null;
}

export default function Header({ user: userProp }: HeaderProps) {
  const { data: session } = useSession();
  const user = userProp ?? session?.user;
  const role = user?.role;

  return (
    <header className="sticky top-0 z-50 border-b border-rose/15 bg-cream/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center gap-2">
          <BrandBadge size="sm" showLabel />
        </Link>
        <nav className="flex flex-wrap items-center justify-end gap-3 text-sm text-warm-muted">
          {user ? (
            <>
              {isAdmin(role) && (
                <Link href="/admin" className="font-medium text-plum hover:underline">Admin</Link>
              )}
              {isModerator(role) && (
                <Link href="/moderation" className="font-medium text-amber hover:underline">Modération</Link>
              )}
              {!isStaff(role) && (
                <>
                  <Link href="/decouvrir" className="hover:text-rose transition-colors">Découvrir</Link>
                  <Link href="/mon-cv" className="hover:text-rose transition-colors">Mon profil</Link>
                  <Link href="/visites" className="hover:text-rose transition-colors">Visites</Link>
                  <Link href="/messages" className="hover:text-rose transition-colors">Messages</Link>
                </>
              )}
              <UserMenu name={user.name ?? "Profil"} role={role} />
            </>
          ) : (
            <>
              <Link href="/connexion" className="hover:text-rose transition-colors">Connexion</Link>
              <Link
                href="/inscription"
                className="rounded-full gradient-pulse px-5 py-2 font-medium text-white shadow-md shadow-rose/30"
              >
                S&apos;inscrire — Gratuit
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
