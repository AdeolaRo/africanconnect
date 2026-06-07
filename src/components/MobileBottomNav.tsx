"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Compass,
  Mail,
  Eye,
  User,
  Shield,
  Flag,
  MoreHorizontal,
} from "lucide-react";
import NotificationBadge from "@/components/NotificationBadge";
import { useMessageUnreadCount } from "@/hooks/useMessageUnreadCount";
import { isAdmin, isModerator, isStaff } from "@/lib/roles";
import { useState } from "react";
import MobileMenuDrawer from "@/components/MobileMenuDrawer";

type NavItem = {
  href: string;
  label: string;
  icon: typeof Compass;
  badge?: number;
  match?: (path: string) => boolean;
};

export default function MobileBottomNav() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const { counts } = useMessageUnreadCount();
  const [menuOpen, setMenuOpen] = useState(false);

  if (status !== "authenticated" || !session?.user) return null;

  const role = session.user.role;
  let items: NavItem[] = [];

  if (!isStaff(role)) {
    items = [
      { href: "/decouvrir", label: "Découvrir", icon: Compass, match: (p) => p.startsWith("/decouvrir") || p.startsWith("/profil/") },
      { href: "/messages", label: "Messages", icon: Mail, badge: counts.total, match: (p) => p.startsWith("/messages") },
      { href: "/visites", label: "Visites", icon: Eye, match: (p) => p.startsWith("/visites") },
      { href: "/mon-cv", label: "Profil", icon: User, match: (p) => p.startsWith("/mon-cv") || p.startsWith("/modifier-profil") || p.startsWith("/parametres") },
    ];
  } else if (isAdmin(role)) {
    items = [
      { href: "/decouvrir", label: "Découvrir", icon: Compass, match: (p) => p.startsWith("/decouvrir") },
      { href: "/admin", label: "Admin", icon: Shield, match: (p) => p.startsWith("/admin") },
      { href: "/staff-messagerie", label: "Messages", icon: Mail, badge: counts.staff, match: (p) => p.startsWith("/staff-messagerie") },
    ];
  } else {
    items = [
      { href: "/decouvrir", label: "Découvrir", icon: Compass, match: (p) => p.startsWith("/decouvrir") },
      { href: "/moderation", label: "Modération", icon: Flag, match: (p) => p.startsWith("/moderation") },
      { href: "/staff-messagerie", label: "Messages", icon: Mail, badge: counts.staff, match: (p) => p.startsWith("/staff-messagerie") },
    ];
  }

  items.push({
    href: "#menu",
    label: "Plus",
    icon: MoreHorizontal,
    match: () => menuOpen,
  });

  return (
    <>
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 border-t border-rose/15 bg-cream/95 backdrop-blur-md md:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        aria-label="Navigation principale"
      >
        <ul className="mx-auto flex max-w-lg items-stretch justify-around px-1 pt-1">
          {items.map((item) => {
            const Icon = item.icon;
            const active = item.href === "#menu" ? menuOpen : (item.match?.(pathname) ?? pathname === item.href);

            if (item.href === "#menu") {
              return (
                <li key="menu" className="flex-1">
                  <button
                    type="button"
                    onClick={() => setMenuOpen(true)}
                    className={`relative flex w-full flex-col items-center gap-0.5 px-2 py-2 text-[10px] font-medium transition-colors ${
                      active ? "text-rose" : "text-warm-muted"
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${active ? "text-rose" : ""}`} />
                    {item.label}
                  </button>
                </li>
              );
            }

            return (
              <li key={item.href} className="flex-1">
                <Link
                  href={item.href}
                  className={`relative flex flex-col items-center gap-0.5 px-2 py-2 text-[10px] font-medium transition-colors ${
                    active ? "text-rose" : "text-warm-muted"
                  }`}
                >
                  <span className="relative">
                    <Icon className={`h-5 w-5 ${active ? "text-rose" : ""}`} />
                    {item.badge != null && item.badge > 0 && (
                      <NotificationBadge count={item.badge} className="-right-2.5 -top-1.5 h-4 min-w-4 text-[9px] ring-1" />
                    )}
                  </span>
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <MobileMenuDrawer open={menuOpen} onClose={() => setMenuOpen(false)} role={role} />
    </>
  );
}
