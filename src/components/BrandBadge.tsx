import { Heart } from "lucide-react";

interface BrandBadgeProps {
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

const sizes = {
  sm: { box: "h-8 w-8", icon: "h-3.5 w-3.5", text: "text-xs" },
  md: { box: "h-10 w-10", icon: "h-4 w-4", text: "text-sm" },
  lg: { box: "h-14 w-14", icon: "h-6 w-6", text: "text-base" },
};

/** Badge sobre et reconnaissable — cœur blanc sur dégradé rose/prune */
export default function BrandBadge({ size = "md", showLabel = false, className = "" }: BrandBadgeProps) {
  const s = sizes[size];

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span
        className={`relative flex ${s.box} shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-plum via-rose to-amber shadow-md shadow-rose/25 ring-2 ring-white/80`}
        aria-hidden
      >
        <Heart className={`${s.icon} text-white`} fill="white" strokeWidth={0} />
        <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-warm text-[7px] font-bold text-cream">
          AC
        </span>
      </span>
      {showLabel && (
        <span className={`font-serif font-bold text-warm ${s.text}`}>AfricanConnect</span>
      )}
    </span>
  );
}
