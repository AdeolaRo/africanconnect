"use client";

import { useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Header from "@/components/Header";
import Link from "next/link";
import { images } from "@/lib/images";
import { staffHomePath } from "@/lib/roles";

export default function ConnexionPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await signIn("credentials", { email, password, redirect: false });
    if (res?.error) {
      setError("Email ou mot de passe incorrect");
      setLoading(false);
      return;
    }

    const freshSession = await getSession();
    const staffPath = staffHomePath(freshSession?.user?.role);
    if (staffPath) {
      router.push(staffPath);
      return;
    }
    router.push(freshSession?.user?.profileCompleted ? "/decouvrir" : "/mon-cv");
  }

  return (
    <>
      <Header />
      <main className="flex min-h-[calc(100vh-72px)]">
        <div className="relative hidden w-1/2 lg:block">
          <Image src={images.connection} alt="Connexion" fill className="object-cover" sizes="50vw" />
          <div className="absolute inset-0 bg-gradient-to-t from-warm/60 to-transparent" />
        </div>

        <div className="flex flex-1 items-center justify-center px-4 py-12">
          <div className="w-full max-w-md rounded-2xl border border-rose/15 bg-white p-8 shadow-lg">
            <h1 className="font-serif text-3xl font-bold text-warm">Bon retour !</h1>
            <p className="mt-2 text-warm-muted">Connectez-vous pour retrouver vos matchs</p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              <div>
                <label className="text-sm font-medium text-warm">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-1 w-full rounded-xl border border-rose/20 px-4 py-3 focus:border-rose focus:outline-none focus:ring-2 focus:ring-rose/20"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-warm">Mot de passe</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="mt-1 w-full rounded-xl border border-rose/20 px-4 py-3 focus:border-rose focus:outline-none focus:ring-2 focus:ring-rose/20"
                />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-warm py-3.5 font-semibold text-cream hover:bg-warm/90 disabled:opacity-50 transition-colors"
              >
                {loading ? "Connexion..." : "Se connecter"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-warm-muted">
              Pas encore de compte ?{" "}
              <Link href="/inscription" className="font-medium text-rose hover:underline">
                S&apos;inscrire gratuitement
              </Link>
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
