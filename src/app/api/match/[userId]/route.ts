import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { computeCompatibility, formatProfileForMatch, isMutualMatch } from "@/lib/matching";
import { isStaff } from "@/lib/roles";

export async function GET(_req: Request, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { userId } = await params;

    if (userId !== session.user.id) {
      prisma.profileVisit
        .upsert({
          where: {
            visitorId_visitedUserId: {
              visitorId: session.user.id,
              visitedUserId: userId,
            },
          },
          update: { createdAt: new Date() },
          create: { visitorId: session.user.id, visitedUserId: userId },
        })
        .catch(() => {});
    }

    const [myProfile, theirUser, photoRevealed, myInterest] = await Promise.all([
      prisma.profile.findUnique({ where: { userId: session.user.id }, include: { user: true } }),
      prisma.user.findUnique({ where: { id: userId }, include: { profile: true } }),
      isMutualMatch(session.user.id, userId),
      prisma.interest.findUnique({
        where: {
          fromUserId_toUserId: { fromUserId: session.user.id, toUserId: userId },
        },
      }),
    ]);

    if (!myProfile) {
      return NextResponse.json({ error: "Complétez votre profil d'abord" }, { status: 400 });
    }

    if (!theirUser?.profile || isStaff(theirUser.role)) {
      return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });
    }

    const myData = formatProfileForMatch(myProfile);
    const theirData = formatProfileForMatch(theirUser.profile);
    const match = computeCompatibility(myData, theirData);

    let photoUrl: string | null = null;
    if (photoRevealed) {
      const theirPhotos = await prisma.profilePhoto.findMany({
        where: { profileId: theirUser.profile.id },
        orderBy: { order: "asc" },
      });
      photoUrl = theirPhotos[0]?.url ?? theirUser.profile.photoUrl;
    }

    const p = theirUser.profile;

    return NextResponse.json({
      user: { id: theirUser.id, firstName: theirUser.firstName },
      profile: {
        gender: p.gender,
        age: p.age,
        height: p.height,
        profession: p.profession,
        religion: p.religion,
        origin: p.origin,
        maritalStatus: p.maritalStatus,
        location: p.location,
        bio: p.bio,
        qualities: p.qualities,
        interests: p.interests,
        profileTitle: p.profileTitle,
        lookingFor: p.lookingFor,
        children: p.children,
        alcohol: p.alcohol,
        smoking: p.smoking,
        pets: p.pets,
        trustScore: p.trustScore,
        verified: p.verified,
        seekingAgeMax: p.seekingAgeMax,
        seekingHeightMax: p.seekingHeightMax,
        seekingProfession: p.seekingProfession,
        seekingReligion: p.seekingReligion,
        seekingOrigin: p.seekingOrigin,
        seekingMaritalStatus: p.seekingMaritalStatus,
        seekingLocation: p.seekingLocation,
        photoUrl,
      },
      match,
      photoRevealed,
      interestSent: myInterest?.status === "PENDING" || myInterest?.status === "ACCEPTED",
      step: photoRevealed ? 3 : 1,
      stepLabel: photoRevealed
        ? "Match mutuel — photo et messages débloqués"
        : "Étape 1 — Découverte du profil (sans photo)",
    });
  } catch (err) {
    console.error("Erreur API match:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
