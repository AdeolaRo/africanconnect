"use client";

import { useEffect, useState } from "react";
import { Download, Share, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isIos() {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isStandalone() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator && (navigator as Navigator & { standalone?: boolean }).standalone)
  );
}

export default function PwaProvider() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [iosHint, setIosHint] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isStandalone()) return;

    const dismissedAt = localStorage.getItem("pwa-install-dismissed");
    if (dismissedAt && Date.now() - Number(dismissedAt) < 7 * 24 * 60 * 60 * 1000) {
      setDismissed(true);
    }

    const onInstall = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", onInstall);

    if (isIos() && !isStandalone()) {
      const shown = sessionStorage.getItem("pwa-ios-hint");
      if (!shown) setIosHint(true);
    }

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    return () => window.removeEventListener("beforeinstallprompt", onInstall);
  }, []);

  function dismiss() {
    setDismissed(true);
    setIosHint(false);
    localStorage.setItem("pwa-install-dismissed", String(Date.now()));
    sessionStorage.setItem("pwa-ios-hint", "1");
  }

  async function install() {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
    dismiss();
  }

  if (dismissed || isStandalone()) return null;

  if (iosHint) {
    return (
      <div className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom))] left-3 right-3 z-50 md:bottom-4 md:left-auto md:right-4 md:max-w-sm">
        <div className="rounded-2xl border border-rose/20 bg-white p-4 shadow-lg shadow-rose/10">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold text-warm">Installer AfricanConnect</p>
              <p className="mt-1 text-sm text-warm-muted">
                Sur iPhone : touchez <Share className="inline h-4 w-4" /> puis « Sur l&apos;écran d&apos;accueil ».
              </p>
            </div>
            <button type="button" onClick={dismiss} className="shrink-0 text-warm-muted hover:text-rose" aria-label="Fermer">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!deferred) return null;

  return (
    <div className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom))] left-3 right-3 z-50 md:bottom-4 md:left-auto md:right-4 md:max-w-sm">
      <div className="flex items-center gap-3 rounded-2xl border border-rose/20 bg-white p-4 shadow-lg shadow-rose/10">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl gradient-pulse text-white">
          <Download className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-warm">Installer l&apos;application</p>
          <p className="text-xs text-warm-muted">Accès rapide depuis votre écran d&apos;accueil</p>
        </div>
        <button
          type="button"
          onClick={install}
          className="shrink-0 rounded-full gradient-pulse px-4 py-2 text-xs font-semibold text-white"
        >
          Installer
        </button>
        <button type="button" onClick={dismiss} className="shrink-0 text-warm-muted hover:text-rose" aria-label="Fermer">
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
