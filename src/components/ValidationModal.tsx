"use client";

import { useEffect, useState } from "react";
import { X, ShieldCheck } from "lucide-react";
import { BEHAVIORAL_BADGES, MAX_BADGES } from "@/lib/trust";
import { fetchJson } from "@/lib/fetch-json";

interface ValidationModalProps {
  partnerId: string;
  partnerName: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ValidationModal({
  partnerId,
  partnerName,
  onClose,
  onSuccess,
}: ValidationModalProps) {
  const [step, setStep] = useState(1);
  const [secretQuestion, setSecretQuestion] = useState("");
  const [secretAnswer, setSecretAnswer] = useState("");
  const [selectedBadges, setSelectedBadges] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      const { data, error: err } = await fetchJson<{ secretQuestion: string }>(
        `/api/encounters/${partnerId}/secret-question`
      );
      if (data?.secretQuestion) setSecretQuestion(data.secretQuestion);
      else setError(err || "Question secrète indisponible");
    }
    load();
  }, [partnerId]);

  function toggleBadge(badge: string) {
    setSelectedBadges((prev) =>
      prev.includes(badge)
        ? prev.filter((b) => b !== badge)
        : prev.length < MAX_BADGES
          ? [...prev, badge]
          : prev
    );
  }

  async function submit(hasMet: boolean) {
    setLoading(true);
    setError("");
    const { data, error: err } = await fetchJson<{
      secretCorrect?: boolean;
      bothVerified?: boolean;
      trustAwarded?: number;
    }>("/api/encounters/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        partnerId,
        hasMet,
        secretAnswer: hasMet ? secretAnswer : "",
        badges: hasMet ? selectedBadges : [],
      }),
    });

    if (err) {
      setError(err);
      setLoading(false);
      return;
    }

    if (hasMet && data && !data.secretCorrect) {
      setError("Réponse secrète incorrecte — la rencontre n'a pas pu être vérifiée.");
      setLoading(false);
      return;
    }

    onSuccess?.();
    onClose();
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-warm/40 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-rose/15 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-rose/10 px-6 py-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-plum" />
            <h2 className="font-serif text-lg font-bold text-warm">
              Valider la rencontre avec {partnerName}
            </h2>
          </div>
          <button onClick={onClose} className="rounded-full p-1 text-warm-muted hover:bg-cream">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 p-6">
          <p className="text-sm text-warm-muted">
            Preuve de rencontre réelle — inspiré du système de confiance Sentimental, perfectionné pour AfricanConnect.
          </p>

          {error && <p className="rounded-xl bg-rose/10 px-4 py-2 text-sm text-rose">{error}</p>}

          {step === 1 && (
            <div>
              <h3 className="font-semibold text-warm">Étape 1 — Avez-vous rencontré cette personne ?</h3>
              <div className="mt-4 flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  disabled={!secretQuestion}
                  className="flex-1 rounded-full gradient-pulse py-3 font-medium text-white disabled:opacity-50"
                >
                  Oui, en vrai
                </button>
                <button
                  onClick={() => submit(false)}
                  disabled={loading}
                  className="flex-1 rounded-full border border-rose/20 py-3 text-warm hover:bg-cream"
                >
                  Non
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h3 className="font-semibold text-warm">Étape 2 — Question secrète</h3>
              <p className="mt-2 text-sm text-warm-muted">
                <strong>Question :</strong> {secretQuestion}
              </p>
              <input
                value={secretAnswer}
                onChange={(e) => setSecretAnswer(e.target.value)}
                placeholder="La réponse qu'elle/il vous a donnée..."
                className="mt-3 w-full rounded-xl border border-rose/20 px-4 py-3 focus:border-rose focus:outline-none"
              />
              <button
                onClick={() => secretAnswer.trim() && setStep(3)}
                disabled={!secretAnswer.trim()}
                className="mt-4 w-full rounded-full bg-warm py-3 font-medium text-cream disabled:opacity-50"
              >
                Continuer
              </button>
            </div>
          )}

          {step === 3 && (
            <div>
              <h3 className="font-semibold text-warm">Étape 3 — Badges comportementaux</h3>
              <p className="mt-1 text-sm text-warm-muted">Choisissez jusqu&apos;à {MAX_BADGES} badges (+10 pts chacun)</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {BEHAVIORAL_BADGES.map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => toggleBadge(b)}
                    className={`rounded-full border px-3 py-1.5 text-sm transition-all ${
                      selectedBadges.includes(b)
                        ? "gradient-pulse border-transparent text-white"
                        : "border-rose/20 text-warm-muted hover:border-rose"
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
              <button
                onClick={() => submit(true)}
                disabled={loading || selectedBadges.length === 0}
                className="mt-4 w-full rounded-full gradient-pulse py-3 font-semibold text-white disabled:opacity-50"
              >
                {loading ? "Validation..." : "Valider la rencontre"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
