import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const userId = session.user.id;

    const [sentPending, matches] = await Promise.all([
      prisma.interest.findMany({
        where: { fromUserId: userId, status: "PENDING" },
        include: {
          toUser: {
            select: {
              id: true,
              firstName: true,
              profile: { select: { age: true, location: true, completionPct: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.interest.findMany({
        where: {
          status: "ACCEPTED",
          OR: [{ fromUserId: userId }, { toUserId: userId }],
        },
        include: {
          fromUser: {
            select: {
              id: true,
              firstName: true,
              profile: { select: { age: true, location: true } },
            },
          },
          toUser: {
            select: {
              id: true,
              firstName: true,
              profile: { select: { age: true, location: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const seenPartners = new Set<string>();
    const formattedMatches = matches
      .map((m) => {
        const partner = m.fromUserId === userId ? m.toUser : m.fromUser;
        return {
          id: m.id,
          partnerId: partner.id,
          firstName: partner.firstName,
          age: partner.profile?.age,
          location: partner.profile?.location,
          createdAt: m.createdAt,
        };
      })
      .filter((m) => {
        if (seenPartners.has(m.partnerId)) return false;
        seenPartners.add(m.partnerId);
        return true;
      });

    const formattedInterests = sentPending.map((i) => ({
      id: i.id,
      partnerId: i.toUser.id,
      firstName: i.toUser.firstName,
      age: i.toUser.profile?.age,
      location: i.toUser.profile?.location,
      createdAt: i.createdAt,
    }));

    return NextResponse.json({ interests: formattedInterests, matches: formattedMatches });
  } catch (err) {
    console.error("Erreur GET interests:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { toUserId } = await req.json();
    if (!toUserId) {
      return NextResponse.json({ error: "Destinataire requis" }, { status: 400 });
    }

    const existing = await prisma.interest.findUnique({
      where: { fromUserId_toUserId: { fromUserId: session.user.id, toUserId } },
    });

    if (existing) {
      return NextResponse.json(existing);
    }

    const reciprocal = await prisma.interest.findUnique({
      where: { fromUserId_toUserId: { fromUserId: toUserId, toUserId: session.user.id } },
    });

    const interest = await prisma.interest.create({
      data: {
        fromUserId: session.user.id,
        toUserId,
        status: reciprocal ? "ACCEPTED" : "PENDING",
      },
    });

    if (reciprocal && reciprocal.status === "PENDING") {
      await prisma.interest.update({
        where: { id: reciprocal.id },
        data: { status: "ACCEPTED" },
      });
    }

    return NextResponse.json({ ...interest, matched: !!reciprocal });
  } catch (err) {
    console.error("Erreur POST interest:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
