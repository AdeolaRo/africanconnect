import Image from "next/image";
import type { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  image: string;
}

export default function FeatureCard({ icon: Icon, title, description, image }: FeatureCardProps) {
  return (
    <div className="group overflow-hidden rounded-2xl border border-rose/15 bg-white shadow-sm transition-all hover:shadow-xl hover:shadow-rose/15 hover:-translate-y-1">
      <div className="relative h-44 overflow-hidden">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-plum/70 to-transparent" />
        <div className="absolute bottom-3 left-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-rose shadow">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="p-5">
        <h3 className="font-semibold text-warm">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-warm-muted">{description}</p>
      </div>
    </div>
  );
}
