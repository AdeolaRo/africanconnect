import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireModerator } from "@/lib/api-auth";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error, status } = await requireModerator();
  if (error) return NextResponse.json({ error }, { status });

  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") ?? "match";

  if (type === "staff") {
    await prisma.staffMessage.delete({ where: { id } }).catch(() => null);
  } else {
    await prisma.message.delete({ where: { id } }).catch(() => null);
  }

  return NextResponse.json({ success: true });
}
