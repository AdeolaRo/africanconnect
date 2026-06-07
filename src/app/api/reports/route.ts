import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";

export async function POST(req: Request) {
  const session = await requireAuth();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await req.json();
  const { targetType, targetId, targetUserId, reason, details } = body;

  if (!targetType || !targetId || !reason) {
    return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });
  }

  const report = await prisma.contentReport.create({
    data: {
      reporterId: session.user.id,
      targetType,
      targetId,
      targetUserId: targetUserId || null,
      reason,
      details: details || null,
    },
  });

  return NextResponse.json(report);
}
