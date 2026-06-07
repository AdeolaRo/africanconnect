import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { moderateText, moderationErrorResponse } from "@/lib/content-moderation";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const withUserId = searchParams.get("with");

  if (!withUserId) {
    const interests = await prisma.interest.findMany({
      where: {
        status: "ACCEPTED",
        OR: [{ fromUserId: session.user.id }, { toUserId: session.user.id }],
      },
      include: {
        fromUser: { select: { id: true, firstName: true } },
        toUser: { select: { id: true, firstName: true } },
      },
    });

    const unreadBySender = await prisma.message.groupBy({
      by: ["fromUserId"],
      where: { toUserId: session.user.id, read: false },
      _count: { id: true },
    });
    const unreadMap = new Map(unreadBySender.map((u) => [u.fromUserId, u._count.id]));

    const conversations = interests.map((interest) => {
      const partnerId =
        interest.fromUserId === session.user.id ? interest.toUserId : interest.fromUserId;
      return {
        ...interest,
        unreadCount: unreadMap.get(partnerId) ?? 0,
      };
    });

    return NextResponse.json(conversations);
  }

  const allowed = await prisma.interest.findFirst({
    where: {
      status: "ACCEPTED",
      OR: [
        { fromUserId: session.user.id, toUserId: withUserId },
        { fromUserId: withUserId, toUserId: session.user.id },
      ],
    },
  });

  if (!allowed) {
    return NextResponse.json({ error: "Pas de match mutuel" }, { status: 403 });
  }

  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { fromUserId: session.user.id, toUserId: withUserId },
        { fromUserId: withUserId, toUserId: session.user.id },
      ],
    },
    orderBy: { createdAt: "asc" },
    include: {
      fromUser: { select: { firstName: true } },
    },
  });

  await prisma.message.updateMany({
    where: { fromUserId: withUserId, toUserId: session.user.id, read: false },
    data: { read: true },
  });

  return NextResponse.json(messages);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { toUserId, content } = await req.json();
  if (!toUserId || !content?.trim()) {
    return NextResponse.json({ error: "Message requis" }, { status: 400 });
  }

  const allowed = await prisma.interest.findFirst({
    where: {
      status: "ACCEPTED",
      OR: [
        { fromUserId: session.user.id, toUserId },
        { fromUserId: toUserId, toUserId: session.user.id },
      ],
    },
  });

  if (!allowed) {
    return NextResponse.json({ error: "Match mutuel requis pour échanger" }, { status: 403 });
  }

  const check = moderateText(content, "message");
  if (!check.allowed) {
    return NextResponse.json(moderationErrorResponse(check), { status: 400 });
  }

  const message = await prisma.message.create({
    data: { fromUserId: session.user.id, toUserId, content: content.trim() },
  });

  return NextResponse.json(message);
}
