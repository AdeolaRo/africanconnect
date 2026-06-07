import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import HomeLanding from "./HomeLanding";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Rencontres sérieuses & sincères — inscription gratuite",
  description:
    "AfricanConnect : rencontres basées sur la compatibilité réelle. Profil détaillé, photo après match mutuel, toutes orientations bienvenues. Inscrivez-vous gratuitement.",
  path: "",
});

export default async function HomePage() {
  const session = await auth();
  if (session?.user) {
    redirect("/decouvrir");
  }

  return <HomeLanding />;
}
