import Link from "next/link";
import BrandBadge from "@/components/BrandBadge";

export default function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-rose/15 bg-white/90 py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 md:flex-row md:items-start md:justify-between">
        <div>
          <BrandBadge size="sm" showLabel />
          <p className="mt-3 max-w-xs text-sm text-warm-muted">
            Rencontres sérieuses et sincères — 100 % gratuit au lancement.
          </p>
        </div>

        <nav className="grid grid-cols-2 gap-x-10 gap-y-2 text-sm sm:grid-cols-3">
          <div>
            <p className="mb-2 font-semibold text-warm">Découvrir</p>
            <ul className="space-y-1.5 text-warm-muted">
              <li><Link href="/" className="hover:text-rose">Accueil</Link></li>
              <li><Link href="/inscription" className="hover:text-rose">Inscription</Link></li>
              <li><Link href="/connexion" className="hover:text-rose">Connexion</Link></li>
            </ul>
          </div>
          <div>
            <p className="mb-2 font-semibold text-warm">Légal</p>
            <ul className="space-y-1.5 text-warm-muted">
              <li><Link href="/conditions-utilisation" className="hover:text-rose">Conditions d&apos;utilisation</Link></li>
              <li><Link href="/plan-du-site" className="hover:text-rose">Plan du site</Link></li>
            </ul>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <p className="mb-2 font-semibold text-warm">Contact</p>
            <p className="text-warm-muted">contact@africanconnect.online</p>
            <p className="mt-1 text-warm-muted">africanconnect.online</p>
          </div>
        </nav>
      </div>
      <div className="mx-auto mt-8 flex max-w-6xl flex-wrap items-center justify-center gap-2 px-4 text-xs text-warm-muted">
        <BrandBadge size="sm" />
        <span>© 2026 — Adeola &amp; Enguequeen</span>
      </div>
    </footer>
  );
}
