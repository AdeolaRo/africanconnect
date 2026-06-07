import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import type { MetResponse } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  BEHAVIORAL_BADGES,
  MAX_BADGES,
  TRUST_POINTS_PER_BADGE,
  isUserA,
  normalizePair,
} from "@/lib/trust";
import { sanitizeTestimonial } from "@/lib/testimonials";
import {
  flagEncounterDispute,
  incrementVerifiedCounts,
  isMutuallyVerified,
  scheduleEncounterTestimonials,
  setUserResponse,
  tryArchiveNotMetMatch,
} from "@/lib/encounter-logic";

const VALID_STATUSES: MetResponse[] = ["MET", "NOT_YET", "NOT_MET"];

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await req.json();
    const {
      partnerId,
      metStatus,
      hasMet,
      secretAnswer,
      badges,
      comment,
      rating,
    } = body;

    const status: MetResponse = metStatus ?? (hasMet === false ? "NOT_MET" : hasMet ? "MET" : "NOT_YET");
    if (!partnerId || !VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: "Données invalides" }, { status: 400 });
    }

    const match = await prisma.interest.findFirst({
      where: {
        status: "ACCEPTED",
        OR: [
          { fromUserId: session.user.id, toUserId: partnerId },
          { fromUserId: partnerId, toUserId: session.user.id },
        ],
      },
    });

    if (!match) {
      return NextResponse.json({ error: "Match mutuel requis" }, { status: 403 });
    }

    const [userAId, userBId] = normalizePair(session.user.id, partnerId);
    const myId = session.user.id;

    let encounter = await prisma.encounter.findUnique({
      where: { userAId_userBId: { userAId, userBId } },
    });

    if (!encounter) {
      encounter = await prisma.encounter.create({ data: { userAId, userBId } });
    }

    const iAmA = isUserA(myId, userAId);
    const alreadyResponded = iAmA ? encounter.userAResponse : encounter.userBResponse;
    if (alreadyResponded && alreadyResponded !== "NOT_YET") {
      return NextResponse.json({ error: "Vous avez déjà répondu pour cette rencontre" }, { status: 400 });
    }

    if (status === "NOT_YET") {
      await prisma.encounter.update({
        where: { id: encounter.id },
        data: setUserResponse(encounter, myId, "NOT_YET", false),
      });
      return NextResponse.json({ success: true, metStatus: "NOT_YET" });
    }

    if (status === "NOT_MET") {
      encounter = await prisma.encounter.update({
        where: { id: encounter.id },
        data: setUserResponse(encounter, myId, "NOT_MET", false),
      });
      if (encounter.userAResponse === "NOT_MET" && encounter.userBResponse === "NOT_MET") {
        await tryArchiveNotMetMatch(encounter);
      }
      const otherMet = iAmA ? encounter.userBResponse === "MET" : encounter.userAResponse === "MET";
      if (otherMet) await flagEncounterDispute(encounter.id, userAId, userBId);

      return NextResponse.json({
        success: true,
        metStatus: "NOT_MET",
        redirect: "/decouvrir",
      });
    }

    let secretCorrect = false;
    if (secretAnswer) {
      const partnerProfile = await prisma.profile.findUnique({
        where: { userId: partnerId },
        select: { secretAnswer: true },
      });
      if (partnerProfile?.secretAnswer) {
        secretCorrect = await bcrypt.compare(secretAnswer, partnerProfile.secretAnswer);
      }
    }

    if (!secretCorrect) {
      return NextResponse.json({
        error: "Réponse secrète incorrecte — la rencontre n'a pas pu être vérifiée.",
        secretCorrect: false,
      }, { status: 400 });
    }

    const validBadges = Array.isArray(badges)
      ? badges.filter((b: string) => (BEHAVIORAL_BADGES as readonly string[]).includes(b)).slice(0, MAX_BADGES)
      : [];

    if (validBadges.length === 0) {
      return NextResponse.json({ error: "Sélectionnez au moins un badge" }, { status: 400 });
    }

    let cleanedComment = "";
    if (comment && String(comment).trim()) {
      const sanitized = sanitizeTestimonial(String(comment));
      if (!sanitized.ok) {
        return NextResponse.json({ error: sanitized.error }, { status: 400 });
      }
      cleanedComment = sanitized.cleaned;
    }

    const parsedRating = rating ? parseInt(String(rating), 10) : null;
    if (parsedRating != null && (parsedRating < 1 || parsedRating > 5)) {
      return NextResponse.json({ error: "La note doit être entre 1 et 5" }, { status: 400 });
    }

    const trustIncrement = validBadges.length * TRUST_POINTS_PER_BADGE;

    await prisma.$transaction(async (tx) => {
      encounter = await tx.encounter.update({
        where: { id: encounter!.id },
        data: setUserResponse(encounter!, myId, "MET", true),
      });

      const existingValidation = await tx.encounterValidation.findUnique({
        where: { encounterId_validatorId: { encounterId: encounter.id, validatorId: myId } },
      });

      if (!existingValidation) {
        await tx.encounterValidation.create({
          data: {
            encounterId: encounter.id,
            validatorId: myId,
            validatedUserId: partnerId,
            badges: JSON.stringify(validBadges),
            trustIncrement,
          },
        });
        await tx.profile.update({
          where: { userId: partnerId },
          data: { trustScore: { increment: trustIncrement } },
        });
      }

      if (cleanedComment || parsedRating) {
        const existingTestimonial = await tx.profileTestimonial.findFirst({
          where: { encounterId: encounter.id, authorId: myId, targetUserId: partnerId },
        });
        if (!existingTestimonial) {
          await tx.profileTestimonial.create({
            data: {
              authorId: myId,
              targetUserId: partnerId,
              encounterId: encounter.id,
              content: cleanedComment || "Rencontre positive et respectueuse.",
              rating: parsedRating,
              status: "PENDING",
            },
          });
        }
      }
    });

    const refreshed = await prisma.encounter.findUnique({ where: { id: encounter!.id } });
    if (!refreshed) {
      return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }

    if (hasDispute(refreshed)) {
      await flagEncounterDispute(refreshed.id, userAId, userBId);
    }

    let bothVerified = false;
    if (isMutuallyVerified(refreshed) && !refreshed.mutuallyVerifiedAt) {
      const verifiedAt = new Date();
      await prisma.encounter.update({
        where: { id: refreshed.id },
        data: { mutuallyVerifiedAt: verifiedAt },
      });
      await scheduleEncounterTestimonials(refreshed.id, verifiedAt);
      await incrementVerifiedCounts(userAId, userBId);
      bothVerified = true;
    } else if (isMutuallyVerified(refreshed)) {
      bothVerified = true;
    }

    return NextResponse.json({
      success: true,
      secretCorrect: true,
      bothVerified,
      trustAwarded: trustIncrement,
      metStatus: "MET",
      message: bothVerified
        ? "Rencontre confirmée des deux côtés. Votre avis sera publié après modération et un délai de 48 h."
        : "Merci ! En attente de la confirmation de votre partenaire.",
    });
  } catch (err) {
    console.error("Erreur validation rencontre:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

function hasDispute(encounter: {
  userAResponse: MetResponse | null;
  userBResponse: MetResponse | null;
}): boolean {
  const r = [encounter.userAResponse, encounter.userBResponse].filter(Boolean);
  return r.length === 2 && r.includes("MET") && r.includes("NOT_MET");
}
