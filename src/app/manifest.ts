import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AfricanConnect — Rencontres sérieuses",
    short_name: "AfricanConnect",
    description:
      "Créez votre profil de rencontre, découvrez votre compatibilité et échangez après match mutuel.",
    start_url: "/",
    display: "standalone",
    background_color: "#fff5f7",
    theme_color: "#e8195a",
    orientation: "portrait-primary",
    lang: "fr",
    categories: ["social", "lifestyle"],
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png", purpose: "any" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Découvrir", url: "/decouvrir", description: "Parcourir les profils compatibles" },
      { name: "Messages", url: "/messages", description: "Vos conversations" },
    ],
  };
}
