/** Centres d'intérêt — inspirés de Hinge, Bumble et Meetic */
export const INTEREST_CATEGORIES = [
  {
    id: "travel",
    label: "Voyages & sorties",
    emoji: "✈️",
    items: ["Voyage", "Randonnée & nature", "Plage & soleil", "Découverte culturelle"],
  },
  {
    id: "food",
    label: "Food & convivialité",
    emoji: "🍽️",
    items: ["Cuisine & gastronomie", "Restaurants & bars", "Café & brunch"],
  },
  {
    id: "sport",
    label: "Sport & bien-être",
    emoji: "💪",
    items: ["Fitness & sport", "Yoga & bien-être", "Danse", "Running"],
  },
  {
    id: "culture",
    label: "Culture & loisirs",
    emoji: "🎭",
    items: ["Musique & concerts", "Cinéma & séries", "Lecture", "Art & expositions", "Photographie"],
  },
  {
    id: "lifestyle",
    label: "Style de vie",
    emoji: "✨",
    items: ["Mode & shopping", "Entrepreneuriat", "Tech & innovation", "Animaux"],
  },
  {
    id: "social",
    label: "Engagement & fun",
    emoji: "💬",
    items: ["Bénévolat", "Spiritualité", "Jeux vidéo", "Jeux de société", "Famille & enfants"],
  },
] as const;

export const ALL_INTERESTS = INTEREST_CATEGORIES.flatMap((c) => c.items);
export const MAX_INTERESTS = 6;
export const MIN_INTERESTS_SUGGESTED = 3;

export function parseInterests(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as string[];
    return Array.isArray(parsed) ? parsed.filter((i) => (ALL_INTERESTS as readonly string[]).includes(i)) : [];
  } catch {
    return raw.split(",").map((s) => s.trim()).filter(Boolean);
  }
}

export function stringifyInterests(interests: string[]): string {
  return JSON.stringify(interests.filter((i) => (ALL_INTERESTS as readonly string[]).includes(i)));
}

export function getCommonInterests(a: string[], b: string[]): string[] {
  const setB = new Set(b);
  return a.filter((i) => setB.has(i));
}

export function computeInterestOverlap(my: string[], theirs: string[]): {
  common: string[];
  ratio: number;
  match: boolean;
} {
  if (my.length === 0 || theirs.length === 0) {
    return { common: [], ratio: 0, match: true };
  }
  const common = getCommonInterests(my, theirs);
  const ratio = common.length / Math.min(my.length, theirs.length);
  return { common, ratio, match: common.length >= 1 };
}
