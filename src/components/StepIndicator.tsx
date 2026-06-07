import { Check, Heart, Lock, MessageCircle } from "lucide-react";

interface StepIndicatorProps {
  currentStep: 1 | 2 | 3;
}

const steps = [
  { num: 1, label: "Découverte", icon: Lock, desc: "Profil sans photo" },
  { num: 2, label: "Intérêt", icon: Heart, desc: "Like mutuel requis" },
  { num: 3, label: "Échange", icon: MessageCircle, desc: "Photo + messages" },
];

export default function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-2 rounded-2xl border border-rose/15 bg-white/80 px-4 py-3 shadow-sm">
      {steps.map((s, i) => (
        <div key={s.num} className="flex items-center gap-2">
          <div
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
              currentStep >= s.num
                ? "gradient-pulse text-white shadow-sm"
                : "bg-cream-dark text-warm-muted"
            }`}
          >
            {currentStep > s.num ? (
              <Check className="h-3.5 w-3.5" />
            ) : (
              <s.icon className="h-3.5 w-3.5" />
            )}
            <span className="hidden sm:inline">{s.label}</span>
          </div>
          {i < steps.length - 1 && (
            <div className={`h-0.5 w-6 rounded ${currentStep > s.num ? "bg-rose" : "bg-rose/20"}`} />
          )}
        </div>
      ))}
    </div>
  );
}
