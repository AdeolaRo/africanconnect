import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireModerator } from "@/lib/api-auth";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { error, status } = await requireModerator();
  if (error) return NextResponse.json({ error }, { status });

  const { userId } = await params;
  const { action } = await req.json();

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (!user || user.role !== "USER") {
    return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });
  }

  switch (action) {
    case "clear_bio":
      await prisma.profile.updateMany({
        where: { userId },
        data: { bio: null, profileTitle: null },
      });
      break;
    case "hide_discover":
      await prisma.profile.updateMany({
        where: { userId },
        data: { discoverVisible: false },
      });
      break;
    case "deactivate":
      await prisma.user.update({
        where: { id: userId },
        data: { isActive: false },
      });
      await prisma.profile.updateMany({
        where: { userId },
        data: { discoverVisible: false },
      });
      break;
    case "reactivate":
      await prisma.user.update({
        where: { id: userId },
        data: { isActive: true },
      });
      break;
    default:
      return NextResponse.json({ error: "Action invalide" }, { status: 400 });
  }

  return NextResponse.json({ success: true, action });
}
