import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Connexion",
  description: "Connectez-vous à votre compte AfricanConnect pour découvrir des profils compatibles et échanger après match mutuel.",
  path: "/connexion",
});

export default function ConnexionLayout({ children }: { children: React.ReactNode }) {
  return children;
}
