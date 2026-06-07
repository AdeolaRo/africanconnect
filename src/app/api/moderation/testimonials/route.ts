import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireModerator } from "@/lib/api-auth";

export async function GET(req: Request) {
  const { error, status } = await requireModerator();
  if (error) return NextResponse.json({ error }, { status });

  const { searchParams } = new URL(req.url);
  const filter = searchParams.get("status") ?? "PENDING";

  const testimonials = await prisma.profileTestimonial.findMany({
    where: filter === "ALL" ? {} : { status: filter as "PENDING" | "APPROVED" | "REJECTED" },
    include: {
      author: { select: { firstName: true, email: true } },
      target: { select: { firstName: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json({
    testimonials: testimonials.map((t) => ({
      id: t.id,
      content: t.content,
      rating: t.rating,
      status: t.status,
      publishAt: t.publishAt,
      createdAt: t.createdAt,
      authorName: t.author.firstName,
      authorEmail: t.author.email,
      targetName: t.target.firstName,
    })),
  });
}
