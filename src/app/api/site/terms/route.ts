import { NextResponse } from "next/server";
import { getTermsDocument } from "@/lib/site-documents";

export async function GET() {
  const doc = await getTermsDocument();
  return NextResponse.json({
    title: doc.title,
    content: doc.content,
    version: doc.version,
    updatedAt: doc.updatedAt,
  });
}
