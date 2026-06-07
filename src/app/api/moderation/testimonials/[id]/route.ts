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
  const { action } = await req.json();

  if (!["APPROVED", "REJECTED"].includes(action)) {
    return NextResponse.json({ error: "Action invalide" }, { status: 400 });
  }

  const testimonial = await prisma.profileTestimonial.update({
    where: { id },
    data: {
      status: action,
      moderatedAt: new Date(),
      moderatedById: session!.user!.id,
    },
  });

  return NextResponse.json(testimonial);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, status } = await requireModerator();
  if (error) return NextResponse.json({ error }, { status });

  const { id } = await params;
  await prisma.profileTestimonial.delete({ where: { id } }).catch(() => null);
  return NextResponse.json({ success: true });
}
