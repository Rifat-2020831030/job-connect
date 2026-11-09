import { MetadataRoute } from "next";
import { API_BASE_URL } from "@/lib/api";

export const revalidate = 3600; // revalidate sitemap every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://chakrilagbe.vercel.app";

  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/jobs`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/companies`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  let jobEntries: MetadataRoute.Sitemap = [];
  let companyEntries: MetadataRoute.Sitemap = [];

  try {
    const jobsRes = await fetch(
      `${API_BASE_URL}/jobs?limit=100&status=active`,
      {
        next: { revalidate: 3600 },
        signal: AbortSignal.timeout(5000),
      }
    );
    if (jobsRes.ok) {
      const json = await jobsRes.json();
      const jobs = Array.isArray(json.data) ? json.data : [];
      jobEntries = jobs
        .filter((job: any) => Boolean(job && job._id))
        .map((job: any) => ({
          url: `${baseUrl}/jobs/${job._id}`,
          lastModified: job.first_seen ? new Date(job.first_seen) : new Date(),
          changeFrequency: "daily" as const,
          priority: 0.8,
        }));
    }
  } catch {
    // Gracefully fallback to static sitemap if backend is offline during build
  }

  try {
    const compRes = await fetch(`${API_BASE_URL}/companies?limit=100`, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(5000),
    });
    if (compRes.ok) {
      const json = await compRes.json();
      const companies = Array.isArray(json.data) ? json.data : [];
      companyEntries = companies
        .filter((comp: any) => Boolean(comp && comp._id))
        .map((comp: any) => ({
          url: `${baseUrl}/companies/${comp._id}`,
          lastModified: new Date(),
          changeFrequency: "weekly" as const,
          priority: 0.7,
        }));
    }
  } catch {
    // Gracefully fallback to static sitemap if backend is offline during build
  }

  return [...staticEntries, ...jobEntries, ...companyEntries];
}
