import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Inscription gratuite",
  description:
    "Créez votre profil AfricanConnect en quelques minutes. Rencontres sérieuses, compatibilité calculée, photo révélée après match mutuel.",
  path: "/inscription",
});

export default function InscriptionLayout({ children }: { children: React.ReactNode }) {
  return children;
}
