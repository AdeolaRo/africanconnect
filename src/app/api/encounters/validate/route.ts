import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  BEHAVIORAL_BADGES,
  MAX_BADGES,
  TRUST_POINTS_PER_BADGE,
  isUserA,
  normalizePair,
} from "@/lib/trust";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { partnerId, hasMet, secretAnswer, badges } = await req.json();
    if (!partnerId) {
      return NextResponse.json({ error: "Partenaire requis" }, { status: 400 });
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
    const iAmA = isUserA(myId, userAId);

    let encounter = await prisma.encounter.findUnique({
      where: { userAId_userBId: { userAId, userBId } },
    });

    if (!encounter) {
      encounter = await prisma.encounter.create({
        data: { userAId, userBId },
      });
    }

    const alreadyConfirmed = iAmA ? encounter.userAConfirmed : encounter.userBConfirmed;
    if (alreadyConfirmed) {
      return NextResponse.json({ error: "Vous avez déjà validé cette rencontre" }, { status: 400 });
    }

    let secretCorrect = false;
    if (hasMet && secretAnswer) {
      const partnerProfile = await prisma.profile.findUnique({
        where: { userId: partnerId },
        select: { secretAnswer: true },
      });
      if (partnerProfile?.secretAnswer) {
        secretCorrect = await bcrypt.compare(secretAnswer, partnerProfile.secretAnswer);
      }
    }

    const updateData = iAmA
      ? { userAConfirmed: !!hasMet, userASecretCorrect: secretCorrect }
      : { userBConfirmed: !!hasMet, userBSecretCorrect: secretCorrect };

    encounter = await prisma.encounter.update({
      where: { id: encounter.id },
      data: updateData,
    });

    const validBadges = Array.isArray(badges)
      ? badges.filter((b: string) => (BEHAVIORAL_BADGES as readonly string[]).includes(b)).slice(0, MAX_BADGES)
      : [];

    if (hasMet && secretCorrect && validBadges.length > 0) {
      const trustIncrement = validBadges.length * TRUST_POINTS_PER_BADGE;
      const existing = await prisma.encounterValidation.findUnique({
        where: { encounterId_validatorId: { encounterId: encounter.id, validatorId: myId } },
      });

      if (!existing) {
        await prisma.$transaction([
          prisma.encounterValidation.create({
            data: {
              encounterId: encounter.id,
              validatorId: myId,
              validatedUserId: partnerId,
              badges: JSON.stringify(validBadges),
              trustIncrement,
            },
          }),
          prisma.profile.update({
            where: { userId: partnerId },
            data: { trustScore: { increment: trustIncrement } },
          }),
        ]);
      }
    }

    const refreshed = await prisma.encounter.findUnique({ where: { id: encounter.id } });
    const bothConfirmed =
      refreshed?.userAConfirmed &&
      refreshed?.userBConfirmed &&
      refreshed?.userASecretCorrect &&
      refreshed?.userBSecretCorrect;

    if (bothConfirmed) {
      const autoComment = "Rencontre vérifiée avec succès ✓";
      for (const targetId of [userAId, userBId]) {
        const authorId = targetId === userAId ? userBId : userAId;
        const exists = await prisma.profileTestimonial.findFirst({
          where: { encounterId: encounter.id, authorId, targetUserId: targetId, content: autoComment },
        });
        if (!exists) {
          await prisma.profileTestimonial.create({
            data: { authorId, targetUserId: targetId, encounterId: encounter.id, content: autoComment },
          });
        }
      }
      await prisma.profile.updateMany({
        where: { userId: { in: [userAId, userBId] } },
        data: { verified: true },
      });
    }

    return NextResponse.json({
      success: true,
      secretCorrect,
      bothVerified: bothConfirmed,
      trustAwarded: hasMet && secretCorrect ? validBadges.length * TRUST_POINTS_PER_BADGE : 0,
    });
  } catch (err) {
    console.error("Erreur validation rencontre:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
