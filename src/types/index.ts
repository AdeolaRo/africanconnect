export interface ProfileData {
  gender?: string | null;
  seekingGender?: string | null;
  age?: number | null;
  height?: number | null;
  profession?: string | null;
  religion?: string | null;
  origin?: string | null;
  maritalStatus?: string | null;
  location?: string | null;
  bio?: string | null;
  qualities?: string[];
  interests?: string[];
  profileTitle?: string | null;
  lookingFor?: string | null;
  children?: string | null;
  alcohol?: string | null;
  smoking?: string | null;
  pets?: string | null;
  trustScore?: number;
  seekingAgeMax?: number | null;
  seekingHeightMax?: number | null;
  seekingProfession?: string | null;
  seekingReligion?: string | null;
  seekingOrigin?: string | null;
  seekingMaritalStatus?: string | null;
  seekingLocation?: string | null;
}

export interface MatchResult {
  score: number;
  details: MatchDetail[];
}

export interface MatchDetail {
  label: string;
  myValue: string;
  theirValue: string;
  match: boolean;
  essential: boolean;
}

export interface OnboardingStep {
  id: string;
  title: string;
  fields: OnboardingField[];
}

export interface OnboardingField {
  name: string;
  label: string;
  type: "text" | "number" | "select" | "textarea" | "multiselect" | "interests" | "city";
  options?: string[];
  placeholder?: string;
  required?: boolean;
  section: "profile" | "seeking" | "qualities";
}
