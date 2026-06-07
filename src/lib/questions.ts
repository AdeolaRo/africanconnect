import type { OnboardingStep } from "@/types";
import { GENDERS, SEEKING_GENDERS } from "@/lib/orientation";

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: "identity",
    title: "Qui êtes-vous ?",
    fields: [
      {
        name: "gender",
        label: "Je suis",
        type: "select",
        section: "profile",
        required: true,
        options: [...GENDERS],
      },
      {
        name: "seekingGender",
        label: "Je recherche",
        type: "select",
        section: "seeking",
        required: true,
        options: [...SEEKING_GENDERS],
      },
      { name: "age", label: "Votre âge", type: "number", section: "profile", required: true, placeholder: "28" },
      { name: "height", label: "Votre taille (cm)", type: "number", section: "profile", placeholder: "170" },
      { name: "location", label: "Votre ville", type: "city", section: "profile", required: true, placeholder: "Paris, Lyon, Dakar..." },
      { name: "origin", label: "Vos origines", type: "text", section: "profile", placeholder: "Française, Sénégalaise, Marocaine..." },
      {
        name: "maritalStatus",
        label: "Situation personnelle",
        type: "select",
        section: "profile",
        required: true,
        options: ["Jamais marié(e)", "Divorcé(e)", "Veuf(ve)"],
      },
      { name: "profession", label: "Profession", type: "text", section: "profile", placeholder: "Ingénieur, Enseignant(e)..." },
    ],
  },
  {
    id: "values",
    title: "Vos valeurs & votre projet",
    fields: [
      {
        name: "religion",
        label: "Ce qui compte pour vous",
        type: "textarea",
        section: "profile",
        placeholder: "Respect, sincérité, humour, projet de famille...",
      },
      {
        name: "seekingReligion",
        label: "Ce que vous recherchez chez l'autre",
        type: "textarea",
        section: "seeking",
        placeholder: "Quelqu'un de stable, bienveillant, avec envie de construire...",
      },
    ],
  },
  {
    id: "seeking",
    title: "Votre partenaire idéal",
    fields: [
      { name: "seekingAgeMax", label: "Âge maximum", type: "number", section: "seeking", required: true, placeholder: "35" },
      { name: "seekingHeightMax", label: "Taille maximum (cm)", type: "number", section: "seeking", placeholder: "185" },
      { name: "seekingLocation", label: "Ville souhaitée", type: "city", section: "seeking", required: true, placeholder: "France, ou prêt(e) à déménager" },
      { name: "seekingOrigin", label: "Origines souhaitées", type: "text", section: "seeking", placeholder: "Peu importe, ou précisez..." },
      {
        name: "seekingMaritalStatus",
        label: "Situation souhaitée",
        type: "select",
        section: "seeking",
        options: ["Jamais marié(e)", "Divorcé(e)", "Veuf(ve)", "Peu importe"],
      },
      { name: "seekingProfession", label: "Profession souhaitée", type: "text", section: "seeking", placeholder: "Situation stable" },
    ],
  },
  {
    id: "interests",
    title: "Vos centres d'intérêt",
    fields: [
      {
        name: "interests",
        label: "Vos passions (jusqu'à 6)",
        type: "interests",
        section: "qualities",
      },
    ],
  },
  {
    id: "qualities",
    title: "Vos qualités & présentation",
    fields: [
      {
        name: "qualities",
        label: "Vos qualités (3 max)",
        type: "multiselect",
        section: "qualities",
        options: [
          "À l'écoute", "Drôle", "Bienveillant(e)", "Sportif(ve)", "Cultivé(e)",
          "Familial(e)", "Ambitieux(se)", "Patient(e)", "Fidèle", "Spontané(e)",
        ],
      },
      {
        name: "bio",
        label: "Présentez-vous en quelques mots",
        type: "textarea",
        section: "qualities",
        placeholder: "Qui êtes-vous ? Quel projet de vie partagez-vous ?",
      },
    ],
  },
];

export function getOnboardingSteps(): OnboardingStep[] {
  return ONBOARDING_STEPS;
}

const REQUIRED_FIELDS = ["gender", "seekingGender", "age", "location", "maritalStatus", "seekingAgeMax", "seekingLocation"];
const OPTIONAL_FIELDS = [
  "height", "profession", "origin", "religion", "seekingReligion", "bio", "qualities", "interests",
  "profileTitle", "lookingFor", "children", "alcohol", "smoking", "pets", "secretQuestion",
];

function isFilled(data: Record<string, unknown>, key: string): boolean {
  const val = data[key];
  return val != null && val !== "" && !(Array.isArray(val) && val.length === 0);
}

export function calculateCompletion(data: Record<string, unknown>): number {
  const all = [...REQUIRED_FIELDS, ...OPTIONAL_FIELDS];
  const filled = all.filter((key) => isFilled(data, key)).length;
  return Math.round((filled / all.length) * 100);
}

export function isProfileComplete(data: Record<string, unknown>): boolean {
  return REQUIRED_FIELDS.every((key) => isFilled(data, key));
}
