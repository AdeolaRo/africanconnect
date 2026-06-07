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
      isActive: true,
      ...(q
        ? {
            OR: [
              { firstName: { contains: q } },
              { email: { contains: q } },
            ],
          }
        : {}),
    },
    orderBy: { firstName: "asc" },
    take: 50,
    select: { id: true, email: true, firstName: true, role: true },
  });

  return NextResponse.json({ users });
}
