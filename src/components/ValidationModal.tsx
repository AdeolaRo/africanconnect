"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { X, ShieldCheck, Star } from "lucide-react";
import { BEHAVIORAL_BADGES, MAX_BADGES } from "@/lib/trust";
import { MAX_TESTIMONIAL_LENGTH } from "@/lib/testimonials";
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
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [secretQuestion, setSecretQuestion] = useState("");
  const [secretAnswer, setSecretAnswer] = useState("");
  const [selectedBadges, setSelectedBadges] = useState<string[]>([]);
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(0);
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

  async function submitMetFlow() {
    setLoading(true);
    setError("");

    const { data, error: err } = await fetchJson<{
      secretCorrect?: boolean;
      bothVerified?: boolean;
      redirect?: string;
      message?: string;
    }>("/api/encounters/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        partnerId,
        metStatus: "MET",
        secretAnswer,
        badges: selectedBadges,
        comment: comment.trim() || undefined,
        rating: rating || undefined,
      }),
    });

    setLoading(false);

    if (err) {
      setError(err);
      return;
    }

    onSuccess?.();
    onClose();
    if (data?.message) alert(data.message);
  }

  async function submitStatus(metStatus: "NOT_YET" | "NOT_MET") {
    setLoading(true);
    setError("");

    const { data, error: err } = await fetchJson<{ redirect?: string }>("/api/encounters/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ partnerId, metStatus }),
    });

    setLoading(false);

    if (err) {
      setError(err);
      return;
    }

    onClose();
    if (metStatus === "NOT_MET" || data?.redirect) {
      router.push(data?.redirect ?? "/decouvrir");
    }
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
            Les avis sont anonymisés, modérés avant publication, et publiés 48 h après confirmation mutuelle.
            N&apos;incluez pas d&apos;adresse précise ni de coordonnées.
          </p>

          {error && <p className="rounded-xl bg-rose/10 px-4 py-2 text-sm text-rose">{error}</p>}

          {step === 1 && (
            <div>
              <h3 className="font-semibold text-warm">Avez-vous rencontré cette personne ?</h3>
              <div className="mt-4 flex flex-col gap-2">
                <button
                  onClick={() => setStep(2)}
                  disabled={!secretQuestion}
                  className="rounded-full gradient-pulse py-3 font-medium text-white disabled:opacity-50"
                >
                  Oui, en vrai
                </button>
                <button
                  onClick={() => submitStatus("NOT_YET")}
                  disabled={loading}
                  className="rounded-full border border-amber/30 bg-amber/10 py-3 text-warm hover:bg-amber/20"
                >
                  Pas encore
                </button>
                <button
                  onClick={() => submitStatus("NOT_MET")}
                  disabled={loading}
                  className="rounded-full border border-rose/20 py-3 text-warm-muted hover:bg-cream"
                >
                  On ne s&apos;est pas rencontrés
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h3 className="font-semibold text-warm">Question secrète</h3>
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
              <h3 className="font-semibold text-warm">Badges comportementaux</h3>
              <p className="mt-1 text-sm text-warm-muted">Jusqu&apos;à {MAX_BADGES} badges (+10 pts chacun)</p>
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
                onClick={() => selectedBadges.length > 0 && setStep(4)}
                disabled={selectedBadges.length === 0}
                className="mt-4 w-full rounded-full bg-warm py-3 font-medium text-cream disabled:opacity-50"
              >
                Continuer
              </button>
            </div>
          )}

          {step === 4 && (
            <div>
              <h3 className="font-semibold text-warm">Commentaire & note (optionnel)</h3>
              <p className="mt-1 text-sm text-warm-muted">
                Style Airbnb — visible après modération, sans votre prénom.
              </p>

              <div className="mt-3 flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setRating(n)}
                    aria-label={`Note ${n}`}
                    className="p-1"
                  >
                    <Star
                      className={`h-7 w-7 ${n <= rating ? "fill-amber text-amber" : "text-rose/30"}`}
                    />
                  </button>
                ))}
              </div>

              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value.slice(0, MAX_TESTIMONIAL_LENGTH))}
                placeholder="Ex : Personne respectueuse, correspondait bien au profil..."
                rows={4}
                className="mt-3 w-full rounded-xl border border-rose/20 px-4 py-3 focus:border-rose focus:outline-none"
              />
              <p className="mt-1 text-right text-xs text-warm-muted">
                {comment.length}/{MAX_TESTIMONIAL_LENGTH}
              </p>

              <button
                onClick={submitMetFlow}
                disabled={loading}
                className="mt-4 w-full rounded-full gradient-pulse py-3 font-semibold text-white disabled:opacity-50"
              >
                {loading ? "Envoi..." : "Valider la rencontre"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
