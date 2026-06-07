import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { moderateText, moderationErrorResponse } from "@/lib/content-moderation";
import { canEditMessage, serializeMessageForClient } from "@/lib/message-utils";

async function getOwnedMessage(id: string, userId: string) {
  return prisma.message.findFirst({
    where: { id, fromUserId: userId },
  });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await params;
  const { content } = await req.json();
  if (!content?.trim()) {
    return NextResponse.json({ error: "Message requis" }, { status: 400 });
  }

  const message = await getOwnedMessage(id, session.user.id);
  if (!message) {
    return NextResponse.json({ error: "Message introuvable" }, { status: 404 });
  }
  if (message.deletedAt) {
    return NextResponse.json({ error: "Message déjà supprimé" }, { status: 400 });
  }
  if (!canEditMessage(message.createdAt, message.deletedAt)) {
    return NextResponse.json({ error: "Délai de modification dépassé (15 min)" }, { status: 400 });
  }

  const check = moderateText(content, "message");
  if (!check.allowed) {
    return NextResponse.json(moderationErrorResponse(check), { status: 400 });
  }

  const updated = await prisma.message.update({
    where: { id },
    data: {
      content: content.trim().slice(0, 2000),
      editedAt: new Date(),
      originalContent: message.originalContent ?? message.content,
    },
  });

  return NextResponse.json(serializeMessageForClient(updated));
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await params;
  const message = await getOwnedMessage(id, session.user.id);
  if (!message) {
    return NextResponse.json({ error: "Message introuvable" }, { status: 404 });
  }
  if (message.deletedAt) {
    return NextResponse.json({ success: true });
  }

  const updated = await prisma.message.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  return NextResponse.json(serializeMessageForClient(updated));
}
