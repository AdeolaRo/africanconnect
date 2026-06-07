import type { MetadataRoute } from "next";
import { absoluteUrl, PUBLIC_PATHS } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/decouvrir",
          "/messages",
          "/mon-cv",
          "/modifier-profil",
          "/onboarding",
          "/parametres",
          "/visites",
          "/admin",
          "/moderation",
          "/staff-messagerie",
          "/profil/",
          "/api/",
        ],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: absoluteUrl(""),
  };
}
