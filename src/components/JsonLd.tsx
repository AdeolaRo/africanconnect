import { absoluteUrl, SITE_NAME, DEFAULT_DESCRIPTION } from "@/lib/seo";

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: absoluteUrl(""),
  logo: absoluteUrl("/icon.svg"),
  description: DEFAULT_DESCRIPTION,
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer support",
    email: "contact@africanconnect.online",
    availableLanguage: ["French"],
  },
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: absoluteUrl(""),
  description: DEFAULT_DESCRIPTION,
  inLanguage: "fr-FR",
};

const webAppJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: SITE_NAME,
  url: absoluteUrl(""),
  applicationCategory: "SocialNetworkingApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "EUR",
    description: "Inscription et parcours de base gratuits au lancement",
  },
  description: DEFAULT_DESCRIPTION,
};

export default function JsonLd() {
  const blocks = [organizationJsonLd, websiteJsonLd, webAppJsonLd];

  return (
    <>
      {blocks.map((data) => (
        <script
          key={data["@type"]}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
      ))}
    </>
  );
}
