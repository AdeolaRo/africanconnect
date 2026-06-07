import { prisma } from "@/lib/prisma";
import {
  DEFAULT_TERMS_CONTENT,
  DEFAULT_TERMS_TITLE,
  DEFAULT_TERMS_VERSION,
} from "@/lib/default-terms";

export const TERMS_KEY = "terms";

export type TermsDocument = {
  id: string;
  key: string;
  title: string;
  content: string;
  version: number;
  updatedAt: Date;
  updatedById: string | null;
};

function defaultDocument(): TermsDocument {
  return {
    id: "default",
    key: TERMS_KEY,
    title: DEFAULT_TERMS_TITLE,
    content: DEFAULT_TERMS_CONTENT,
    version: DEFAULT_TERMS_VERSION,
    updatedAt: new Date(),
    updatedById: null,
  };
}

export async function getTermsDocument(): Promise<TermsDocument> {
  try {
    if (!("siteDocument" in prisma)) {
      return defaultDocument();
    }

    let doc = await prisma.siteDocument.findUnique({ where: { key: TERMS_KEY } });
    if (!doc) {
      doc = await prisma.siteDocument.create({
        data: {
          key: TERMS_KEY,
          title: DEFAULT_TERMS_TITLE,
          content: DEFAULT_TERMS_CONTENT,
          version: DEFAULT_TERMS_VERSION,
        },
      });
    }
    return doc;
  } catch (err) {
    console.error("getTermsDocument fallback:", err);
    return defaultDocument();
  }
}

export async function saveTermsDocument(data: {
  title: string;
  content: string;
  updatedById?: string;
}): Promise<TermsDocument> {
  const existing = await getTermsDocument();
  const version = existing.id === "default" ? DEFAULT_TERMS_VERSION : existing.version + 1;

  if (!("siteDocument" in prisma)) {
    throw new Error("Base de données indisponible — relancez le serveur après prisma generate");
  }

  const doc = await prisma.siteDocument.upsert({
    where: { key: TERMS_KEY },
    update: {
      title: data.title.trim(),
      content: data.content.trim(),
      version,
      updatedById: data.updatedById ?? null,
    },
    create: {
      key: TERMS_KEY,
      title: data.title.trim(),
      content: data.content.trim(),
      version: DEFAULT_TERMS_VERSION,
      updatedById: data.updatedById ?? null,
    },
  });

  return doc;
}
