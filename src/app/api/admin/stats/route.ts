import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";

export async function GET() {
  const { error, status } = await requireAdmin();
  if (error) return NextResponse.json({ error }, { status });

  const [users, profiles, matches, messages, reports, visits] = await Promise.all([
    prisma.user.count(),
    prisma.profile.count({ where: { completed: true } }),
    prisma.interest.count({ where: { status: "ACCEPTED" } }),
    prisma.message.count(),
    prisma.contentReport.count({ where: { status: "PENDING" } }),
    prisma.profileVisit.count(),
  ]);

  const byRole = await prisma.user.groupBy({ by: ["role"], _count: true });

  return NextResponse.json({
    users,
    profiles,
    matches,
    messages,
    pendingReports: reports,
    visits,
    byRole: Object.fromEntries(byRole.map((r) => [r.role, r._count])),
  });
}
