import type { Metadata } from "next";
import { Geist, Playfair_Display } from "next/font/google";
import Providers from "@/components/Providers";
import AppBackground from "@/components/AppBackground";
import SiteFooter from "@/components/SiteFooter";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: "AfricanConnect — Rencontres sérieuses & sincères",
  description:
    "Créez votre profil de rencontre en 5 minutes. Découvrez votre compatibilité avant d'envoyer un message. 100% gratuit.",
  metadataBase: new URL("https://africanconnect.online"),
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon", type: "image/png", sizes: "32x32" },
    ],
    apple: [{ url: "/apple-icon", type: "image/png", sizes: "180x180" }],
  },
  openGraph: {
    title: "AfricanConnect — Rencontres sérieuses & sincères",
    description: "Profil d'abord, photo après le match. 100% gratuit.",
    siteName: "AfricanConnect",
    locale: "fr_FR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${geistSans.variable} ${playfair.variable} h-full antialiased`}>
      <body className="relative min-h-full flex flex-col text-warm">
        <AppBackground />
        <Providers>
          <div className="flex min-h-full flex-1 flex-col">
            {children}
            <SiteFooter />
          </div>
        </Providers>
      </body>
    </html>
  );
}
