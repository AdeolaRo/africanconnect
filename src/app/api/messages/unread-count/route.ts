import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isStaff } from "@/lib/roles";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const myId = session.user.id;
  const staff = isStaff(session.user.role);

  const staffUnread = await prisma.staffMessage.count({
    where: { toUserId: myId, read: false },
  });

  if (staff) {
    return NextResponse.json({
      total: staffUnread,
      matches: 0,
      staff: staffUnread,
    });
  }

  const matchesUnread = await prisma.message.count({
    where: { toUserId: myId, read: false },
  });

  return NextResponse.json({
    total: matchesUnread + staffUnread,
    matches: matchesUnread,
    staff: staffUnread,
  });
}
