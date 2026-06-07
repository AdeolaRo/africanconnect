"use client";

import { Heart } from "lucide-react";

interface InterestButtonProps {
  interestSent: boolean;
  loading?: boolean;
  onClick: () => void;
  size?: "sm" | "md";
}

export default function InterestButton({
  interestSent,
  loading,
  onClick,
  size = "md",
}: InterestButtonProps) {
  const isSm = size === "sm";

  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`inline-flex items-center justify-center gap-1.5 font-semibold transition-all disabled:opacity-60 ${
        isSm ? "rounded-full px-4 py-2.5 text-sm" : "rounded-full px-6 py-2.5"
      } ${
        interestSent
          ? "border border-rose/30 bg-rose/10 text-rose hover:bg-rose/15"
          : "gradient-pulse text-white shadow-md hover:shadow-lg"
      }`}
    >
      <Heart className={isSm ? "h-4 w-4" : "h-5 w-5"} fill={interestSent ? "currentColor" : "none"} />
      {loading ? "..." : interestSent ? "Intérêt exprimé" : "Exprimer mon intérêt"}
    </button>
  );
}
