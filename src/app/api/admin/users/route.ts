import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";

export async function GET() {
  const { error, status } = await requireAdmin();
  if (error) return NextResponse.json({ error }, { status });

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      email: true,
      firstName: true,
      role: true,
      isActive: true,
      createdAt: true,
      profile: { select: { completed: true, location: true } },
    },
  });

  return NextResponse.json({ users });
}
