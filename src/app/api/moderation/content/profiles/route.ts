import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireModerator } from "@/lib/api-auth";

export async function GET(req: Request) {
  const { error, status } = await requireModerator();
  if (error) return NextResponse.json({ error }, { status });

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() ?? "";

  const users = await prisma.user.findMany({
    where: {
      role: "USER",
      ...(q
        ? { OR: [{ firstName: { contains: q } }, { email: { contains: q } }] }
        : {}),
    },
    orderBy: { updatedAt: "desc" },
    take: 50,
    select: {
      id: true,
      email: true,
      firstName: true,
      isActive: true,
      createdAt: true,
      profile: {
        select: {
          bio: true,
          profileTitle: true,
          location: true,
          profession: true,
          discoverVisible: true,
          completed: true,
          verified: true,
        },
      },
    },
  });

  const reportedProfiles = await prisma.contentReport.findMany({
    where: { targetType: "PROFILE", status: "PENDING" },
    select: { targetUserId: true },
  });
  const flaggedIds = new Set(reportedProfiles.map((r) => r.targetUserId).filter(Boolean));

  return NextResponse.json({
    profiles: users.map((u) => ({
      ...u,
      flagged: flaggedIds.has(u.id),
    })),
  });
}
