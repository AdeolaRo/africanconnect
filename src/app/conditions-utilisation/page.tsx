import Header from "@/components/Header";
import { getTermsDocument } from "@/lib/site-documents";
import { FileText } from "lucide-react";

export default async function ConditionsPage() {
  const doc = await getTermsDocument();

  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl flex-1 px-4 py-12">
        <div className="mb-8 flex items-center gap-3">
          <FileText className="h-7 w-7 text-plum" />
          <div>
            <h1 className="font-serif text-3xl font-bold text-warm">{doc.title}</h1>
            <p className="text-sm text-warm-muted">
              Version {doc.version} · Mise à jour le{" "}
              {new Date(doc.updatedAt).toLocaleDateString("fr-FR")}
            </p>
          </div>
        </div>

        <article className="rounded-2xl border border-rose/15 bg-white/90 p-6 shadow-sm md:p-8">
          <div className="whitespace-pre-wrap text-sm leading-relaxed text-warm-muted">
            {doc.content}
          </div>
        </article>
      </main>
    </>
  );
}
