import type { MatchDetail, MatchResult, ProfileData } from "@/types";
import { areOrientationsCompatible } from "@/lib/orientation";
import { computeInterestOverlap, parseInterests } from "@/lib/interests";
import { prisma } from "@/lib/prisma";

function parseQualities(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    return JSON.parse(raw) as string[];
  } catch {
    return raw.split(",").map((q) => q.trim()).filter(Boolean);
  }
}

function matchField(
  label: string,
  myValue: string | number | null | undefined,
  theirValue: string | number | null | undefined,
  essential: boolean,
  comparator?: (mine: string, theirs: string) => boolean
): MatchDetail {
  const mine = myValue != null ? String(myValue) : "—";
  const theirs = theirValue != null ? String(theirValue) : "—";
  const match = comparator
    ? comparator(mine, theirs)
    : mine.toLowerCase() === theirs.toLowerCase() || theirs === "—" || mine === "—" || theirs.toLowerCase().includes("peu importe");

  return { label, myValue: mine, theirValue: theirs, match, essential };
}

function maxNumberMatch(myMax: number | null | undefined, theirValue: number | null | undefined): boolean {
  if (myMax == null || theirValue == null) return true;
  return theirValue <= myMax;
}

export function computeCompatibility(viewer: ProfileData, candidate: ProfileData): MatchResult {
  const details: MatchDetail[] = [];

  const orientOk = areOrientationsCompatible(
    viewer.gender, viewer.seekingGender,
    candidate.gender, candidate.seekingGender
  );
  details.push({
    label: "Orientation",
    myValue: viewer.seekingGender || "—",
    theirValue: candidate.gender || "—",
    match: orientOk,
    essential: true,
  });

  details.push(
    matchField("Âge", candidate.age, viewer.age, true,
      (_, theirs) => maxNumberMatch(viewer.seekingAgeMax, parseInt(theirs) || null))
  );

  details.push(
    matchField("Taille", candidate.height ? `${candidate.height} cm` : null,
      viewer.height ? `${viewer.height} cm` : null, false,
      (_, theirs) => maxNumberMatch(viewer.seekingHeightMax, parseInt(theirs) || null))
  );

  details.push(matchField("Ville", candidate.location, viewer.seekingLocation, true));
  details.push(matchField("Origines", candidate.origin, viewer.seekingOrigin, false));
  details.push(matchField("Situation", candidate.maritalStatus, viewer.seekingMaritalStatus, true));
  details.push(matchField("Profession", candidate.profession, viewer.seekingProfession, false));
  details.push(matchField("Valeurs", candidate.religion, viewer.seekingReligion, false));
  details.push(matchField("Objectif", candidate.lookingFor, viewer.lookingFor, false));
  details.push(matchField("Enfants", candidate.children, viewer.children, false));
  details.push(matchField("Alcool", candidate.alcohol, viewer.alcohol, false));
  details.push(matchField("Tabac", candidate.smoking, viewer.smoking, false));

  const myInterests = viewer.interests ?? [];
  const theirInterests = candidate.interests ?? [];
  const { common, ratio, match: interestMatch } = computeInterestOverlap(myInterests, theirInterests);

  details.push({
    label: "Centres d'intérêt",
    myValue: myInterests.length ? myInterests.join(", ") : "—",
    theirValue: common.length > 0
      ? `${common.length} en commun : ${common.join(", ")}`
      : theirInterests.length
        ? theirInterests.join(", ")
        : "—",
    match: interestMatch,
    essential: false,
  });

  const essential = details.filter((d) => d.essential);
  const essentialMatches = essential.filter((d) => d.match).length;
  const allMatches = details.filter((d) => d.match).length;

  const essentialScore = essential.length ? (essentialMatches / essential.length) * 60 : 30;
  const bonusScore = details.length ? (allMatches / details.length) * 25 : 12;
  const interestBonus = myInterests.length > 0 && theirInterests.length > 0 ? ratio * 10 : 0;
  const trustBonus = Math.min(15, Math.floor((candidate.trustScore ?? 0) / 10));

  return {
    score: Math.min(100, Math.round(essentialScore + bonusScore + interestBonus + trustBonus)),
    details,
  };
}

export function formatProfileForMatch(profile: {
  gender?: string | null;
  seekingGender?: string | null;
  age: number | null;
  height: number | null;
  profession: string | null;
  religion: string | null;
  origin: string | null;
  maritalStatus: string | null;
  location: string | null;
  qualities: string | null;
  interests?: string | null;
  profileTitle?: string | null;
  lookingFor?: string | null;
  children?: string | null;
  alcohol?: string | null;
  smoking?: string | null;
  pets?: string | null;
  trustScore?: number | null;
  seekingAgeMax: number | null;
  seekingHeightMax: number | null;
  seekingProfession: string | null;
  seekingReligion: string | null;
  seekingOrigin: string | null;
  seekingMaritalStatus: string | null;
  seekingLocation: string | null;
}): ProfileData {
  return {
    gender: profile.gender,
    seekingGender: profile.seekingGender,
    age: profile.age,
    height: profile.height,
    profession: profile.profession,
    religion: profile.religion,
    origin: profile.origin,
    maritalStatus: profile.maritalStatus,
    location: profile.location,
    qualities: parseQualities(profile.qualities),
    interests: parseInterests(profile.interests),
    profileTitle: profile.profileTitle,
    lookingFor: profile.lookingFor,
    children: profile.children,
    alcohol: profile.alcohol,
    smoking: profile.smoking,
    pets: profile.pets,
    trustScore: profile.trustScore ?? 0,
    seekingAgeMax: profile.seekingAgeMax,
    seekingHeightMax: profile.seekingHeightMax,
    seekingProfession: profile.seekingProfession,
    seekingReligion: profile.seekingReligion,
    seekingOrigin: profile.seekingOrigin,
    seekingMaritalStatus: profile.seekingMaritalStatus,
    seekingLocation: profile.seekingLocation,
  };
}

export function getScoreColor(score: number): string {
  if (score >= 85) return "text-plum bg-plum/10 border-plum/30";
  if (score >= 70) return "text-rose bg-rose/10 border-rose/30";
  return "text-warm-muted bg-cream-dark border-rose/20";
}

export function getScoreLabel(score: number): string {
  if (score >= 85) return "Excellente compatibilité";
  if (score >= 70) return "Bonne compatibilité";
  if (score >= 50) return "Compatibilité partielle";
  return "Peu compatible";
}

export async function isMutualMatch(userId1: string, userId2: string): Promise<boolean> {
  const match = await prisma.interest.findFirst({
    where: {
      status: "ACCEPTED",
      OR: [
        { fromUserId: userId1, toUserId: userId2 },
        { fromUserId: userId2, toUserId: userId1 },
      ],
    },
  });
  return !!match;
}
