/**
 * Filtrage automatique inspiré des pratiques courantes (Bumble Deception Detector,
 * Tinder « Are You Sure? », filtres mots-clés + PII).
 * Tout est local — pas d'API externe.
 */

export type ModerationContext = "message" | "testimonial" | "profile" | "general";

export interface ModerationResult {
  allowed: boolean;
  reason?: string;
  flags: string[];
}

const PII_PATTERNS: { pattern: RegExp; flag: string }[] = [
  { pattern: /\b\d{10,}\b/, flag: "phone" },
  { pattern: /\b0[1-9](?:[\s.-]?\d{2}){4}\b/, flag: "phone_fr" },
  { pattern: /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i, flag: "email" },
  { pattern: /https?:\/\/|www\.\S+/i, flag: "link" },
  { pattern: /\b(rue|avenue|boulevard|place|impasse)\s+[\w'-]{2,}/i, flag: "address" },
  { pattern: /\b\d{1,3}\s*,\s*-?\d{1,3}\b/, flag: "coordinates" },
  { pattern: /\b(whatsapp|telegram|snapchat|instagram|facebook|tiktok)\b/i, flag: "external_contact" },
];

const SPAM_PATTERNS: { pattern: RegExp; flag: string }[] = [
  { pattern: /(.)\1{5,}/, flag: "spam_repeat" },
  { pattern: /(https?:\/\/\S+\s*){2,}/i, flag: "spam_links" },
  { pattern: /\b(gagnez|gratuit|crypto|bitcoin|investissement|cliquez ici)\b/i, flag: "spam_scam" },
];

const HARASSMENT_PATTERNS: { pattern: RegExp; flag: string }[] = [
  { pattern: /\b(meurs?|tue|viol)\b/i, flag: "violence" },
  { pattern: /\b(sale\s+(pute|connard|merde)|fdp|ntm|enculé)\b/i, flag: "insult" },
  { pattern: /\b(n[i1]ger|n[eè]gre|bougnoule|youpin|sale\s+arabe)\b/i, flag: "hate_speech" },
];

/** Liste sobre — termes clairement inappropriés sur une app de rencontre */
const PROFANITY = [
  "pute", "putain", "connard", "connasse", "salope", "encule", "enculé", "fdp",
  "nique", "ntm", "merde", "batard", "bâtard", "fuck", "shit", "bitch", "asshole",
  "porn", "porno", "sexe payant", "escort", "sugar daddy", "sugar mommy",
];

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[@4]/g, "a")
    .replace(/[3]/g, "e")
    .replace(/[1!]/g, "i")
    .replace(/[0]/g, "o")
    .replace(/\$/g, "s");
}

function checkProfanity(text: string): boolean {
  const norm = normalize(text);
  return PROFANITY.some((w) => {
    const re = new RegExp(`\\b${w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
    return re.test(norm);
  });
}

function checkExcessiveCaps(text: string): boolean {
  const letters = text.replace(/[^a-zA-ZÀ-ÿ]/g, "");
  if (letters.length < 12) return false;
  const upper = letters.replace(/[^A-ZÀ-Ÿ]/g, "").length;
  return upper / letters.length > 0.7;
}

export function moderateText(
  raw: string,
  context: ModerationContext = "general",
  maxLength?: number
): ModerationResult {
  const text = raw.trim().replace(/\s+/g, " ");
  const flags: string[] = [];

  if (!text) return { allowed: true, flags };

  const limits: Record<ModerationContext, number> = {
    message: 2000,
    testimonial: 300,
    profile: 1500,
    general: 2000,
  };
  const limit = maxLength ?? limits[context];
  if (text.length > limit) {
    return { allowed: false, reason: `Maximum ${limit} caractères`, flags: ["too_long"] };
  }

  for (const { pattern, flag } of PII_PATTERNS) {
    if (pattern.test(text)) flags.push(flag);
  }

  for (const { pattern, flag } of SPAM_PATTERNS) {
    if (pattern.test(text)) flags.push(flag);
  }

  for (const { pattern, flag } of HARASSMENT_PATTERNS) {
    if (pattern.test(text)) flags.push(flag);
  }

  if (checkProfanity(text)) flags.push("profanity");
  if (checkExcessiveCaps(text)) flags.push("excessive_caps");

  const blocking = new Set([
    "phone", "phone_fr", "email", "link", "address", "coordinates",
    "external_contact", "spam_scam", "violence", "hate_speech",
    "profanity", "insult", "spam_links",
  ]);

  const blocked = flags.filter((f) => blocking.has(f));
  if (blocked.length > 0) {
    const reasons: Record<string, string> = {
      phone: "Les numéros de téléphone ne sont pas autorisés",
      phone_fr: "Les numéros de téléphone ne sont pas autorisés",
      email: "Les adresses email ne sont pas autorisées",
      link: "Les liens externes ne sont pas autorisés",
      address: "Les adresses précises ne sont pas autorisées",
      coordinates: "Les coordonnées ne sont pas autorisées",
      external_contact: "Redirection vers d'autres réseaux interdite avant le match",
      spam_scam: "Contenu suspect détecté",
      violence: "Menaces ou violence interdites",
      hate_speech: "Discours haineux interdit",
      profanity: "Langage inapproprié détecté",
      insult: "Insultes interdites",
      spam_links: "Spam détecté",
    };
    const reason = reasons[blocked[0]] ?? "Ce contenu ne respecte pas nos règles de communauté";
    return { allowed: false, reason, flags };
  }

  if (flags.includes("spam_repeat") || flags.includes("excessive_caps")) {
    return {
      allowed: false,
      reason: "Message difficile à lire ou suspect — reformulez de manière respectueuse",
      flags,
    };
  }

  return { allowed: true, flags };
}

/** Valide plusieurs champs profil d'un coup */
export function moderateProfileFields(fields: {
  bio?: string | null;
  profileTitle?: string | null;
  secretQuestion?: string | null;
  profession?: string | null;
}): ModerationResult {
  for (const [key, value] of Object.entries(fields)) {
    if (!value || typeof value !== "string") continue;
    const result = moderateText(value, "profile");
    if (!result.allowed) {
      return { ...result, reason: `${key === "bio" ? "Bio" : key === "profileTitle" ? "Titre" : "Champ"} : ${result.reason}` };
    }
  }
  return { allowed: true, flags: [] };
}

export function moderationErrorResponse(result: ModerationResult) {
  return {
    error: result.reason ?? "Contenu non conforme à nos règles",
    moderation: { flags: result.flags, blocked: true },
  };
}
