import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { userId: partnerId } = await params;
    const myId = session.user.id;

    const pending = await prisma.interest.findUnique({
      where: { fromUserId_toUserId: { fromUserId: myId, toUserId: partnerId } },
    });

    if (pending?.status === "PENDING") {
      await prisma.interest.delete({ where: { id: pending.id } });
      return NextResponse.json({ success: true, cancelled: true });
    }

    const match = await prisma.interest.findFirst({
      where: {
        status: "ACCEPTED",
        OR: [
          { fromUserId: myId, toUserId: partnerId },
          { fromUserId: partnerId, toUserId: myId },
        ],
      },
    });

    if (!match) {
      return NextResponse.json({ error: "Aucun match trouvé" }, { status: 404 });
    }

    await prisma.$transaction([
      prisma.message.deleteMany({
        where: {
          OR: [
            { fromUserId: myId, toUserId: partnerId },
            { fromUserId: partnerId, toUserId: myId },
          ],
        },
      }),
      prisma.interest.deleteMany({
        where: {
          OR: [
            { fromUserId: myId, toUserId: partnerId },
            { fromUserId: partnerId, toUserId: myId },
          ],
        },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Erreur DELETE match:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
