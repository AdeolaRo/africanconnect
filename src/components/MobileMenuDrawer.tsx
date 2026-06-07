"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import {
  X,
  Settings,
  FileText,
  Map,
  Shield,
  Flag,
  Mail,
  User,
  Eye,
  Download,
} from "lucide-react";
import { isAdmin, isModerator, isStaff } from "@/lib/roles";

interface MobileMenuDrawerProps {
  open: boolean;
  onClose: () => void;
  role?: string | null;
}

function MenuLink({
  href,
  icon: Icon,
  children,
  onClick,
}: {
  href: string;
  icon: typeof Settings;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-warm transition-colors hover:bg-cream"
    >
      <Icon className="h-5 w-5 text-rose" />
      {children}
    </Link>
  );
}

export default function MobileMenuDrawer({ open, onClose, role }: MobileMenuDrawerProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <button
        type="button"
        className="absolute inset-0 bg-warm/40 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Fermer le menu"
      />
      <div
        className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-3xl border-t border-rose/15 bg-white p-5 shadow-2xl"
        style={{ paddingBottom: "calc(1.25rem + env(safe-area-inset-bottom))" }}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-serif text-lg font-bold text-warm">Menu</h2>
          <button type="button" onClick={onClose} className="rounded-full p-2 text-warm-muted hover:bg-cream" aria-label="Fermer">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="space-y-1">
          {!isStaff(role) && (
            <>
              <MenuLink href="/parametres" icon={Settings} onClick={onClose}>Paramètres</MenuLink>
              <MenuLink href="/modifier-profil" icon={User} onClick={onClose}>Modifier mon profil</MenuLink>
            </>
          )}

          {isAdmin(role) && (
            <>
              <MenuLink href="/moderation" icon={Flag} onClick={onClose}>Modération</MenuLink>
              <MenuLink href="/admin/conditions" icon={FileText} onClick={onClose}>Conditions d&apos;utilisation</MenuLink>
            </>
          )}

          {isModerator(role) && !isAdmin(role) && (
            <MenuLink href="/decouvrir" icon={Eye} onClick={onClose}>Mode consultation</MenuLink>
          )}

          {isStaff(role) && (
            <MenuLink href="/visites" icon={Eye} onClick={onClose}>Visites (aperçu)</MenuLink>
          )}

          <MenuLink href="/conditions-utilisation" icon={FileText} onClick={onClose}>Conditions d&apos;utilisation</MenuLink>
          <MenuLink href="/plan-du-site" icon={Map} onClick={onClose}>Plan du site</MenuLink>

          {isStaff(role) && (
            <MenuLink href="/staff-messagerie" icon={Mail} onClick={onClose}>Messagerie interne</MenuLink>
          )}
        </nav>

        <div className="mt-4 rounded-xl border border-rose/15 bg-cream/50 p-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-warm">
            <Download className="h-4 w-4 text-rose" />
            Application mobile
          </p>
          <p className="mt-1 text-xs text-warm-muted">
            Ajoutez AfricanConnect à votre écran d&apos;accueil pour un accès rapide, comme une application native.
          </p>
        </div>

        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/" })}
          className="mt-4 w-full rounded-xl border border-rose/20 py-3 text-sm font-medium text-rose hover:bg-rose/5"
        >
          Déconnexion
        </button>
      </div>
    </div>
  );
}
