import { Lock, User } from "lucide-react";

interface AvatarPlaceholderProps {
  firstName: string;
  size?: "sm" | "md" | "lg";
  photoRevealed?: boolean;
  photoUrl?: string | null;
}

const sizes = {
  sm: "h-16 w-16 text-lg",
  md: "h-20 w-20 text-xl",
  lg: "h-32 w-32 text-3xl",
};

export default function AvatarPlaceholder({
  firstName,
  size = "md",
  photoRevealed = false,
  photoUrl,
}: AvatarPlaceholderProps) {
  const initial = firstName.charAt(0).toUpperCase();

  if (photoRevealed && photoUrl) {
    return (
      <div className={`relative overflow-hidden rounded-2xl ${sizes[size]}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photoUrl} alt={firstName} className="h-full w-full object-cover" />
      </div>
    );
  }

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-plum via-rose to-amber ${sizes[size]} shadow-lg shadow-rose/20`}
    >
      <span className="font-serif font-bold text-white">{initial}</span>
      {!photoRevealed && (
        <div className="absolute inset-0 flex items-center justify-center bg-warm/30 backdrop-blur-[2px]">
          <div className="flex flex-col items-center gap-0.5">
            <Lock className="h-3 w-3 text-white/90" />
            {size !== "sm" && (
              <span className="text-[9px] font-medium text-white/80">Après match</span>
            )}
          </div>
        </div>
      )}
      {!photoRevealed && size === "lg" && (
        <User className="absolute bottom-2 right-2 h-4 w-4 text-white/40" />
      )}
    </div>
  );
}
