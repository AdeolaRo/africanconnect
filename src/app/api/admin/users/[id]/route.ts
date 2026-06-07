import { NextResponse } from "next/server";
import type { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";
import { ROLES } from "@/lib/roles";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, status, session } = await requireAdmin();
  if (error) return NextResponse.json({ error }, { status });

  const { id } = await params;
  const body = await req.json();

  if (id === session!.user!.id && body.isActive === false) {
    return NextResponse.json({ error: "Vous ne pouvez pas désactiver votre propre compte" }, { status: 400 });
  }

  const data: { role?: UserRole; isActive?: boolean } = {};
  if (body.role && Object.values(ROLES).includes(body.role)) {
    data.role = body.role as UserRole;
  }
  if (typeof body.isActive === "boolean") {
    data.isActive = body.isActive;
  }

  const user = await prisma.user.update({
    where: { id },
    data,
    select: { id: true, email: true, firstName: true, role: true, isActive: true },
  });

  return NextResponse.json(user);
}
