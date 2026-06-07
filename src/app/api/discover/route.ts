import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { computeCompatibility, formatProfileForMatch } from "@/lib/matching";
import { getCommonInterests, parseInterests } from "@/lib/interests";
import { areOrientationsCompatible } from "@/lib/orientation";
import { isStaff } from "@/lib/roles";

export async function GET(req: Request) {
  const session = await auth();
  const { searchParams } = new URL(req.url);
  const verifiedOnly = searchParams.get("verifiedOnly") === "true";
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const me = await prisma.user.findFirst({
    where: {
      OR: [
        { id: session.user.id },
        ...(session.user.email ? [{ email: session.user.email }] : []),
      ],
    },
    include: { profile: true },
  });

  if (isStaff(me?.role)) {
    const candidates = await prisma.user.findMany({
      where: {
        role: "USER",
        isActive: true,
        profile: {
          completed: true,
          discoverVisible: true,
          ...(verifiedOnly ? { verified: true } : {}),
        },
      },
      include: { profile: true },
      take: 100,
      orderBy: { createdAt: "desc" },
    });

    const profiles = candidates.map((c) => ({
      id: c.id,
      firstName: c.firstName,
      profileTitle: c.profile!.profileTitle,
      trustScore: c.profile!.trustScore,
      verified: c.profile!.verified,
      lookingFor: c.profile!.lookingFor,
      profile: {
        age: c.profile!.age,
        location: c.profile!.location,
        profession: c.profile!.profession,
        origin: c.profile!.origin,
        bio: c.profile!.bio,
        gender: c.profile!.gender,
        seekingGender: c.profile!.seekingGender,
      },
      matchScore: 0,
      matchLabel: "Consultation",
      matchedCriteria: [] as string[],
      commonInterests: [] as string[],
      photoRevealed: false,
    }));

    return NextResponse.json({ profiles, myUserId: me!.id, staffPreview: true });
  }

  if (!me?.profile?.completed) {
    return NextResponse.json({ error: "Complétez votre profil d'abord", profiles: [] }, { status: 200 });
  }

  const myId = me.id;
  const myProfile = me.profile!;
  const myData = formatProfileForMatch(myProfile);

  const [candidates, passed] = await Promise.all([
    prisma.user.findMany({
      where: {
        id: { not: myId },
        role: "USER",
        isActive: true,
        profile: {
          completed: true,
          discoverVisible: true,
          ...(verifiedOnly ? { verified: true } : {}),
        },
      },
      include: { profile: true },
      take: 100,
    }),
    prisma.userPass.findMany({
      where: { fromUserId: myId },
      select: { toUserId: true },
    }),
  ]);

  const passedIds = new Set(passed.map((p) => p.toUserId));

  const profiles = candidates
    .filter((c) => c.id !== myId && !passedIds.has(c.id))
    .filter((c) =>
      areOrientationsCompatible(
        myProfile.gender, myProfile.seekingGender,
        c.profile?.gender, c.profile?.seekingGender
      )
    )
    .map((c) => {
      const candidateData = formatProfileForMatch(c.profile!);
      const match = computeCompatibility(myData, candidateData);
      const commonInterests = getCommonInterests(
        myData.interests ?? [],
        parseInterests(c.profile!.interests)
      );
      return {
        id: c.id,
        firstName: c.firstName,
        profileTitle: c.profile!.profileTitle,
        trustScore: c.profile!.trustScore,
        verified: c.profile!.verified,
        lookingFor: c.profile!.lookingFor,
        profile: {
          age: c.profile!.age,
          location: c.profile!.location,
          profession: c.profile!.profession,
          origin: c.profile!.origin,
          bio: c.profile!.bio,
          gender: c.profile!.gender,
          seekingGender: c.profile!.seekingGender,
        },
        matchScore: match.score,
        matchLabel: match.score >= 85 ? "Excellente" : match.score >= 70 ? "Bonne" : "Partielle",
        matchedCriteria: match.details.filter((d) => d.match).map((d) => d.label),
        commonInterests,
        photoRevealed: false,
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore);

  return NextResponse.json({ profiles, myUserId: myId });
}
