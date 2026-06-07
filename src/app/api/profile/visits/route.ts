import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const visits = await prisma.profileVisit.findMany({
      where: { visitedUserId: session.user.id },
      include: {
        visitor: {
          select: {
            id: true,
            firstName: true,
            profile: { select: { age: true, location: true, completionPct: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const formatted = visits.map((v) => ({
      id: v.id,
      visitorId: v.visitor.id,
      firstName: v.visitor.firstName,
      age: v.visitor.profile?.age,
      location: v.visitor.profile?.location,
      visitedAt: v.createdAt,
    }));

    return NextResponse.json({ visits: formatted, count: formatted.length });
  } catch (err) {
    console.error("Erreur GET visits:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { visitedUserId } = await req.json();
    if (!visitedUserId || visitedUserId === session.user.id) {
      return NextResponse.json({ error: "Visite invalide" }, { status: 400 });
    }

    const visit = await prisma.profileVisit.upsert({
      where: {
        visitorId_visitedUserId: {
          visitorId: session.user.id,
          visitedUserId,
        },
      },
      update: { createdAt: new Date() },
      create: {
        visitorId: session.user.id,
        visitedUserId,
      },
    });

    return NextResponse.json(visit);
  } catch (err) {
    console.error("Erreur POST visit:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
