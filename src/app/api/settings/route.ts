import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
    select: {
      discoverVisible: true,
      gender: true,
      seekingGender: true,
      seekingAgeMax: true,
      seekingHeightMax: true,
      seekingLocation: true,
      seekingOrigin: true,
      seekingMaritalStatus: true,
      seekingProfession: true,
      seekingReligion: true,
      interests: true,
      lookingFor: true,
    },
  });

  if (!profile) {
    return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });
  }

  return NextResponse.json(profile);
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const body = await req.json();
  const data: Record<string, unknown> = {};

  if (typeof body.discoverVisible === "boolean") {
    data.discoverVisible = body.discoverVisible;
  }
  if (body.seekingGender !== undefined) data.seekingGender = body.seekingGender || null;
  if (body.seekingAgeMax !== undefined) {
    data.seekingAgeMax = body.seekingAgeMax ? parseInt(String(body.seekingAgeMax), 10) : null;
  }
  if (body.seekingHeightMax !== undefined) {
    data.seekingHeightMax = body.seekingHeightMax ? parseInt(String(body.seekingHeightMax), 10) : null;
  }
  if (body.seekingLocation !== undefined) data.seekingLocation = body.seekingLocation || null;
  if (body.seekingOrigin !== undefined) data.seekingOrigin = body.seekingOrigin || null;
  if (body.seekingMaritalStatus !== undefined) data.seekingMaritalStatus = body.seekingMaritalStatus || null;
  if (body.seekingProfession !== undefined) data.seekingProfession = body.seekingProfession || null;
  if (body.seekingReligion !== undefined) data.seekingReligion = body.seekingReligion || null;
  if (body.lookingFor !== undefined) data.lookingFor = body.lookingFor || null;

  const profile = await prisma.profile.update({
    where: { userId: session.user.id },
    data,
    select: {
      discoverVisible: true,
      seekingGender: true,
      seekingAgeMax: true,
      seekingHeightMax: true,
      seekingLocation: true,
      seekingOrigin: true,
      seekingMaritalStatus: true,
      seekingProfession: true,
      seekingReligion: true,
      lookingFor: true,
    },
  });

  return NextResponse.json(profile);
}
