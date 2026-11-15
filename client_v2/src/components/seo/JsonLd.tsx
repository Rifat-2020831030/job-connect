interface RootJsonLdProps {
  baseUrl: string;
}

export function generateRootSchemas(baseUrl: string) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${baseUrl}/#website`,
        url: baseUrl,
        name: "ChakriLagbe",
        description:
          "Explore and get notified about verified tech jobs in Bangladesh under one platform.",
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${baseUrl}/jobs?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "Organization",
        "@id": `${baseUrl}/#organization`,
        name: "ChakriLagbe",
        url: baseUrl,
        logo: {
          "@type": "ImageObject",
          url: `${baseUrl}/logo.png`,
        },
        description:
          "ChakriLagbe is a tech and software related job aggregator that automatically curates, lists and notifies about verified job postings from top technology companies and startups in Bangladesh.",
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "customer support",
          availableLanguage: ["English", "Bengali"],
        },
      },
    ],
  };
}

export default function RootJsonLd({ baseUrl }: RootJsonLdProps) {
  const schema = generateRootSchemas(baseUrl);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
