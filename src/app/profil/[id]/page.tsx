"use client";

import { Suspense } from "react";
import ProfilContent from "./ProfilContent";

export default function ProfilPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-warm-muted">Chargement...</div>}>
      <ProfilContent />
    </Suspense>
  );
}
