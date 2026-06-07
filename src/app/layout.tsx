import type { Metadata, Viewport } from "next";
import { Geist, Playfair_Display } from "next/font/google";
import Providers from "@/components/Providers";
import AppBackground from "@/components/AppBackground";
import SiteFooter from "@/components/SiteFooter";
import { DEFAULT_DESCRIPTION, DEFAULT_KEYWORDS, SITE_NAME, absoluteUrl } from "@/lib/seo";
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
  metadataBase: new URL(absoluteUrl("")),
  title: {
    default: `${SITE_NAME} — Rencontres sérieuses & sincères`,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  keywords: DEFAULT_KEYWORDS,
  authors: [{ name: SITE_NAME, url: absoluteUrl("") }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "Rencontres",
  alternates: {
    canonical: absoluteUrl(""),
    languages: { "fr-FR": absoluteUrl("") },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon", type: "image/png", sizes: "32x32" },
    ],
    apple: [{ url: "/apple-icon", type: "image/png", sizes: "180x180" }],
  },
  openGraph: {
    title: `${SITE_NAME} — Rencontres sérieuses & sincères`,
    description: DEFAULT_DESCRIPTION,
    url: absoluteUrl(""),
    siteName: SITE_NAME,
    locale: "fr_FR",
    type: "website",
    images: [
      {
        url: absoluteUrl("/images/hero.jpg"),
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} — Rencontres sérieuses`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Rencontres sérieuses`,
    description: DEFAULT_DESCRIPTION,
    images: [absoluteUrl("/images/hero.jpg")],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: SITE_NAME,
  },
  applicationName: SITE_NAME,
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#e8195a" },
    { media: "(prefers-color-scheme: dark)", color: "#6b1d5c" },
  ],
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
          <div className="flex min-h-full flex-1 flex-col has-mobile-nav">
            {children}
            <SiteFooter />
          </div>
        </Providers>
      </body>
    </html>
  );
}
