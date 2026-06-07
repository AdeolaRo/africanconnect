import type { Encounter, MetResponse } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ARCHIVE_NOT_MET_WEEKS, publishDelayDate } from "@/lib/testimonials";
import { isUserA, normalizePair } from "@/lib/trust";

export function getUserResponse(encounter: Encounter, userId: string): MetResponse | null {
  const [userAId] = normalizePair(encounter.userAId, encounter.userBId);
  return isUserA(userId, userAId) ? encounter.userAResponse : encounter.userBResponse;
}

export function setUserResponse(
  encounter: Encounter,
  userId: string,
  response: MetResponse,
  secretCorrect: boolean
) {
  const [userAId] = normalizePair(encounter.userAId, encounter.userBId);
  const iAmA = isUserA(userId, userAId);
  return {
    ...(iAmA
      ? {
          userAResponse: response,
          userAConfirmed: response === "MET",
          userASecretCorrect: response === "MET" && secretCorrect,
        }
      : {
          userBResponse: response,
          userBConfirmed: response === "MET",
          userBSecretCorrect: response === "MET" && secretCorrect,
        }),
  };
}

export function isMutuallyVerified(encounter: Encounter): boolean {
  return !!(
    encounter.userAResponse === "MET" &&
    encounter.userBResponse === "MET" &&
    encounter.userASecretCorrect &&
    encounter.userBSecretCorrect
  );
}

export function hasDispute(encounter: Encounter): boolean {
  const responses = [encounter.userAResponse, encounter.userBResponse].filter(Boolean);
  if (responses.length < 2) return false;
  return responses.includes("MET") && responses.includes("NOT_MET");
}

export async function scheduleEncounterTestimonials(encounterId: string, verifiedAt: Date) {
  const publishAt = publishDelayDate(verifiedAt);
  await prisma.profileTestimonial.updateMany({
    where: { encounterId, status: "PENDING" },
    data: { publishAt },
  });
}

export async function incrementVerifiedCounts(userAId: string, userBId: string) {
  await prisma.profile.updateMany({
    where: { userId: { in: [userAId, userBId] } },
    data: {
      verified: true,
      verifiedEncounterCount: { increment: 1 },
    },
  });
}

export async function flagEncounterDispute(encounterId: string, userAId: string, userBId: string) {
  await prisma.encounter.update({
    where: { id: encounterId },
    data: { disputed: true },
  });

  const existing = await prisma.contentReport.findFirst({
    where: {
      targetType: "PROFILE",
      targetId: encounterId,
      reason: "Divergence validation rencontre",
    },
  });

  if (!existing) {
    await prisma.contentReport.create({
      data: {
        reporterId: userAId,
        targetType: "PROFILE",
        targetId: encounterId,
        targetUserId: userBId,
        reason: "Divergence validation rencontre",
        details: "Un membre confirme la rencontre, l'autre la nie — vérification modération requise.",
      },
    });
  }
}

export async function tryArchiveNotMetMatch(encounter: Encounter) {
  if (encounter.archivedAt) return;
  if (encounter.userAResponse !== "NOT_MET" || encounter.userBResponse !== "NOT_MET") return;

  const interest = await prisma.interest.findFirst({
    where: {
      status: "ACCEPTED",
      OR: [
        { fromUserId: encounter.userAId, toUserId: encounter.userBId },
        { fromUserId: encounter.userBId, toUserId: encounter.userAId },
      ],
    },
  });

  if (!interest) return;
  if (ARCHIVE_NOT_MET_WEEKS > weeksSince(interest.createdAt)) return;

  await prisma.$transaction([
    prisma.encounter.update({
      where: { id: encounter.id },
      data: { archivedAt: new Date() },
    }),
    prisma.interest.update({
      where: { id: interest.id },
      data: { status: "DECLINED" },
    }),
  ]);
}

function weeksSince(date: Date): number {
  return (Date.now() - date.getTime()) / (7 * 24 * 60 * 60 * 1000);
}
