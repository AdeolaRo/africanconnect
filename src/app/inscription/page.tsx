"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Image from "next/image";
import Header from "@/components/Header";
import Link from "next/link";
import { images } from "@/lib/images";

export default function InscriptionPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!acceptedTerms) {
      setError("Vous devez accepter les conditions d'utilisation");
      setLoading(false);
      return;
    }

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, firstName, acceptTerms: true }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Erreur d'inscription");
      setLoading(false);
      return;
    }

    const signInRes = await signIn("credentials", { email, password, redirect: false });
    if (signInRes?.error) {
      setError("Compte créé mais connexion échouée");
      setLoading(false);
      return;
    }

    router.push("/onboarding");
  }

  return (
    <>
      <Header />
      <main className="flex min-h-[calc(100vh-72px)]">
        {/* Image side */}
        <div className="relative hidden w-1/2 lg:block">
          <Image
            src={images.signup}
            alt="Nouvelle rencontre"
            fill
            className="object-cover"
            sizes="50vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-warm/70 to-transparent" />
          <div className="absolute bottom-10 left-10 right-10">
            <p className="font-serif text-2xl font-bold text-white">
              Votre prochaine belle histoire commence ici
            </p>
            <p className="mt-2 text-white/80">Gratuit, sans engagement, en 30 secondes.</p>
          </div>
        </div>

        {/* Form side */}
        <div className="flex flex-1 items-center justify-center px-4 py-12">
          <div className="w-full max-w-md">
            <h1 className="font-serif text-3xl font-bold text-warm">Inscription gratuite</h1>
            <p className="mt-2 text-warm-muted">Créez votre compte et construisez votre profil</p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              <div>
                <label className="text-sm font-medium text-warm">Prénom</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className="mt-1 w-full rounded-xl border border-rose/20 bg-white px-4 py-3 focus:border-rose focus:outline-none focus:ring-2 focus:ring-rose/20"
                  placeholder="Votre prénom"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-warm">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-1 w-full rounded-xl border border-rose/20 bg-white px-4 py-3 focus:border-rose focus:outline-none focus:ring-2 focus:ring-rose/20"
                  placeholder="vous@email.com"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-warm">Mot de passe</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="mt-1 w-full rounded-xl border border-rose/20 bg-white px-4 py-3 focus:border-rose focus:outline-none focus:ring-2 focus:ring-rose/20"
                  placeholder="6 caractères minimum"
                />
              </div>

              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-rose/15 bg-cream/50 px-4 py-3">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-rose/30 text-rose focus:ring-rose/30"
                  required
                />
                <span className="text-sm text-warm-muted">
                  J&apos;ai lu et j&apos;accepte les{" "}
                  <Link href="/conditions-utilisation" target="_blank" className="font-medium text-rose hover:underline">
                    conditions d&apos;utilisation
                  </Link>{" "}
                  d&apos;AfricanConnect.
                </span>
              </label>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <button
                type="submit"
                disabled={loading || !acceptedTerms}
                className="w-full rounded-full gradient-pulse py-3.5 font-semibold text-white shadow-md shadow-rose/30 hover:shadow-lg disabled:opacity-50 transition-all"
              >
                {loading ? "Création..." : "Créer mon compte — Gratuit"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-warm-muted">
              Déjà inscrit ?{" "}
              <Link href="/connexion" className="font-medium text-rose hover:underline">
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
