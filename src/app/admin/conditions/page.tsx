"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import StaffPageNav from "@/components/StaffPageNav";
import { fetchJson } from "@/lib/fetch-json";
import { isAdmin } from "@/lib/roles";
import {
  parseTermsContent,
  serializeTermsContent,
  type TermsSection,
} from "@/lib/terms-sections";
import { FileText, Save, ArrowLeft, Plus, Trash2, Eye } from "lucide-react";

export default function AdminConditionsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [preamble, setPreamble] = useState("");
  const [sections, setSections] = useState<TermsSection[]>([]);
  const [version, setVersion] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/connexion");
    if (status === "authenticated" && !isAdmin(session?.user?.role)) router.push("/decouvrir");
  }, [status, session, router]);

  useEffect(() => {
    if (!isAdmin(session?.user?.role)) return;

    setLoading(true);
    setLoadError("");
    fetchJson<{ title: string; content: string; version: number }>("/api/admin/terms").then(
      ({ data, error }) => {
        setLoading(false);
        if (error || !data) {
          setLoadError(error || "Impossible de charger les conditions");
          return;
        }
        setTitle(data.title);
        setVersion(data.version);
        const parsed = parseTermsContent(data.content);
        setPreamble(parsed.preamble);
        setSections(parsed.sections);
      }
    );
  }, [session]);

  function updateSection(id: string, field: "heading" | "body", value: string) {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  }

  function addSection() {
    const n = sections.length + 1;
    setSections((prev) => [
      ...prev,
      { id: `new-${Date.now()}`, heading: `${n}. Nouvelle section`, body: "" },
    ]);
  }

  function removeSection(id: string) {
    setSections((prev) => prev.filter((s) => s.id !== id));
  }

  const fullContent = serializeTermsContent(preamble, sections);

  async function save() {
    setSaving(true);
    setSuccess(false);
    const { data, error } = await fetchJson<{ version: number }>("/api/admin/terms", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content: fullContent }),
    });
    setSaving(false);
    if (error) {
      setLoadError(error);
      return;
    }
    if (data) {
      setVersion(data.version);
      setSuccess(true);
      setLoadError("");
      setTimeout(() => setSuccess(false), 3000);
    }
  }

  if (status === "loading" || (loading && isAdmin(session?.user?.role))) {
    return (
      <div className="flex min-h-screen items-center justify-center text-warm-muted">
        Chargement des conditions…
      </div>
    );
  }

  return (
    <>
      <Header user={session?.user} />
      <main className="page-container max-w-4xl">
        <StaffPageNav backHref="/admin" backLabel="Retour admin" role={session?.user?.role} />

        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <FileText className="h-7 w-7 text-plum" />
            <div>
              <h1 className="font-serif text-2xl font-bold text-warm">Modifier les CGU</h1>
              <p className="text-sm text-warm-muted">
                Version {version} — modifiez section par section
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowPreview((v) => !v)}
            className="inline-flex items-center gap-2 rounded-full border border-rose/20 px-4 py-2 text-sm text-warm hover:bg-cream/80"
          >
            <Eye className="h-4 w-4" />
            {showPreview ? "Masquer l'aperçu" : "Aperçu public"}
          </button>
        </div>

        {loadError && (
          <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {loadError}
          </p>
        )}

        <div className="space-y-6">
          <div className="rounded-2xl border border-rose/15 bg-white/90 p-6 shadow-sm">
            <label className="text-sm font-medium text-warm">Titre de la page</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full rounded-xl border border-rose/20 px-4 py-3 focus:border-rose focus:outline-none"
            />
          </div>

          <div className="rounded-2xl border border-rose/15 bg-white/90 p-6 shadow-sm">
            <label className="text-sm font-medium text-warm">En-tête (avant les sections numérotées)</label>
            <textarea
              value={preamble}
              onChange={(e) => setPreamble(e.target.value)}
              rows={4}
              placeholder="Titre du document, date de mise à jour, etc."
              className="mt-1 w-full rounded-xl border border-rose/20 px-4 py-3 text-sm leading-relaxed focus:border-rose focus:outline-none"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-lg font-bold text-warm">
                Sections ({sections.length})
              </h2>
              <button
                type="button"
                onClick={addSection}
                className="inline-flex items-center gap-1.5 rounded-full bg-plum/10 px-4 py-2 text-sm font-medium text-plum hover:bg-plum/20"
              >
                <Plus className="h-4 w-4" /> Ajouter une section
              </button>
            </div>

            {sections.map((section, index) => (
              <div
                key={section.id}
                className="rounded-2xl border border-rose/15 bg-white/90 p-5 shadow-sm"
              >
                <div className="mb-3 flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-warm-muted">
                    Section {index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeSection(section.id)}
                    className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                    title="Supprimer cette section"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Supprimer
                  </button>
                </div>
                <input
                  value={section.heading}
                  onChange={(e) => updateSection(section.id, "heading", e.target.value)}
                  placeholder="Ex. 1. OBJET DU SERVICE"
                  className="mb-2 w-full rounded-xl border border-rose/20 px-4 py-2.5 text-sm font-semibold focus:border-rose focus:outline-none"
                />
                <textarea
                  value={section.body}
                  onChange={(e) => updateSection(section.id, "body", e.target.value)}
                  rows={5}
                  placeholder="Contenu de la section…"
                  className="w-full rounded-xl border border-rose/20 px-4 py-3 text-sm leading-relaxed focus:border-rose focus:outline-none"
                />
              </div>
            ))}
          </div>

          {showPreview && (
            <div className="rounded-2xl border border-plum/20 bg-cream/50 p-6">
              <h3 className="mb-3 font-serif text-lg font-bold text-warm">Aperçu</h3>
              <div className="whitespace-pre-wrap text-sm leading-relaxed text-warm-muted">
                {fullContent}
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={save}
              disabled={saving || sections.length === 0}
              className="inline-flex items-center gap-2 rounded-full gradient-pulse px-6 py-3 font-semibold text-white disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saving ? "Enregistrement..." : "Publier la nouvelle version"}
            </button>
            {success && <span className="text-sm text-plum">Conditions mises à jour ✓</span>}
            <Link href="/conditions-utilisation" className="text-sm text-rose hover:underline">
              Voir la page publique →
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
