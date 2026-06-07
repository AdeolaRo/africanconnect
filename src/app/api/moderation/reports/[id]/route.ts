import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireModerator } from "@/lib/api-auth";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, status, session } = await requireModerator();
  if (error) return NextResponse.json({ error }, { status });

  const { id } = await params;
  const { action, resolution } = await req.json();

  if (!["RESOLVED", "DISMISSED"].includes(action)) {
    return NextResponse.json({ error: "Action invalide" }, { status: 400 });
  }

  const report = await prisma.contentReport.update({
    where: { id },
    data: {
      status: action,
      resolution: resolution || null,
      resolvedById: session!.user!.id,
    },
  });

  if (action === "RESOLVED" && report.targetUserId) {
    await prisma.user.update({
      where: { id: report.targetUserId },
      data: { isActive: false },
    }).catch(() => {});
  }

  return NextResponse.json(report);
}
