import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getTermsDocument } from "@/lib/site-documents";

const schema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Minimum 6 caractères"),
  firstName: z.string().min(2, "Prénom requis"),
  acceptTerms: z.literal(true, { message: "Acceptation des conditions requise" }),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = schema.parse(body);

    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      return NextResponse.json({ error: "Cet email est déjà utilisé" }, { status: 400 });
    }

    const hashed = await bcrypt.hash(data.password, 10);
    const terms = await getTermsDocument();
    const now = new Date();

    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashed,
        firstName: data.firstName,
        path: "SERIOUS",
        termsAcceptedAt: now,
        termsVersion: terms.version,
        profile: { create: {} },
      },
    });

    return NextResponse.json({ id: user.id, email: user.email });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
