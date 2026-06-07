export const ANONYMOUS_AUTHOR_LABEL = "Après une rencontre vérifiée";
export const MAX_TESTIMONIAL_LENGTH = 300;
export const MIN_ENCOUNTERS_FOR_PUBLIC_RATING = 3;
export const REVIEW_DELAY_HOURS = 48;
export const ARCHIVE_NOT_MET_WEEKS = 4;

import { moderateText } from "@/lib/content-moderation";

export function sanitizeTestimonial(raw: string): { ok: boolean; cleaned: string; error?: string } {
  const cleaned = raw.trim().replace(/\s+/g, " ");
  if (!cleaned) return { ok: true, cleaned: "" };
  const check = moderateText(cleaned, "testimonial", MAX_TESTIMONIAL_LENGTH);
  if (!check.allowed) {
    return { ok: false, cleaned: "", error: check.reason };
  }
  return { ok: true, cleaned };
}

export function publishDelayDate(from = new Date()): Date {
  return new Date(from.getTime() + REVIEW_DELAY_HOURS * 60 * 60 * 1000);
}

export function weeksSince(date: Date): number {
  return (Date.now() - date.getTime()) / (7 * 24 * 60 * 60 * 1000);
}
