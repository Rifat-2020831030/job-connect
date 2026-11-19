import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://chakrilagbe.vercel.app";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/jobs", "/companies", "/about"],
        disallow: [
          "/api/",
          "/tracker",
          "/preferences",
          "/saved-jobs",
          "/login",
          "/verify",
          "/set-password",
          "/forgot-password",
          "/unsubscribe",
          "/all-set",
        ],
      },
      {
        userAgent: [
          "GPTBot",
          "ChatGPT-User",
          "PerplexityBot",
          "ClaudeBot",
          "Google-Extended",
          "Applebot-Extended",
        ],
        allow: ["/", "/jobs", "/companies", "/about"],
        disallow: [
          "/api/",
          "/tracker",
          "/preferences",
          "/saved-jobs",
          "/login",
          "/verify",
          "/set-password",
          "/forgot-password",
          "/unsubscribe",
          "/all-set",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
