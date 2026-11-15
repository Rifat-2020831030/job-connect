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


export interface JobsApiResponse {
  status: number;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  data: any[];
}

export async function fetchJobsList(
  params: Record<string, string>
): Promise<JobsApiResponse> {
  try {
    const search = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE_URL}/jobs?${search}`, {
      next: { revalidate: 60, tags: ["jobs-list"] },
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) {
      return {
        status: 0,
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 1,
        data: [],
      };
    }

    const json = await res.json();
    return json;
  } catch (error) {
    logger.error({ error }, "Error fetching jobs list");
    return {
      status: 0,
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 1,
      data: [],
    };
  }
}

export async function fetchJobsFilterOptions() {
  try {
    const [optRes, catRes] = await Promise.all([
      fetch(`${API_BASE_URL}/jobs/filter-options`, {
        next: { revalidate: 3600, tags: ["filter-options"] },
        signal: AbortSignal.timeout(5000),
      }),
      fetch(`${API_BASE_URL}/jobs/categories`, {
        next: { revalidate: 3600, tags: ["categories"] },
        signal: AbortSignal.timeout(5000),
      }),
    ]);

    const optData = optRes.ok ? await optRes.json() : null;
    const catData = catRes.ok ? await catRes.json() : null;

    return {
      categories:
        catData?.status === 1 && Array.isArray(catData.data)
          ? catData.data.map((c: any) => ({
              value: c.label || c.category,
              count: c.count,
            }))
          : [],
      experienceLevels:
        optData?.status === 1 ? optData.data?.experienceLevels || [] : [],
      jobTypes: optData?.status === 1 ? optData.data?.jobTypes || [] : [],
      topCompanies:
        optData?.status === 1 ? optData.data?.topCompanies || [] : [],
    };
  } catch (error) {
    logger.error({ error }, "Error fetching filter options");
    return {
      categories: [],
      experienceLevels: [],
      jobTypes: [],
      topCompanies: [],
    };
  }
}
