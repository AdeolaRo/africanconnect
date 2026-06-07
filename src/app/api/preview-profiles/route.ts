import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseInterests } from "@/lib/interests";

/** Aperçu public — sans auth, données limitées, pas d'interaction */
export async function GET() {
  const users = await prisma.user.findMany({
    where: {
      role: "USER",
      isActive: true,
      profile: { completed: true, discoverVisible: true },
    },
    include: {
      profile: {
        select: {
          age: true,
          location: true,
          profession: true,
          origin: true,
          profileTitle: true,
          lookingFor: true,
          bio: true,
          interests: true,
          verified: true,
          trustScore: true,
        },
      },
    },
    orderBy: [{ profile: { trustScore: "desc" } }, { createdAt: "desc" }],
    take: 12,
  });

  const profiles = users.map((u) => {
    const p = u.profile!;
    const interests = parseInterests(p.interests).slice(0, 3);
    const bio = p.bio
      ? p.bio.length > 100
        ? `${p.bio.slice(0, 100)}…`
        : p.bio
      : null;

    return {
      firstName: u.firstName,
      profileTitle: p.profileTitle,
      lookingFor: p.lookingFor,
      verified: p.verified,
      trustScore: p.trustScore,
      age: p.age,
      location: p.location,
      profession: p.profession,
      origin: p.origin,
      bio,
      interests,
    };
  });

  return NextResponse.json({
    profiles,
    total: await prisma.user.count({
      where: {
        role: "USER",
        isActive: true,
        profile: { completed: true, discoverVisible: true },
      },
    }),
  });
}
