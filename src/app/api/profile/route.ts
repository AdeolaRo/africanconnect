import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateCompletion, isProfileComplete } from "@/lib/questions";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
      include: {
        user: { select: { firstName: true, email: true } },
        photos: { orderBy: { order: "asc" } },
      },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profil introuvable" }, { status: 404 });
    }

    const { secretAnswer: _, ...safe } = profile;
    return NextResponse.json(safe);
  } catch (err) {
    console.error("Erreur GET profil:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé — reconnectez-vous" }, { status: 401 });
    }

    const body = await req.json();
    const completionPct = calculateCompletion(body);
    const completed = isProfileComplete(body);

    const qualities = Array.isArray(body.qualities)
      ? JSON.stringify(body.qualities)
      : body.qualities;

    const interests = Array.isArray(body.interests)
      ? JSON.stringify(body.interests)
      : body.interests;

    const existing = await prisma.profile.findUnique({ where: { userId: session.user.id } });

    let hashedSecret = existing?.secretAnswer ?? null;
    if (body.secretAnswer && String(body.secretAnswer).trim()) {
      hashedSecret = await bcrypt.hash(String(body.secretAnswer).trim(), 10);
    }

    const data = {
      gender: body.gender || null,
      seekingGender: body.seekingGender || null,
      age: body.age ? parseInt(String(body.age), 10) : null,
      height: body.height ? parseInt(String(body.height), 10) : null,
      profession: body.profession || null,
      religion: body.religion || null,
      origin: body.origin || null,
      maritalStatus: body.maritalStatus || null,
      location: body.location || null,
      bio: body.bio || null,
      qualities: qualities || null,
      interests: interests || null,
      profileTitle: body.profileTitle || null,
      lookingFor: body.lookingFor || null,
      children: body.children || null,
      alcohol: body.alcohol || null,
      smoking: body.smoking || null,
      pets: body.pets || null,
      secretQuestion: body.secretQuestion || null,
      secretAnswer: hashedSecret,
      seekingAgeMax: body.seekingAgeMax ? parseInt(String(body.seekingAgeMax), 10) : null,
      seekingHeightMax: body.seekingHeightMax ? parseInt(String(body.seekingHeightMax), 10) : null,
      seekingProfession: body.seekingProfession || null,
      seekingReligion: body.seekingReligion || null,
      seekingOrigin: body.seekingOrigin || null,
      seekingMaritalStatus: body.seekingMaritalStatus || null,
      seekingLocation: body.seekingLocation || null,
      completionPct,
      completed,
    };

    const profile = await prisma.profile.upsert({
      where: { userId: session.user.id },
      update: data,
      create: { userId: session.user.id, ...data },
    });

    const { secretAnswer: __, ...safe } = profile;
    return NextResponse.json({ ...safe, hasSecretAnswer: !!profile.secretAnswer });
  } catch (err) {
    console.error("Erreur sauvegarde profil:", err);
    return NextResponse.json(
      { error: "Erreur lors de la sauvegarde. Réessayez ou reconnectez-vous." },
      { status: 500 }
    );
  }
}
