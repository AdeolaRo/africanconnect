import { NextResponse } from "next/server";
import { unlink } from "fs/promises";
import path from "path";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = await params;

    const photo = await prisma.profilePhoto.findUnique({
      where: { id },
      include: { profile: true },
    });

    if (!photo || photo.profile.userId !== session.user.id) {
      return NextResponse.json({ error: "Photo introuvable" }, { status: 404 });
    }

    const filePath = path.join(process.cwd(), "public", photo.url);
    try {
      await unlink(filePath);
    } catch {
      // fichier déjà absent
    }

    await prisma.profilePhoto.delete({ where: { id } });

    const remaining = await prisma.profilePhoto.findMany({
      where: { profileId: photo.profileId },
      orderBy: { order: "asc" },
    });

    for (let i = 0; i < remaining.length; i++) {
      await prisma.profilePhoto.update({
        where: { id: remaining[i].id },
        data: { order: i },
      });
    }

    await prisma.profile.update({
      where: { id: photo.profileId },
      data: { photoUrl: remaining[0]?.url ?? null },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delete photo:", err);
    return NextResponse.json({ error: "Erreur suppression" }, { status: 500 });
  }
}
