import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireModerator } from "@/lib/api-auth";
import { getPublicMessageContent, serializeMessageForClient, threadPairKey } from "@/lib/message-utils";

function buildThreadPreview(content: string, deletedAt: Date | null) {
  const text = getPublicMessageContent(content, deletedAt);
  return text.length > 80 ? `${text.slice(0, 80)}…` : text;
}

export async function GET(req: Request) {
  const { error, status } = await requireModerator();
  if (error) return NextResponse.json({ error }, { status });

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const userA = searchParams.get("userA");
  const userB = searchParams.get("userB");
  const take = Math.min(200, parseInt(searchParams.get("limit") ?? "100", 10));

  if (type && userA && userB) {
    const pair = threadPairKey(userA, userB);
    const [id1, id2] = pair.split(":");

    if (type === "staff") {
      const messages = await prisma.staffMessage.findMany({
        where: {
          OR: [
            { fromUserId: id1, toUserId: id2 },
            { fromUserId: id2, toUserId: id1 },
          ],
        },
        orderBy: { createdAt: "asc" },
        include: {
          fromUser: { select: { id: true, firstName: true, email: true, role: true } },
          toUser: { select: { id: true, firstName: true, email: true, role: true } },
        },
      });

      return NextResponse.json({
        messages: messages.map((m) => ({
          ...serializeMessageForClient(m, { moderatorView: true }),
          type: "staff" as const,
          from: m.fromUser,
          to: m.toUser,
        })),
      });
    }

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { fromUserId: id1, toUserId: id2 },
          { fromUserId: id2, toUserId: id1 },
        ],
      },
      orderBy: { createdAt: "asc" },
      include: {
        fromUser: { select: { id: true, firstName: true, email: true, role: true } },
        toUser: { select: { id: true, firstName: true, email: true, role: true } },
      },
    });

    return NextResponse.json({
      messages: messages.map((m) => ({
        ...serializeMessageForClient(m, { moderatorView: true }),
        type: "match" as const,
        from: m.fromUser,
        to: m.toUser,
      })),
    });
  }

  const [messages, staffMessages] = await Promise.all([
    prisma.message.findMany({
      orderBy: { createdAt: "desc" },
      take,
      include: {
        fromUser: { select: { id: true, firstName: true, email: true, role: true } },
        toUser: { select: { id: true, firstName: true, email: true, role: true } },
      },
    }),
    prisma.staffMessage.findMany({
      orderBy: { createdAt: "desc" },
      take,
      include: {
        fromUser: { select: { id: true, firstName: true, email: true, role: true } },
        toUser: { select: { id: true, firstName: true, email: true, role: true } },
      },
    }),
  ]);

  type Thread = {
    threadKey: string;
    type: "match" | "staff";
    userA: { id: string; firstName: string; email: string; role: string };
    userB: { id: string; firstName: string; email: string; role: string };
    messageCount: number;
    lastMessage: string;
    lastAt: string;
  };

  const threadMap = new Map<string, Thread>();

  function addToThread(
    msgType: "match" | "staff",
    from: { id: string; firstName: string; email: string; role: string },
    to: { id: string; firstName: string; email: string; role: string },
    content: string,
    deletedAt: Date | null,
    createdAt: Date
  ) {
    const pair = threadPairKey(from.id, to.id);
    const [aId, bId] = pair.split(":");
    const key = `${msgType}:${pair}`;
    const userA = from.id === aId ? from : to;
    const userB = from.id === bId ? from : to;

    const existing = threadMap.get(key);
    if (!existing) {
      threadMap.set(key, {
        threadKey: key,
        type: msgType,
        userA,
        userB,
        messageCount: 1,
        lastMessage: buildThreadPreview(content, deletedAt),
        lastAt: createdAt.toISOString(),
      });
    } else {
      existing.messageCount += 1;
    }
  }

  for (const m of messages) {
    addToThread("match", m.fromUser, m.toUser, m.content, m.deletedAt, m.createdAt);
  }
  for (const m of staffMessages) {
    addToThread("staff", m.fromUser, m.toUser, m.content, m.deletedAt, m.createdAt);
  }

  const threads = Array.from(threadMap.values()).sort(
    (a, b) => new Date(b.lastAt).getTime() - new Date(a.lastAt).getTime()
  );

  return NextResponse.json({ threads });
}
