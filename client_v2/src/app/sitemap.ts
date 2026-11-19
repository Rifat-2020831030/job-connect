import { API_BASE_URL } from "@/lib/api";
import { MetadataRoute } from "next";

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

  const jobEntries: MetadataRoute.Sitemap = [];
  const companyEntries: MetadataRoute.Sitemap = [];

  try {
    let page = 1;
    let totalPages = 1;
    do {
      const jobsRes = await fetch(
        `${API_BASE_URL}/jobs?limit=100&status=active&page=${page}`,
        {
          next: { revalidate: 3600 },
          signal: AbortSignal.timeout(5000),
        }
      );

      if (!jobsRes.ok)
        throw new Error(`Jobs request failed: ${jobsRes.status}`);

      const jobResponse = await jobsRes.json();
      const jobs = Array.isArray(jobResponse.data) ? jobResponse.data : [];

      jobEntries.push(
        ...jobs
          .filter((job: any) => Boolean(job && job._id))
          .map((job: any) => ({
            url: `${baseUrl}/jobs/${job._id}`,
            lastModified: job.first_seen
              ? new Date(job.first_seen)
              : new Date(),
            changeFrequency: "daily" as const,
            priority: 0.8,
          }))
      );

      totalPages = Number.isInteger(jobResponse.totalPages)
        ? jobResponse.totalPages
        : 0;
      page++;
    } while (page <= totalPages);
  } catch (error) {
    console.error("Failed to fetch sitemap jobs", error);
  }

  try {
    let cursor: string | null = null;
    const seenCursors = new Set<string>();

    do {
      const params = new URLSearchParams({ limit: "100" });
      if (cursor) params.set("cursor", cursor);

      const compRes = await fetch(`${API_BASE_URL}/companies?${params}`, {
        next: { revalidate: 3600 },
        signal: AbortSignal.timeout(5000),
      });

      if (!compRes.ok)
        throw new Error(`Companies request failed: ${compRes.status}`);
      const companyResponse = await compRes.json();
      const companies = Array.isArray(companyResponse.data)
        ? companyResponse.data
        : [];

      companyEntries.push(
        ...companies
          .filter((comp: any) => Boolean(comp && comp._id))
          .map((comp: any) => ({
            url: `${baseUrl}/companies/${comp._id}`,
            lastModified: new Date(),
            changeFrequency: "weekly" as const,
            priority: 0.7,
          }))
      );

      cursor =
        typeof companyResponse.nextCursor === "string" &&
        companyResponse.nextCursor
          ? companyResponse.nextCursor
          : null;

      if (cursor && seenCursors.has(cursor))
        throw new Error("Repeated company cursor");
      if (cursor) seenCursors.add(cursor);
    } while (cursor);
  } catch (error) {
    console.error("Failed to fetch sitemap companies", error);
  }

  return [...staticEntries, ...jobEntries, ...companyEntries];
}
