import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isStaff } from "@/lib/roles";
import { moderateText, moderationErrorResponse } from "@/lib/content-moderation";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  if (isStaff(session.user.role)) {
    return NextResponse.json({ error: "Utilisez la messagerie staff" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const withStaffId = searchParams.get("with");
  const myId = session.user.id;

  if (withStaffId) {
    const staff = await prisma.user.findUnique({
      where: { id: withStaffId },
      select: { role: true },
    });
    if (!staff || !isStaff(staff.role)) {
      return NextResponse.json({ error: "Conversation introuvable" }, { status: 404 });
    }

    const hasThread = await prisma.staffMessage.findFirst({
      where: {
        OR: [
          { fromUserId: withStaffId, toUserId: myId },
          { fromUserId: myId, toUserId: withStaffId },
        ],
      },
    });
    if (!hasThread) {
      return NextResponse.json({ error: "Aucune conversation avec l'équipe" }, { status: 403 });
    }

    const messages = await prisma.staffMessage.findMany({
      where: {
        OR: [
          { fromUserId: withStaffId, toUserId: myId },
          { fromUserId: myId, toUserId: withStaffId },
        ],
      },
      orderBy: { createdAt: "asc" },
      include: {
        fromUser: { select: { id: true, firstName: true, role: true } },
      },
    });

    await prisma.staffMessage.updateMany({
      where: { fromUserId: withStaffId, toUserId: myId, read: false },
      data: { read: true },
    });

    return NextResponse.json({ messages });
  }

  const received = await prisma.staffMessage.findMany({
    where: { toUserId: myId },
    orderBy: { createdAt: "desc" },
    include: {
      fromUser: { select: { id: true, firstName: true, role: true } },
    },
  });

  const threadMap = new Map<
    string,
    { staffId: string; staffName: string; role: string; lastMessage: string; lastAt: string; unread: number }
  >();

  for (const m of received) {
    const sid = m.fromUserId;
    const existing = threadMap.get(sid);
    if (!existing) {
      threadMap.set(sid, {
        staffId: sid,
        staffName: m.fromUser.firstName,
        role: m.fromUser.role,
        lastMessage: m.content,
        lastAt: m.createdAt.toISOString(),
        unread: m.read ? 0 : 1,
      });
    } else if (!m.read) {
      existing.unread += 1;
    }
  }

  const unreadTotal = await prisma.staffMessage.count({
    where: { toUserId: myId, read: false },
  });

  return NextResponse.json({
    threads: Array.from(threadMap.values()),
    unreadTotal,
  });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  if (isStaff(session.user.role)) {
    return NextResponse.json({ error: "Utilisez la messagerie staff" }, { status: 403 });
  }

  const { toStaffId, content } = await req.json();
  if (!toStaffId || !content?.trim()) {
    return NextResponse.json({ error: "Message requis" }, { status: 400 });
  }

  const staff = await prisma.user.findUnique({
    where: { id: toStaffId },
    select: { role: true },
  });
  if (!staff || !isStaff(staff.role)) {
    return NextResponse.json({ error: "Destinataire invalide" }, { status: 400 });
  }

  const hasThread = await prisma.staffMessage.findFirst({
    where: {
      OR: [
        { fromUserId: toStaffId, toUserId: session.user.id },
        { fromUserId: session.user.id, toUserId: toStaffId },
      ],
    },
  });
  if (!hasThread) {
    return NextResponse.json({ error: "Vous ne pouvez répondre qu'à l'équipe qui vous a contacté" }, { status: 403 });
  }

  const check = moderateText(content, "message");
  if (!check.allowed) {
    return NextResponse.json(moderationErrorResponse(check), { status: 400 });
  }

  const message = await prisma.staffMessage.create({
    data: {
      fromUserId: session.user.id,
      toUserId: toStaffId,
      content: content.trim().slice(0, 2000),
    },
  });

  return NextResponse.json(message);
}
