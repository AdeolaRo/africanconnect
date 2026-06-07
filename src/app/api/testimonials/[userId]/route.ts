import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

    const testimonials = await prisma.profileTestimonial.findMany({
      where: { targetUserId: userId },
      include: { author: { select: { firstName: true } } },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    const validations = await prisma.encounterValidation.findMany({
      where: { validatedUserId: userId },
      select: { badges: true },
    });

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

    return NextResponse.json({
      testimonials: testimonials.map((t) => ({
        id: t.id,
        authorName: t.author.firstName,
        content: t.content,
        createdAt: t.createdAt,
      })),
      badges: Object.entries(badgeCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([name, count]) => ({ name, count })),
    });
  } catch (err) {
    console.error("Erreur testimonials:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
