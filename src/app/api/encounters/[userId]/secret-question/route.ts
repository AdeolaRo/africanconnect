import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { normalizePair } from "@/lib/trust";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { userId: partnerId } = await params;

    const match = await prisma.interest.findFirst({
      where: {
        status: "ACCEPTED",
        OR: [
          { fromUserId: session.user.id, toUserId: partnerId },
          { fromUserId: partnerId, toUserId: session.user.id },
        ],
      },
    });

    if (!match) {
      return NextResponse.json({ error: "Match mutuel requis" }, { status: 403 });
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: partnerId },
      select: { secretQuestion: true },
    });

    if (!profile?.secretQuestion) {
      return NextResponse.json({ error: "Cette personne n'a pas configuré de question secrète" }, { status: 404 });
    }

    return NextResponse.json({ secretQuestion: profile.secretQuestion });
  } catch (err) {
    console.error("Erreur secret question:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
