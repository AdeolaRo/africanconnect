import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireModerator } from "@/lib/api-auth";
import { moderateText, moderationErrorResponse } from "@/lib/content-moderation";

export async function GET(req: Request) {
  const { error, status, session } = await requireModerator();
  if (error) return NextResponse.json({ error }, { status });

  const { searchParams } = new URL(req.url);
  const withUserId = searchParams.get("with");
  const staffId = session!.user!.id;

  if (withUserId) {
    const messages = await prisma.staffMessage.findMany({
      where: {
        OR: [
          { fromUserId: staffId, toUserId: withUserId },
          { fromUserId: withUserId, toUserId: staffId },
        ],
      },
      orderBy: { createdAt: "asc" },
      include: {
        fromUser: { select: { id: true, firstName: true, role: true } },
        toUser: { select: { id: true, firstName: true, role: true } },
      },
    });

    await prisma.staffMessage.updateMany({
      where: { fromUserId: withUserId, toUserId: staffId, read: false },
      data: { read: true },
    });

    return NextResponse.json({ messages });
  }

  const allMessages = await prisma.staffMessage.findMany({
    where: {
      OR: [{ fromUserId: staffId }, { toUserId: staffId }],
    },
    orderBy: { createdAt: "desc" },
    include: {
      fromUser: { select: { id: true, firstName: true, email: true, role: true } },
      toUser: { select: { id: true, firstName: true, email: true, role: true } },
    },
  });

  const threadMap = new Map<
    string,
    {
      userId: string;
      firstName: string;
      email: string;
      role: string;
      lastMessage: string;
      lastAt: string;
      unread: number;
    }
  >();

  for (const m of allMessages) {
    const partner = m.fromUserId === staffId ? m.toUser : m.fromUser;
    if (partner.id === staffId) continue;

    const existing = threadMap.get(partner.id);
    const unreadAdd = m.toUserId === staffId && !m.read ? 1 : 0;

    if (!existing) {
      threadMap.set(partner.id, {
        userId: partner.id,
        firstName: partner.firstName,
        email: partner.email,
        role: partner.role,
        lastMessage: m.content,
        lastAt: m.createdAt.toISOString(),
        unread: unreadAdd,
      });
    } else if (unreadAdd) {
      existing.unread += 1;
    }
  }

  return NextResponse.json({
    threads: Array.from(threadMap.values()).sort(
      (a, b) => new Date(b.lastAt).getTime() - new Date(a.lastAt).getTime()
    ),
  });
}

export async function POST(req: Request) {
  const { error, status, session } = await requireModerator();
  if (error) return NextResponse.json({ error }, { status });

  const { toUserId, content } = await req.json();
  if (!toUserId || !content?.trim()) {
    return NextResponse.json({ error: "Destinataire et message requis" }, { status: 400 });
  }

  const recipient = await prisma.user.findUnique({
    where: { id: toUserId },
    select: { id: true, role: true, isActive: true },
  });

  if (!recipient?.isActive) {
    return NextResponse.json({ error: "Utilisateur introuvable ou inactif" }, { status: 404 });
  }

  if (toUserId === session!.user!.id) {
    return NextResponse.json({ error: "Impossible de s'écrire à soi-même" }, { status: 400 });
  }

  const check = moderateText(content, "message");
  if (!check.allowed) {
    return NextResponse.json(moderationErrorResponse(check), { status: 400 });
  }

  const message = await prisma.staffMessage.create({
    data: {
      fromUserId: session!.user!.id,
      toUserId,
      content: content.trim().slice(0, 2000),
    },
    include: {
      fromUser: { select: { firstName: true, role: true } },
    },
  });

  return NextResponse.json(message);
}
