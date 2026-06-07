import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  MAX_PHOTOS,
  MAX_PHOTO_BYTES,
  ALLOWED_PHOTO_TYPES,
} from "@/lib/photos";

export const runtime = "nodejs";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
    include: { photos: { orderBy: { order: "asc" } } },
  });

  return NextResponse.json(profile?.photos ?? []);
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
      include: { photos: true },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });
    }

    if (profile.photos.length >= MAX_PHOTOS) {
      return NextResponse.json(
        { error: `Maximum ${MAX_PHOTOS} photos autorisées` },
        { status: 400 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("photo") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Aucun fichier" }, { status: 400 });
    }

    if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Format accepté : JPG, PNG ou WebP" },
        { status: 400 }
      );
    }

    if (file.size > MAX_PHOTO_BYTES) {
      return NextResponse.json(
        { error: `Taille max : ${MAX_PHOTO_BYTES / 1024 / 1024} Mo` },
        { status: 400 }
      );
    }

    const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads", session.user.id);

    await mkdir(uploadDir, { recursive: true });

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(uploadDir, filename), buffer);

    const url = `/uploads/${session.user.id}/${filename}`;
    const order = profile.photos.length;

    const photo = await prisma.profilePhoto.create({
      data: { profileId: profile.id, url, order },
    });

    if (order === 0) {
      await prisma.profile.update({
        where: { id: profile.id },
        data: { photoUrl: url },
      });
    }

    return NextResponse.json(photo);
  } catch (err) {
    console.error("Upload photo:", err);
    return NextResponse.json({ error: "Erreur upload" }, { status: 500 });
  }
}
