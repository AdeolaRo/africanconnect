export const BEHAVIORAL_BADGES = [
  "Respectueux(se)",
  "Communication naturelle",
  "Ponctuel(le)",
  "Calme & apaisant(e)",
  "Correspond au profil",
  "Relationnel(le) fluide",
  "Bonne énergie",
] as const;

export const MAX_BADGES = 3;
export const TRUST_POINTS_PER_BADGE = 10;

export function getTrustLabel(score: number): string {
  if (score >= 50) return "Profil très fiable";
  if (score >= 30) return "Profil fiable";
  if (score >= 10) return "En cours de validation";
  return "Nouveau profil";
}

export function normalizePair(id1: string, id2: string): [string, string] {
  return id1 < id2 ? [id1, id2] : [id2, id1];
}

export function isUserA(userId: string, userAId: string): boolean {
  return userId === userAId;
}
