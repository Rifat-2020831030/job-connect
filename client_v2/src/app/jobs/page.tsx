import type { Metadata } from "next";
import Footer from "@/components/Footer";
import JobsClient from "@/components/JobsClient";
import { fetchJobsFilterOptions, fetchJobsList } from "@/lib/api";

interface JobsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({
  searchParams,
}: JobsPageProps): Promise<Metadata> {
  const params = await searchParams;
  const categoryRaw = params.category;
  const categoryStr = Array.isArray(categoryRaw)
    ? categoryRaw.filter(Boolean).join(", ")
    : typeof categoryRaw === "string"
    ? categoryRaw
    : undefined;

  const title = categoryStr
    ? `Browse tech jobs in bd | ${categoryStr}`
    : "Browse tech jobs in bd";

  return {
    title,
    description:
      "Browse active software engineering, developer, AI/ML, DevOps, and tech jobs across top companies in Bangladesh.",
    alternates: {
      canonical: "/jobs",
    },
    openGraph: {
      title: `${title} | chakrilagbe`,
      description:
        "Browse active software engineering, developer, AI/ML, DevOps, and tech jobs across top companies in Bangladesh.",
      url: "/jobs",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | chakrilagbe`,
      description:
        "Browse active software engineering, developer, AI/ML, DevOps, and tech jobs across top companies in Bangladesh.",
    },
  };
}

export default async function JobsPage({ searchParams }: JobsPageProps) {
  const params = await searchParams;

  const page =
    parseInt(
      typeof params.page === "string"
        ? params.page
        : Array.isArray(params.page)
        ? params.page[0]
        : "1",
      10
    ) || 1;

  const sort =
    typeof params.sort === "string"
      ? params.sort
      : Array.isArray(params.sort)
      ? params.sort[0]
      : "recent";

  const q =
    typeof params.q === "string"
      ? params.q
      : Array.isArray(params.q)
      ? params.q[0]
      : "";

  const location =
    typeof params.location === "string"
      ? params.location
      : Array.isArray(params.location)
      ? params.location[0]
      : "";

  const parseArrayParam = (param: string | string[] | undefined): string[] => {
    if (!param) return [];
    if (Array.isArray(param)) return param.filter(Boolean);
    return param
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  };

  const category = parseArrayParam(params.category);
  const experience_level = parseArrayParam(params.experience_level);
  const job_type = parseArrayParam(params.job_type);
  const company = parseArrayParam(params.company);

  const apiParams: Record<string, string> = {
    ...(page > 1 && { page: page.toString() }),
    ...(sort && sort !== "recent" && { sort }),
    ...(q && { q }),
    ...(location && { location }),
    ...(category.length > 0 && { category: category.join(",") }),
    ...(experience_level.length > 0 && {
      experience_level: experience_level.join(","),
    }),
    ...(job_type.length > 0 && { job_type: job_type.join(",") }),
    ...(company.length > 0 && { company: company.join(",") }),
  };

  const [jobsData, filterOptions] = await Promise.all([
    fetchJobsList(apiParams),
    fetchJobsFilterOptions(),
  ]);

  return (
    <div className="min-h-screen bg-background flex flex-col w-full relative">
      <JobsClient
        initialJobs={jobsData.data || []}
        totalJobs={jobsData.total || 0}
        totalPages={jobsData.totalPages || 1}
        filterOptions={filterOptions}
        currentParams={{
          page,
          sort,
          q,
          location,
          category,
          experience_level,
          job_type,
          company,
        }}
      />
      <Footer />
    </div>
  );
}
