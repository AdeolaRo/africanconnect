"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import CityAutocomplete from "@/components/CityAutocomplete";
import PhotoManager from "@/components/PhotoManager";
import InterestPicker from "@/components/InterestPicker";
import Link from "next/link";
import { parseInterests } from "@/lib/interests";
import { CHILDREN_OPTIONS, HABIT_OPTIONS, LOOKING_FOR_OPTIONS } from "@/lib/lifestyle";
import { GENDERS, SEEKING_GENDERS } from "@/lib/orientation";

interface Photo {
  id: string;
  url: string;
  order: number;
}

interface ProfileData {
  gender: string;
  seekingGender: string;
  age: string;
  height: string;
  location: string;
  origin: string;
  maritalStatus: string;
  profession: string;
  religion: string;
  bio: string;
  seekingAgeMax: string;
  seekingHeightMax: string;
  seekingLocation: string;
  seekingOrigin: string;
  seekingMaritalStatus: string;
  seekingProfession: string;
  seekingReligion: string;
  qualities: string[];
  interests: string[];
  profileTitle: string;
  lookingFor: string;
  children: string;
  alcohol: string;
  smoking: string;
  pets: string;
  secretQuestion: string;
  secretAnswer: string;
}

const QUALITY_OPTIONS = [
  "À l'écoute", "Drôle", "Bienveillant(e)", "Sportif(ve)", "Cultivé(e)",
  "Familial(e)", "Ambitieux(se)", "Patient(e)", "Fidèle", "Spontané(e)",
];

const MARITAL_OPTIONS = ["Jamais marié(e)", "Divorcé(e)", "Veuf(ve)"];
const SEEKING_MARITAL = [...MARITAL_OPTIONS, "Peu importe"];

function parseQualities(raw: string | null): string[] {
  if (!raw) return [];
  try {
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

export default function ModifierProfilPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [form, setForm] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/connexion");
  }, [status, router]);

  useEffect(() => {
    if (session) {
      Promise.all([
        fetch("/api/profile").then((r) => r.json()),
        fetch("/api/profile/photos").then((r) => r.json()),
      ]).then(([profile, photoList]) => {
        if (!profile || profile.error) {
          router.push("/onboarding");
          return;
        }
        setPhotos(Array.isArray(photoList) ? photoList : []);
        setForm({
          gender: profile.gender || "",
          seekingGender: profile.seekingGender || "",
          age: profile.age?.toString() || "",
          height: profile.height?.toString() || "",
          location: profile.location || "",
          origin: profile.origin || "",
          maritalStatus: profile.maritalStatus || "",
          profession: profile.profession || "",
          religion: profile.religion || "",
          bio: profile.bio || "",
          seekingAgeMax: profile.seekingAgeMax?.toString() || "",
          seekingHeightMax: profile.seekingHeightMax?.toString() || "",
          seekingLocation: profile.seekingLocation || "",
          seekingOrigin: profile.seekingOrigin || "",
          seekingMaritalStatus: profile.seekingMaritalStatus || "",
          seekingProfession: profile.seekingProfession || "",
          seekingReligion: profile.seekingReligion || "",
          qualities: parseQualities(profile.qualities),
          interests: parseInterests(profile.interests),
          profileTitle: profile.profileTitle || "",
          lookingFor: profile.lookingFor || "",
          children: profile.children || "",
          alcohol: profile.alcohol || "",
          smoking: profile.smoking || "",
          pets: profile.pets || "",
          secretQuestion: profile.secretQuestion || "",
          secretAnswer: "",
        });
        setLoading(false);
      });
    }
  }, [session, router]);

  function update(field: keyof ProfileData, value: string | string[]) {
    if (!form) return;
    setForm({ ...form, [field]: value });
    setSuccess(false);
  }

  function toggleQuality(q: string) {
    if (!form) return;
    const current = form.qualities;
    if (current.includes(q)) {
      update("qualities", current.filter((x) => x !== q));
    } else if (current.length < 3) {
      update("qualities", [...current, q]);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    setError("");
    setSaving(true);
    setSuccess(false);

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => router.push("/mon-cv"), 1200);
      } else {
        setError(data.error || "Erreur de sauvegarde");
      }
    } catch {
      setError("Erreur réseau");
    } finally {
      setSaving(false);
    }
  }

  if (loading || !form) {
    return <div className="flex min-h-screen items-center justify-center text-warm-muted">Chargement...</div>;
  }

  const inputClass =
    "mt-1 w-full rounded-xl border border-rose/20 bg-white px-4 py-3 focus:border-rose focus:outline-none focus:ring-2 focus:ring-rose/20";

  return (
    <>
      <Header user={session?.user} />
      <main className="mx-auto max-w-2xl px-4 py-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-serif text-2xl font-bold text-warm">Modifier mon profil</h1>
            <p className="mt-1 text-sm text-warm-muted">Tous les champs sont modifiables</p>
          </div>
          <Link href="/mon-cv" className="text-sm text-rose hover:underline">
            Annuler
          </Link>
        </div>

        <form onSubmit={handleSave} className="space-y-8">
          {/* Photos */}
          <section className="rounded-2xl border border-rose/15 bg-white p-6 shadow-sm">
            <PhotoManager photos={photos} onChange={setPhotos} />
          </section>

          {/* Orientation */}
          <section className="rounded-2xl border border-rose/15 bg-white p-6 shadow-sm">
            <h2 className="font-serif text-lg font-bold text-warm">Orientation</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-warm">Je suis</label>
                <select
                  value={form.gender}
                  onChange={(e) => update("gender", e.target.value)}
                  required
                  className={inputClass}
                >
                  <option value="">Choisir...</option>
                  {GENDERS.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-warm">Je recherche</label>
                <select
                  value={form.seekingGender}
                  onChange={(e) => update("seekingGender", e.target.value)}
                  required
                  className={inputClass}
                >
                  <option value="">Choisir...</option>
                  {SEEKING_GENDERS.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* Infos personnelles */}
          <section className="rounded-2xl border border-rose/15 bg-white p-6 shadow-sm">
            <h2 className="font-serif text-lg font-bold text-warm">Informations personnelles</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-warm">Âge</label>
                <input
                  type="number"
                  value={form.age}
                  onChange={(e) => update("age", e.target.value)}
                  required
                  min={18}
                  max={99}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-warm">Taille (cm)</label>
                <input
                  type="number"
                  value={form.height}
                  onChange={(e) => update("height", e.target.value)}
                  min={100}
                  max={250}
                  className={inputClass}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm font-medium text-warm">Ville</label>
                <CityAutocomplete
                  value={form.location}
                  onChange={(v) => update("location", v)}
                  placeholder="Tapez votre ville..."
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-warm">Origines</label>
                <input
                  type="text"
                  value={form.origin}
                  onChange={(e) => update("origin", e.target.value)}
                  placeholder="Française, Sénégalaise..."
                  className={inputClass}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-warm">Situation</label>
                <select
                  value={form.maritalStatus}
                  onChange={(e) => update("maritalStatus", e.target.value)}
                  required
                  className={inputClass}
                >
                  <option value="">Choisir...</option>
                  {MARITAL_OPTIONS.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm font-medium text-warm">Profession</label>
                <input
                  type="text"
                  value={form.profession}
                  onChange={(e) => update("profession", e.target.value)}
                  placeholder="Votre profession"
                  className={inputClass}
                />
              </div>
            </div>
          </section>

          {/* Titre & objectif */}
          <section className="rounded-2xl border border-rose/15 bg-white p-6 shadow-sm">
            <h2 className="font-serif text-lg font-bold text-warm">Titre & objectif</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="text-sm font-medium text-warm">Titre accrocheur</label>
                <input
                  type="text"
                  value={form.profileTitle}
                  onChange={(e) => update("profileTitle", e.target.value)}
                  placeholder="Ex : Architecte passionnée de voyages"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-warm">Je recherche</label>
                <select value={form.lookingFor} onChange={(e) => update("lookingFor", e.target.value)} className={inputClass}>
                  <option value="">Choisir...</option>
                  {LOOKING_FOR_OPTIONS.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* Valeurs & introduction */}
          <section className="rounded-2xl border border-rose/15 bg-white p-6 shadow-sm">
            <h2 className="font-serif text-lg font-bold text-warm">Valeurs & introduction</h2>
            <div className="mt-4 space-y-4">
              <div>
                <label className="text-sm font-medium text-warm">Valeurs</label>
                <textarea
                  value={form.religion}
                  onChange={(e) => update("religion", e.target.value)}
                  rows={3}
                  placeholder="Ce qui compte pour vous : respect, sincérité..."
                  className={inputClass}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-warm">Introduction / Description</label>
                <textarea
                  value={form.bio}
                  onChange={(e) => update("bio", e.target.value)}
                  rows={4}
                  placeholder="Présentez-vous en quelques mots..."
                  className={inputClass}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-warm">Qualités (3 max)</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {QUALITY_OPTIONS.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => toggleQuality(q)}
                      className={`rounded-full border px-4 py-2 text-sm transition-all ${
                        form.qualities.includes(q)
                          ? "gradient-pulse border-transparent text-white"
                          : "border-rose/20 text-warm-muted hover:border-rose"
                      }`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-rose/15 bg-white p-6 shadow-sm">
            <h2 className="font-serif text-lg font-bold text-warm">Style de vie</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-warm">Enfants</label>
                <select value={form.children} onChange={(e) => update("children", e.target.value)} className={inputClass}>
                  <option value="">Choisir...</option>
                  {CHILDREN_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-warm">Alcool</label>
                <select value={form.alcohol} onChange={(e) => update("alcohol", e.target.value)} className={inputClass}>
                  <option value="">Choisir...</option>
                  {HABIT_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-warm">Tabac</label>
                <select value={form.smoking} onChange={(e) => update("smoking", e.target.value)} className={inputClass}>
                  <option value="">Choisir...</option>
                  {HABIT_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-warm">Animaux</label>
                <input type="text" value={form.pets} onChange={(e) => update("pets", e.target.value)} placeholder="Chat, chien..." className={inputClass} />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-rose/15 bg-white p-6 shadow-sm">
            <h2 className="font-serif text-lg font-bold text-warm">Confiance — question secrète</h2>
            <p className="mt-1 text-sm text-warm-muted">
              Après un match, validez une rencontre réelle en répondant à la question secrète de l&apos;autre personne.
            </p>
            <div className="mt-4 space-y-4">
              <div>
                <label className="text-sm font-medium text-warm">Votre question secrète</label>
                <input
                  type="text"
                  value={form.secretQuestion}
                  onChange={(e) => update("secretQuestion", e.target.value)}
                  placeholder="Ex : Quel est le nom de mon restaurant préféré ?"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-warm">Réponse secrète</label>
                <input
                  type="text"
                  value={form.secretAnswer}
                  onChange={(e) => update("secretAnswer", e.target.value)}
                  placeholder="Laissez vide pour conserver l'actuelle"
                  className={inputClass}
                />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-rose/15 bg-white p-6 shadow-sm">
            <h2 className="font-serif text-lg font-bold text-warm">Centres d&apos;intérêt</h2>
            <div className="mt-4">
              <InterestPicker
                selected={form.interests}
                onChange={(v) => update("interests", v)}
              />
            </div>
          </section>

          {/* Ce que je recherche */}
          <section className="rounded-2xl border border-rose/15 bg-white p-6 shadow-sm">
            <h2 className="font-serif text-lg font-bold text-warm">Ce que je recherche</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-warm">Âge maximum</label>
                <input
                  type="number"
                  value={form.seekingAgeMax}
                  onChange={(e) => update("seekingAgeMax", e.target.value)}
                  required
                  className={inputClass}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-warm">Taille max (cm)</label>
                <input
                  type="number"
                  value={form.seekingHeightMax}
                  onChange={(e) => update("seekingHeightMax", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm font-medium text-warm">Ville souhaitée</label>
                <CityAutocomplete
                  value={form.seekingLocation}
                  onChange={(v) => update("seekingLocation", v)}
                  placeholder="Ville ou région..."
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium text-warm">Origines souhaitées</label>
                <input
                  type="text"
                  value={form.seekingOrigin}
                  onChange={(e) => update("seekingOrigin", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-warm">Situation souhaitée</label>
                <select
                  value={form.seekingMaritalStatus}
                  onChange={(e) => update("seekingMaritalStatus", e.target.value)}
                  className={inputClass}
                >
                  <option value="">Choisir...</option>
                  {SEEKING_MARITAL.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm font-medium text-warm">Profession souhaitée</label>
                <input
                  type="text"
                  value={form.seekingProfession}
                  onChange={(e) => update("seekingProfession", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-sm font-medium text-warm">Valeurs recherchées</label>
                <textarea
                  value={form.seekingReligion}
                  onChange={(e) => update("seekingReligion", e.target.value)}
                  rows={3}
                  className={inputClass}
                />
              </div>
            </div>
          </section>

          {error && (
            <p className="rounded-xl bg-rose/10 px-4 py-3 text-sm text-rose">{error}</p>
          )}
          {success && (
            <p className="rounded-xl bg-plum/10 px-4 py-3 text-sm text-plum">
              Profil enregistré ! Redirection...
            </p>
          )}

          <div className="flex gap-3">
            <Link
              href="/mon-cv"
              className="flex-1 rounded-full border border-rose/20 py-3.5 text-center text-warm hover:bg-cream-dark"
            >
              Annuler
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-full gradient-pulse py-3.5 font-semibold text-white shadow-md disabled:opacity-50"
            >
              {saving ? "Enregistrement..." : "Enregistrer les modifications"}
            </button>
          </div>
        </form>
      </main>
    </>
  );
}
