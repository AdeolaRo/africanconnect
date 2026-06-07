import Link from "next/link";
import Header from "@/components/Header";
import { pageMetadata } from "@/lib/seo";
import { Map } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = pageMetadata({
  title: "Plan du site",
  description: "Plan du site AfricanConnect : accès à toutes les pages publiques, inscription, connexion et informations légales.",
  path: "/plan-du-site",
});

const publicLinks = [
  { href: "/", label: "Accueil" },
  { href: "/inscription", label: "Inscription" },
  { href: "/connexion", label: "Connexion" },
  { href: "/conditions-utilisation", label: "Conditions d'utilisation" },
  { href: "/plan-du-site", label: "Plan du site" },
];

export default function PlanDuSitePage() {
  return (
    <>
      <Header />
      <main className="page-container max-w-4xl flex-1">
        <div className="mb-6 flex items-center gap-3">
          <Map className="h-6 w-6 text-rose" />
          <h1 className="font-serif text-2xl font-bold text-warm">Plan du site</h1>
        </div>

        <nav
          aria-label="Pages publiques"
          className="flex flex-wrap items-center gap-x-1 gap-y-2 rounded-xl border border-rose/15 bg-white/90 px-4 py-3 text-sm shadow-sm"
        >
          {publicLinks.map((link, i) => (
            <span key={link.href} className="inline-flex items-center">
              {i > 0 && <span className="mx-2 text-rose/40" aria-hidden>|</span>}
              <Link href={link.href} className="font-medium text-rose hover:underline">
                {link.label}
              </Link>
            </span>
          ))}
        </nav>
      </main>
    </>
  );
}
