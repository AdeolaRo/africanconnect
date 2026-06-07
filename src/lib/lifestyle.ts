export const LOOKING_FOR_OPTIONS = [
  "Rencontres",
  "Discussion",
  "Histoire sérieuse",
] as const;

export const CHILDREN_OPTIONS = [
  "Oui",
  "Non",
  "Peut-être plus tard",
] as const;

export const HABIT_OPTIONS = [
  "Jamais",
  "Occasionnellement",
  "Souvent",
] as const;

export type LookingFor = (typeof LOOKING_FOR_OPTIONS)[number];
