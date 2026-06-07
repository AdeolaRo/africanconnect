export const GENDERS = ["Femme", "Homme", "Non-binaire", "Autre"] as const;
export const SEEKING_GENDERS = ["Hommes", "Femmes", "Les deux", "Peu importe"] as const;

export type Gender = (typeof GENDERS)[number];
export type SeekingGender = (typeof SEEKING_GENDERS)[number];

/** Vérifie la compatibilité mutuelle des orientations */
export function areOrientationsCompatible(
  myGender: string | null | undefined,
  mySeeking: string | null | undefined,
  theirGender: string | null | undefined,
  theirSeeking: string | null | undefined
): boolean {
  if (!myGender || !mySeeking || !theirGender || !theirSeeking) return true;

  const iWantThem = genderMatchesSeeking(theirGender, mySeeking);
  const theyWantMe = genderMatchesSeeking(myGender, theirSeeking);

  return iWantThem && theyWantMe;
}

function genderMatchesSeeking(personGender: string, seeking: string): boolean {
  if (seeking === "Peu importe") return true;

  const isMan = personGender === "Homme";
  const isWoman = personGender === "Femme";
  const isNB = personGender === "Non-binaire" || personGender === "Autre";

  if (isNB) return true; // inclusif : non-binaire visible par tous sauf filtre strict

  if (seeking === "Hommes") return isMan;
  if (seeking === "Femmes") return isWoman;
  if (seeking === "Les deux") return isMan || isWoman;

  return true;
}
