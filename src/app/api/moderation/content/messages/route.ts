import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireModerator } from "@/lib/api-auth";

export async function GET(req: Request) {
  const { error, status } = await requireModerator();
  if (error) return NextResponse.json({ error }, { status });

  const { searchParams } = new URL(req.url);
  const take = Math.min(100, parseInt(searchParams.get("limit") ?? "50", 10));

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
      take: Math.floor(take / 2),
      include: {
        fromUser: { select: { id: true, firstName: true, email: true, role: true } },
        toUser: { select: { id: true, firstName: true, email: true, role: true } },
      },
    }),
  ]);

  return NextResponse.json({
    messages: [
      ...messages.map((m) => ({
        id: m.id,
        type: "match" as const,
        content: m.content,
        createdAt: m.createdAt,
        from: m.fromUser,
        to: m.toUser,
      })),
      ...staffMessages.map((m) => ({
        id: m.id,
        type: "staff" as const,
        content: m.content,
        createdAt: m.createdAt,
        from: m.fromUser,
        to: m.toUser,
      })),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
  });
}
