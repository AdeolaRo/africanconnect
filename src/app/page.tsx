import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import BrandBadge from "@/components/BrandBadge";
import FeatureCard from "@/components/FeatureCard";
import StepIndicator from "@/components/StepIndicator";
import { Shield, Sparkles, Users, ArrowRight } from "lucide-react";
import { images } from "@/lib/images";

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0">
            <Image src={images.hero} alt="Couple heureux" fill className="object-cover" priority sizes="100vw" />
            <div className="absolute inset-0 bg-gradient-to-r from-plum/90 via-wine/80 to-rose/60" />
          </div>

          <div className="relative mx-auto max-w-6xl px-4 py-24 md:py-32">
            <div className="max-w-2xl">
              <div className="flex flex-wrap items-center gap-3">
                <BrandBadge size="md" />
                <span className="inline-block rounded-full bg-white/20 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
                  100% gratuit — Toutes orientations respectées
                </span>
              </div>
              <h1 className="mt-6 font-serif text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl">
                La rencontre qui vous correspond, vraiment
              </h1>
              <p className="mt-6 text-lg leading-relaxed text-white/90">
                Profil d&apos;abord, photo après le match. Un parcours par étapes
                pour des rencontres sincères et en confiance.
              </p>
              <div className="mt-10 flex flex-wrap gap-4">
                <Link
                  href="/inscription"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 font-semibold text-rose shadow-xl hover:bg-cream transition-all glow-rose"
                >
                  Créer mon profil gratuit
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/connexion"
                  className="rounded-full border border-white/50 px-8 py-3.5 font-semibold text-white backdrop-blur-sm hover:bg-white/10 transition-colors"
                >
                  Se connecter
                </Link>
              </div>
            </div>
          </div>

          <div className="relative mx-auto -mt-6 max-w-3xl px-4 pb-10">
            <StepIndicator currentStep={1} />
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-20">
          <div className="text-center">
            <h2 className="font-serif text-3xl font-bold text-warm">Comment ça marche ?</h2>
            <p className="mt-3 text-warm-muted">Simple, discret, efficace</p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <FeatureCard
              icon={Sparkles}
              title="Profil auto-généré"
              description="Un questionnaire guidé crée un profil complet. Votre ville, vos valeurs, vos attentes — tout est clair dès le départ."
              image={images.friends}
            />
            <FeatureCard
              icon={Users}
              title="Matching intelligent"
              description="Compatibilité en % selon vos critères et orientations. Vous ne contactez que les profils qui vous correspondent."
              image={images.connection}
            />
            <FeatureCard
              icon={Shield}
              title="Parcours en 3 étapes"
              description="1) Profil sans photo  2) Intérêt mutuel  3) Photo révélée + messages. Pas de chat ouvert à tous."
              image={images.couple}
            />
          </div>
        </section>

        <section className="bg-gradient-to-br from-cream via-cream-dark to-rose/5 px-4 py-16">
          <div className="mx-auto flex max-w-5xl flex-col items-center gap-8 md:flex-row">
            <div className="relative h-64 w-full overflow-hidden rounded-3xl shadow-xl md:w-80 shrink-0">
              <Image src={images.couple} alt="Belle rencontre" fill className="object-cover" sizes="320px" />
            </div>
            <div>
              <h2 className="font-serif text-2xl font-bold text-warm md:text-3xl">
                Ouvert à toutes et à tous
              </h2>
              <p className="mt-4 leading-relaxed text-warm-muted">
                Femmes, hommes, non-binaires — toutes les orientations sont respectées.
                AfricanConnect met en avant vos valeurs et votre compatibilité réelle,
                pas juste une photo.
              </p>
              <Link href="/inscription" className="mt-6 inline-flex items-center gap-2 font-semibold text-rose hover:underline">
                Rejoindre la communauté <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        <section className="gradient-pulse px-4 py-20">
          <div className="relative mx-auto max-w-2xl text-center">
            <h2 className="font-serif text-3xl font-bold text-white">
              Prêt(e) à faire une vraie rencontre ?
            </h2>
            <p className="mt-4 text-white/90">
              Gratuit, discret, sincère — pour les gens qui veulent du vrai.
            </p>
            <Link
              href="/inscription"
              className="mt-8 inline-block rounded-full bg-white px-10 py-3.5 font-semibold text-rose shadow-xl hover:bg-cream transition-colors"
            >
              Créer mon compte gratuit
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-rose/15 bg-white py-8 text-center text-sm text-warm-muted">
        © {new Date().getFullYear()} AfricanConnect — africanconnect.online
      </footer>
    </>
  );
}
