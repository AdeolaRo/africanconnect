import { Shield } from "lucide-react";
import { getTrustLabel } from "@/lib/trust";

interface TrustScoreBadgeProps {
  score: number;
  verified?: boolean;
  size?: "sm" | "md";
}

export default function TrustScoreBadge({ score, verified, size = "md" }: TrustScoreBadgeProps) {
  const label = verified ? "Profil vérifié" : getTrustLabel(score);
  const isSm = size === "sm";

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full border ${
        verified
          ? "border-plum/30 bg-plum/10 text-plum"
          : score >= 30
            ? "border-amber/30 bg-amber/10 text-warm"
            : "border-rose/20 bg-cream text-warm-muted"
      } ${isSm ? "px-2.5 py-1 text-xs" : "px-3 py-1.5 text-sm"}`}
    >
      <Shield className={isSm ? "h-3 w-3" : "h-4 w-4"} fill={verified ? "currentColor" : "none"} />
      <span className="font-medium">{verified ? label : `${score} pts · ${label}`}</span>
    </div>
  );
}
