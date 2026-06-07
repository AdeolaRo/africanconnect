import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { getTermsDocument, saveTermsDocument } from "@/lib/site-documents";

export async function GET() {
  const { error, status } = await requireAdmin();
  if (error) return NextResponse.json({ error }, { status });

  const doc = await getTermsDocument();
  return NextResponse.json(doc);
}

export async function PUT(req: Request) {
  const { error, status, session } = await requireAdmin();
  if (error) return NextResponse.json({ error }, { status });

  const { title, content } = await req.json();
  if (!content?.trim() || !title?.trim()) {
    return NextResponse.json({ error: "Titre et contenu requis" }, { status: 400 });
  }

  try {
    const doc = await saveTermsDocument({
      title,
      content,
      updatedById: session!.user!.id,
    });
    return NextResponse.json(doc);
  } catch (err) {
    console.error("PUT terms:", err);
    return NextResponse.json(
      { error: "Impossible de sauvegarder — relancez le serveur (prisma generate)" },
      { status: 500 }
    );
  }
}
