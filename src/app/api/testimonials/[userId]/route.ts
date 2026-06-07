import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  ANONYMOUS_AUTHOR_LABEL,
  MIN_ENCOUNTERS_FOR_PUBLIC_RATING,
} from "@/lib/testimonials";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { userId } = await params;
    const now = new Date();

    const [profile, testimonials, validations] = await Promise.all([
      prisma.profile.findUnique({
        where: { userId },
        select: { verifiedEncounterCount: true },
      }),
      prisma.profileTestimonial.findMany({
        where: {
          targetUserId: userId,
          status: "APPROVED",
          publishAt: { lte: now },
        },
        orderBy: { publishAt: "desc" },
        take: 10,
      }),
      prisma.encounterValidation.findMany({
        where: { validatedUserId: userId },
        select: { badges: true },
      }),
    ]);

    const allBadges: string[] = [];
    for (const v of validations) {
      try {
        const parsed = JSON.parse(v.badges) as string[];
        allBadges.push(...parsed);
      } catch { /* ignore */ }
    }

    const badgeCounts = allBadges.reduce<Record<string, number>>((acc, b) => {
      acc[b] = (acc[b] ?? 0) + 1;
      return acc;
    }, {});

    const encounterCount = profile?.verifiedEncounterCount ?? 0;
    const ratings = testimonials.map((t) => t.rating).filter((r): r is number => r != null);
    const showPublicRating = encounterCount >= MIN_ENCOUNTERS_FOR_PUBLIC_RATING && ratings.length > 0;
    const avgRating = showPublicRating
      ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10
      : null;

    return NextResponse.json({
      testimonials: testimonials.map((t) => ({
        id: t.id,
        authorName: ANONYMOUS_AUTHOR_LABEL,
        content: t.content,
        rating: t.rating,
        createdAt: t.publishAt ?? t.createdAt,
      })),
      avgRating,
      verifiedEncounterCount: encounterCount,
      badges: Object.entries(badgeCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([name, count]) => ({ name, count })),
    });
  } catch (err) {
    console.error("Erreur testimonials:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
