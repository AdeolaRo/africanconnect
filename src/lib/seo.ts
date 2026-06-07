import type { Metadata } from "next";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://africanconnect.online";

export const SITE_NAME = "AfricanConnect";

export const DEFAULT_DESCRIPTION =
  "Rencontres sérieuses et sincères : profil détaillé, compatibilité en %, photo révélée après match mutuel. Inscription gratuite, toutes orientations respectées.";

export const DEFAULT_KEYWORDS = [
  "rencontre sérieuse",
  "site de rencontre",
  "rencontre afrique",
  "AfricanConnect",
  "compatibilité",
  "match mutuel",
  "rencontre gratuite",
  "célibataires",
  "relation durable",
  "rencontre en ligne",
];

export const PUBLIC_PATHS = [
  "",
  "/inscription",
  "/connexion",
  "/conditions-utilisation",
  "/plan-du-site",
] as const;

export const NOINDEX_PATH_PREFIXES = [
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
  "/profil",
  "/api",
] as const;

export function absoluteUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${p}`;
}

export function pageMetadata({
  title,
  description = DEFAULT_DESCRIPTION,
  path = "",
  noIndex = false,
  keywords = DEFAULT_KEYWORDS,
}: {
  title: string;
  description?: string;
  path?: string;
  noIndex?: boolean;
  keywords?: string[];
}): Metadata {
  const url = absoluteUrl(path);

  return {
    title,
    description,
    keywords,
    alternates: { canonical: url },
    robots: noIndex
      ? { index: false, follow: false, googleBot: { index: false, follow: false } }
      : {
          index: true,
          follow: true,
          googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
        },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      locale: "fr_FR",
      type: "website",
      images: [
        {
          url: absoluteUrl("/images/hero.jpg"),
          width: 1200,
          height: 630,
          alt: `${SITE_NAME} — Rencontres sérieuses`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [absoluteUrl("/images/hero.jpg")],
    },
  };
}

export const privateAreaMetadata = pageMetadata({
  title: "Espace membre",
  noIndex: true,
});
