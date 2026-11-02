import { logger } from "@/lib/logger";
import { JobDetail } from "@/types/job";
import { cache } from "react";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3010/api";

// 1 hour in seconds
export const JOB_REVALIDATE_SECONDS = 3600;

export async function fetchFeaturedJobs(
  section: "featured" | "engineering" | "leadership"
) {
  try {
    const res = await fetch(
      `${API_BASE_URL}/jobs/featured?section=${section}`,
      {
        next: { revalidate: 3600, tags: ["featured-jobs", "jobs"] },
      }
    );

    if (!res.ok) {
      logger.error(
        { section, statusText: res.statusText },
        "Failed to fetch jobs"
      );
      return [];
    }

    const json = await res.json();
    return json.data || [];
  } catch (error) {
    logger.error({ error, section }, "Error fetching jobs");
    return [];
  }
}

export async function fetchCategories() {
  try {
    const res = await fetch(`${API_BASE_URL}/jobs/categories`, {
      next: { revalidate: 3600, tags: ["categories"] },
    });

    if (!res.ok) {
      logger.error(
        { statusText: res.statusText },
        "Failed to fetch categories"
      );
      return [];
    }

    const json = await res.json();
    return json.data || [];
  } catch (error) {
    logger.error({ error }, "Error fetching categories");
    return [];
  }
}

export async function fetchSiteStats() {
  try {
    const res = await fetch(`${API_BASE_URL}/stat`, {
      next: { revalidate: 3600, tags: ["site-stats"] },
    });

    if (!res.ok) {
      logger.error(
        { statusText: res.statusText },
        "Failed to fetch site stats"
      );
      return null;
    }

    const json = await res.json();
    return json.data || null;
  } catch (error) {
    logger.error({ error }, "Error fetching site stats");
    return null;
  }
}

/**
 * Calculates seconds remaining until the job's expiration date.
 * If expired or invalid, provides a safe fallback revalidation interval.
 */
export function calculateJobRevalidate(
  expiresAt?: string,
  deadline?: string
): number {
  const expiryTarget = expiresAt || deadline;
  if (!expiryTarget) {
    return JOB_REVALIDATE_SECONDS; // Default to 1 hour (3,600s)
  }

  const expiryMs = new Date(expiryTarget).getTime();
  if (isNaN(expiryMs)) {
    return JOB_REVALIDATE_SECONDS;
  }

  const nowMs = Date.now();
  const diffInSeconds = Math.floor((expiryMs - nowMs) / 1000);

  // If already expired, revalidate periodically (e.g. 1 hour)
  if (diffInSeconds <= 0) {
    return 3600;
  }

  // Cap at 1 hour maximum
  return Math.min(JOB_REVALIDATE_SECONDS, Math.max(60, diffInSeconds));
}

export const fetchJobById = cache(async (id: string) => {
  try {
    const res = await fetch(`${API_BASE_URL}/jobs/${id}`, {
      next: {
        revalidate: JOB_REVALIDATE_SECONDS, // 1 hour (3,600 seconds)
        tags: [`job-${id}`, "jobs"],
      },
    });

    if (!res.ok) {
      logger.error(
        { id, statusText: res.statusText },
        "Failed to fetch job by ID"
      );
      return null;
    }

    const json = await res.json();
    return json.data || null;
  } catch (error) {
    logger.error({ error, id }, "Error fetching job by ID");
    return null;
  }
});

export const fetchSimilarJobs = cache(
  async (
    category?: string,
    currentJobId?: string,
    limit = 3
  ): Promise<JobDetail[]> => {
    try {
      const query = new URLSearchParams();
      if (category) query.set("category", category);
      query.set("limit", String(limit + 2));

      const res = await fetch(`${API_BASE_URL}/jobs?${query.toString()}`, {
        next: { revalidate: 3600, tags: ["similar-jobs", "jobs"] },
      });

      const json = await res.json();
      const list: JobDetail[] = json.data?.jobs || json.data || [];
      const filtered = list
        .filter((j) => j._id !== currentJobId)
        .slice(0, limit);

      return filtered;
    } catch {
      console.log("Errors fetching similar jobs");
      return [];
    }
  }
);
