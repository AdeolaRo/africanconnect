"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import CityAutocomplete from "@/components/CityAutocomplete";
import { fetchJson } from "@/lib/fetch-json";
import { SEEKING_GENDERS } from "@/lib/orientation";
import { LOOKING_FOR_OPTIONS } from "@/lib/lifestyle";
import { Settings, Eye, EyeOff, Save } from "lucide-react";
import Link from "next/link";

interface SettingsData {
  discoverVisible: boolean;
  seekingGender: string | null;
  seekingAgeMax: number | null;
  seekingHeightMax: number | null;
  seekingLocation: string | null;
  seekingOrigin: string | null;
  seekingMaritalStatus: string | null;
  seekingProfession: string | null;
  seekingReligion: string | null;
  lookingFor: string | null;
}

const MARITAL_OPTIONS = ["Jamais marié(e)", "Divorcé(e)", "Veuf(ve)", "Peu importe"];

export default function ParametresPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [form, setForm] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/connexion");
  }, [status, router]);

  useEffect(() => {
    if (!session) return;
    fetchJson<SettingsData>("/api/settings").then(({ data }) => {
      if (data) setForm(data);
      setLoading(false);
    });
  }, [session]);

  async function save() {
    if (!form) return;
    setSaving(true);
    setSuccess(false);
    const { error } = await fetchJson("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (!error) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
  }

  if (loading || !form) {
    return <div className="flex min-h-screen items-center justify-center text-warm-muted">Chargement...</div>;
  }

  return (
    <>
      <Header user={session?.user} />
      <main className="page-container max-w-2xl">
        <div className="mb-8 flex items-center gap-3">
          <Settings className="h-7 w-7 text-rose" />
          <div>
            <h1 className="font-serif text-2xl font-bold text-warm">Paramètres</h1>
            <p className="text-sm text-warm-muted">Visibilité et critères de recherche</p>
          </div>
        </div>

        <section className="mb-6 rounded-2xl border border-rose/15 bg-white/90 p-6 shadow-sm">
          <h2 className="font-semibold text-warm">Visibilité dans Découvrir</h2>
          <p className="mt-1 text-sm text-warm-muted">
            Quand votre profil est invisible, les autres membres ne vous voient plus dans leurs recherches.
            Vous pouvez toujours parcourir Découvrir.
          </p>
          <button
            onClick={() => setForm({ ...form, discoverVisible: !form.discoverVisible })}
            className={`mt-4 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all ${
              form.discoverVisible
                ? "bg-plum/10 text-plum"
                : "border border-rose/20 text-warm-muted"
            }`}
          >
            {form.discoverVisible ? (
              <><Eye className="h-4 w-4" /> Profil visible</>
            ) : (
              <><EyeOff className="h-4 w-4" /> Profil invisible</>
            )}
          </button>
        </section>

        <section className="rounded-2xl border border-rose/15 bg-white/90 p-6 shadow-sm">
          <h2 className="font-semibold text-warm">Mes critères de recherche</h2>
          <p className="mt-1 text-sm text-warm-muted">
            Ces choix influencent les profils proposés dans Découvrir et votre score de compatibilité.
          </p>

          <div className="mt-6 space-y-4">
            <div>
              <label className="text-sm font-medium text-warm">Je cherche</label>
              <select
                value={form.seekingGender ?? ""}
                onChange={(e) => setForm({ ...form, seekingGender: e.target.value })}
                className="mt-1 w-full rounded-xl border border-rose/20 px-4 py-3 focus:border-rose focus:outline-none"
              >
                <option value="">—</option>
                {SEEKING_GENDERS.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-warm">Âge max recherché</label>
                <input
                  type="number"
                  min={18}
                  max={99}
                  value={form.seekingAgeMax ?? ""}
                  onChange={(e) => setForm({ ...form, seekingAgeMax: e.target.value ? parseInt(e.target.value, 10) : null })}
                  className="mt-1 w-full rounded-xl border border-rose/20 px-4 py-3 focus:border-rose focus:outline-none"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-warm">Taille max (cm)</label>
                <input
                  type="number"
                  min={140}
                  max={220}
                  value={form.seekingHeightMax ?? ""}
                  onChange={(e) => setForm({ ...form, seekingHeightMax: e.target.value ? parseInt(e.target.value, 10) : null })}
                  className="mt-1 w-full rounded-xl border border-rose/20 px-4 py-3 focus:border-rose focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-warm">Ville recherchée</label>
              <CityAutocomplete
                value={form.seekingLocation ?? ""}
                onChange={(v) => setForm({ ...form, seekingLocation: v })}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-warm">Origines recherchées</label>
              <input
                value={form.seekingOrigin ?? ""}
                onChange={(e) => setForm({ ...form, seekingOrigin: e.target.value })}
                placeholder="Peu importe"
                className="mt-1 w-full rounded-xl border border-rose/20 px-4 py-3 focus:border-rose focus:outline-none"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-warm">Situation recherchée</label>
              <select
                value={form.seekingMaritalStatus ?? ""}
                onChange={(e) => setForm({ ...form, seekingMaritalStatus: e.target.value })}
                className="mt-1 w-full rounded-xl border border-rose/20 px-4 py-3 focus:border-rose focus:outline-none"
              >
                <option value="">—</option>
                {MARITAL_OPTIONS.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-warm">Profession recherchée</label>
              <input
                value={form.seekingProfession ?? ""}
                onChange={(e) => setForm({ ...form, seekingProfession: e.target.value })}
                placeholder="Peu importe"
                className="mt-1 w-full rounded-xl border border-rose/20 px-4 py-3 focus:border-rose focus:outline-none"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-warm">Valeurs recherchées</label>
              <input
                value={form.seekingReligion ?? ""}
                onChange={(e) => setForm({ ...form, seekingReligion: e.target.value })}
                placeholder="Peu importe"
                className="mt-1 w-full rounded-xl border border-rose/20 px-4 py-3 focus:border-rose focus:outline-none"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-warm">Objectif de rencontre</label>
              <select
                value={form.lookingFor ?? ""}
                onChange={(e) => setForm({ ...form, lookingFor: e.target.value })}
                className="mt-1 w-full rounded-xl border border-rose/20 px-4 py-3 focus:border-rose focus:outline-none"
              >
                <option value="">—</option>
                {LOOKING_FOR_OPTIONS.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button
              onClick={save}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-full gradient-pulse px-6 py-3 font-semibold text-white shadow-md disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saving ? "Enregistrement..." : "Enregistrer"}
            </button>
            {success && <span className="text-sm text-plum">Paramètres enregistrés ✓</span>}
          </div>

          <p className="mt-6 text-sm text-warm-muted">
            Pour modifier votre profil complet (bio, photo, centres d&apos;intérêt…),{" "}
            <Link href="/modifier-profil" className="text-rose hover:underline">allez sur Modifier mon profil</Link>.
          </p>
        </section>
      </main>
    </>
  );
}
