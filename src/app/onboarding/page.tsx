"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Header from "@/components/Header";
import CityAutocomplete from "@/components/CityAutocomplete";
import InterestPicker from "@/components/InterestPicker";
import { getOnboardingSteps } from "@/lib/questions";

export default function OnboardingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const steps = getOnboardingSteps();

  const [stepIndex, setStepIndex] = useState(0);
  const [formData, setFormData] = useState<Record<string, string | string[]>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/connexion");
  }, [status, router]);

  const currentStep = steps[stepIndex];
  const progress = Math.round(((stepIndex + 1) / steps.length) * 100);

  function updateField(name: string, value: string | string[]) {
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function toggleMulti(name: string, value: string, max: number) {
    const current = (formData[name] as string[]) || [];
    if (current.includes(value)) {
      updateField(name, current.filter((x) => x !== value));
    } else if (current.length < max) {
      updateField(name, [...current, value]);
    }
  }

  async function handleFinish() {
    setLoading(true);
    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    if (res.ok) router.push("/mon-cv");
    setLoading(false);
  }

  function handleNext() {
    if (stepIndex < steps.length - 1) {
      setStepIndex(stepIndex + 1);
    } else {
      handleFinish();
    }
  }

  if (status === "loading") {
    return <div className="flex min-h-screen items-center justify-center text-warm-muted">Chargement...</div>;
  }

  return (
    <>
      <Header user={session?.user} />
      <main className="page-container max-w-xl">
        <div className="mb-8">
          <div className="flex justify-between text-sm text-warm-muted">
            <span>Étape {stepIndex + 1} / {steps.length}</span>
            <span>{progress}%</span>
          </div>
          <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-rose/15">
            <div className="h-full rounded-full gradient-pulse transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="rounded-2xl border border-rose/15 bg-white p-8 shadow-lg">
          <h1 className="font-serif text-2xl font-bold text-warm">{currentStep.title}</h1>
          <p className="mt-1 text-sm text-warm-muted">Construisez un profil qui vous ressemble</p>

          <div className="mt-6 space-y-4">
            {currentStep.fields.map((field) => (
              <div key={field.name}>
                <label className="text-sm font-medium text-warm">
                  {field.label}
                  {field.required && <span className="text-rose"> *</span>}
                </label>

                {field.type === "city" && (
                  <div className="mt-1">
                    <CityAutocomplete
                      value={(formData[field.name] as string) || ""}
                      onChange={(v) => updateField(field.name, v)}
                      placeholder={field.placeholder}
                      required={field.required}
                    />
                  </div>
                )}

                {field.type === "select" && (
                  <select
                    value={(formData[field.name] as string) || ""}
                    onChange={(e) => updateField(field.name, e.target.value)}
                    className="mt-1 w-full rounded-xl border border-rose/20 px-4 py-3 focus:border-rose focus:outline-none"
                  >
                    <option value="">Choisir...</option>
                    {field.options?.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                )}

                {field.type === "textarea" && (
                  <textarea
                    value={(formData[field.name] as string) || ""}
                    onChange={(e) => updateField(field.name, e.target.value)}
                    rows={3}
                    placeholder={field.placeholder}
                    className="mt-1 w-full rounded-xl border border-rose/20 px-4 py-3 focus:border-rose focus:outline-none"
                  />
                )}

                {field.type === "interests" && (
                  <div className="mt-2">
                    <InterestPicker
                      selected={(formData.interests as string[]) || []}
                      onChange={(v) => updateField("interests", v)}
                    />
                  </div>
                )}

                {field.type === "multiselect" && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {field.options?.map((o) => {
                      const selected = ((formData[field.name] as string[]) || []).includes(o);
                      return (
                        <button
                          key={o}
                          type="button"
                          onClick={() => toggleMulti(field.name, o, 3)}
                          className={`rounded-full border px-4 py-2 text-sm transition-all ${
                            selected
                              ? "gradient-pulse text-white shadow-sm border-transparent"
                              : "border-rose/20 text-warm-muted hover:border-rose hover:text-warm"
                          }`}
                        >
                          {o}
                        </button>
                      );
                    })}
                  </div>
                )}

                {(field.type === "text" || field.type === "number") && (
                  <input
                    type={field.type}
                    value={(formData[field.name] as string) || ""}
                    onChange={(e) => updateField(field.name, e.target.value)}
                    placeholder={field.placeholder}
                    className="mt-1 w-full rounded-xl border border-rose/20 px-4 py-3 focus:border-rose focus:outline-none"
                  />
                )}
              </div>
            ))}
          </div>

          {error && (
            <p className="mt-4 rounded-xl bg-rose/10 px-4 py-3 text-sm text-rose">{error}</p>
          )}

          <div className="mt-8 flex gap-3">
            {stepIndex > 0 && (
              <button
                type="button"
                onClick={() => setStepIndex(stepIndex - 1)}
                className="flex-1 rounded-full border border-rose/20 py-3 text-warm hover:bg-cream-dark transition-colors"
              >
                Retour
              </button>
            )}
            <button
              type="button"
              onClick={handleNext}
              disabled={loading}
              className="flex-1 rounded-full gradient-pulse py-3 font-semibold text-white shadow-md disabled:opacity-50 transition-all"
            >
              {loading ? "Enregistrement..." : stepIndex < steps.length - 1 ? "Continuer" : "Créer mon profil ✨"}
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
