import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { toUserId } = await req.json();
    if (!toUserId || toUserId === session.user.id) {
      return NextResponse.json({ error: "Profil invalide" }, { status: 400 });
    }

    await prisma.userPass.upsert({
      where: {
        fromUserId_toUserId: { fromUserId: session.user.id, toUserId },
      },
      update: {},
      create: { fromUserId: session.user.id, toUserId },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Erreur POST pass:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
