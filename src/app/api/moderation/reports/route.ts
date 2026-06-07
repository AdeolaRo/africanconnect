import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireModerator } from "@/lib/api-auth";

export async function GET(req: Request) {
  const { error, status } = await requireModerator();
  if (error) return NextResponse.json({ error }, { status });

  const { searchParams } = new URL(req.url);
  const filter = searchParams.get("status") ?? "PENDING";

  const reports = await prisma.contentReport.findMany({
    where: filter === "ALL" ? {} : { status: filter as "PENDING" | "RESOLVED" | "DISMISSED" },
    include: {
      reporter: { select: { firstName: true, email: true } },
      resolvedBy: { select: { firstName: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json({ reports });
}

