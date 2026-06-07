import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireModerator } from "@/lib/api-auth";
import { ROLES } from "@/lib/roles";

export async function GET(req: Request) {
  const { error, status, session } = await requireModerator();
  if (error) return NextResponse.json({ error }, { status });

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const myId = session!.user!.id;

  const searchFilter = q
    ? {
        OR: [{ firstName: { contains: q } }, { email: { contains: q } }],
      }
    : {};

  const [team, members] = await Promise.all([
    prisma.user.findMany({
      where: {
        role: { in: [ROLES.ADMIN, ROLES.MODERATOR] },
        isActive: true,
        id: { not: myId },
        ...searchFilter,
      },
      orderBy: [{ role: "asc" }, { firstName: "asc" }],
      take: 20,
      select: { id: true, email: true, firstName: true, role: true },
    }),
    prisma.user.findMany({
      where: {
        role: ROLES.USER,
        isActive: true,
        ...searchFilter,
      },
      orderBy: { firstName: "asc" },
      take: 30,
      select: { id: true, email: true, firstName: true, role: true },
    }),
  ]);

  return NextResponse.json({ users: [...team, ...members], team, members });
}
