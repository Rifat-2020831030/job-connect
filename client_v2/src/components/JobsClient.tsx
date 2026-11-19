"use client";

import React, { useState, useTransition, useEffect, useMemo } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import JobFilters, {
  ActiveFilters,
  FilterOptions,
} from "@/components/JobFilters";
import JobRow from "@/components/JobRow";
import JobSearchBar from "@/components/JobSearchBar";
import { Filter, X, Loader2, Search } from "lucide-react";

export interface JobsClientCurrentParams {
  page: number;
  sort: string;
  q: string;
  location: string;
  category: string[];
  experience_level: string[];
  job_type: string[];
  company: string[];
}

interface JobsClientProps {
  initialJobs: any[];
  totalJobs: number;
  totalPages: number;
  filterOptions: FilterOptions;
  currentParams: JobsClientCurrentParams;
}

export default function JobsClient({
  initialJobs,
  totalJobs,
  totalPages,
  filterOptions,
  currentParams,
}: JobsClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isPending, startTransition] = useTransition();
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // If a shared link has ?jobId=..., redirect directly to the full details page
  const currentJobId = searchParams.get("jobId");
  useEffect(() => {
    if (currentJobId) {
      router.replace(`/jobs/${currentJobId}`);
    }
  }, [currentJobId, router]);

  const activeFilters: ActiveFilters = useMemo(() => ({
    categories: currentParams.category,
    experienceLevels: currentParams.experience_level,
    jobTypes: currentParams.job_type,
    companies: currentParams.company,
  }), [currentParams.category, currentParams.experience_level, currentParams.job_type, currentParams.company]);

  const updateUrl = (
    newParams: Record<string, string | null>,
    resetPage = true
  ) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    if (resetPage) {
      params.delete("page");
    }
    const qs = params.toString();
    startTransition(() => {
      router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
    });
  };

  const scrollToResults = () => {
    const el = document.getElementById("results-section");
    if (el) {
      setTimeout(
        () => el.scrollIntoView({ behavior: "smooth", block: "start" }),
        50
      );
    }
  };

  const handleSearch = (q: string, loc: string, shouldScroll = true) => {
    updateUrl({ q, location: loc });
    if (shouldScroll) {
      scrollToResults();
    }
  };

  const handleApplyFilters = (filters: ActiveFilters) => {
    updateUrl({
      category:
        filters.categories.length > 0 ? filters.categories.join(",") : null,
      experience_level:
        filters.experienceLevels.length > 0
          ? filters.experienceLevels.join(",")
          : null,
      job_type: filters.jobTypes.length > 0 ? filters.jobTypes.join(",") : null,
      company:
        filters.companies.length > 0 ? filters.companies.join(",") : null,
    });
    setShowMobileFilters(false);
    scrollToResults();
  };

  const handleClearFilters = () => {
    updateUrl({
      category: null,
      experience_level: null,
      job_type: null,
      company: null,
    });
    scrollToResults();
  };

  const handlePageChange = (page: number) => {
    updateUrl({ page: page.toString() }, false);
    scrollToResults();
  };

  // Generate pagination pages
  const getPages = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentParams.page - Math.floor(maxVisible / 2));
    const end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <>
      {/* Header / Search Section */}
      <section className="w-full border-b border-gray-200 bg-white">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-12 py-8 md:py-12 flex flex-col items-center">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground tracking-tight text-center mb-3 md:mb-4">
            Find your next opportunity
          </h1>
          <p className="text-sm md:text-base text-gray-600 text-center mb-6 md:mb-8 max-w-2xl px-4">
            Browse thousands of active jobs from top tech companies.
          </p>
          <div className="w-full max-w-4xl">
            <JobSearchBar
              initialQuery={currentParams.q}
              initialLocation={currentParams.location}
              onSearch={handleSearch}
              isLoading={isPending}
            />
          </div>
          <div className="mt-6 flex items-center justify-between w-full max-w-4xl text-xs md:text-sm px-2">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2 md:h-2.5 md:w-2.5 mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 md:h-2.5 md:w-2.5 bg-emerald-500"></span>
              </span>
              <span className="font-mono font-medium text-emerald-700 uppercase tracking-wide text-[10px] md:text-xs">
                {totalJobs.toLocaleString()} Real-time jobs matching
              </span>
            </div>
            {isPending && (
              <div className="flex items-center gap-1.5 text-xs text-primary font-mono animate-pulse">
                <Loader2 className="size-3.5 animate-spin" />
                <span>Updating results...</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-12 py-6 md:py-8 flex-1">
        <div className="lg:hidden mb-4 flex justify-end">
          <button
            onClick={() => setShowMobileFilters(true)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-bold text-foreground hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <Filter className="size-4" />
            Filters
          </button>
        </div>

        <div className="w-full flex flex-col lg:flex-row gap-6 md:gap-8 items-start relative">
          {showMobileFilters && (
            <div
              className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity"
              onClick={() => setShowMobileFilters(false)}
            />
          )}

          <aside
            className={`fixed inset-y-0 left-0 z-50 w-[85vw] max-w-xs sm:w-80 bg-white transform transition-transform duration-300 ease-in-out lg:relative lg:transform-none lg:w-72 shrink-0 lg:self-start lg:sticky lg:top-20 lg:z-10 ${
              showMobileFilters
                ? "translate-x-0"
                : "-translate-x-full lg:translate-x-0"
            } h-full lg:h-[calc(100vh-6rem)] shadow-2xl lg:shadow-none flex flex-col`}
          >
            {/* Mobile Header with close button */}
            <div className="flex items-center justify-between lg:hidden p-4 border-b border-gray-100 shrink-0">
              <span className="font-bold text-lg">Filters</span>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="p-2 cursor-pointer hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Close filters"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Filter Content */}
            <div className="flex-1 min-h-0 overflow-hidden">
              <JobFilters
                options={filterOptions}
                activeFilters={activeFilters}
                onApplyFilters={handleApplyFilters}
                onClearFilters={handleClearFilters}
                isApplying={isPending}
              />
            </div>
          </aside>

          <main
            id="results-section"
            className="flex-1 w-full flex flex-col min-w-0 scroll-mt-24 lg:scroll-mt-28 relative"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
              <h2 className="text-lg md:text-xl font-bold text-foreground">
                Showing Results
              </h2>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="font-mono">Sort by:</span>
                <select
                  className="border-none bg-transparent font-bold text-primary cursor-pointer outline-none hover:text-emerald-700"
                  value={currentParams.sort}
                  onChange={(e) => updateUrl({ sort: e.target.value }, true)}
                  disabled={isPending}
                >
                  <option value="recent">Most Recent</option>
                  <option value="salary_high">Highest Salary</option>
                </select>
              </div>
            </div>

            {/* Transition loading overlay */}
            <div className="relative min-h-[400px]">
              {isPending && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-lg">
                  <div className="bg-white p-3.5 rounded-xl shadow-lg border border-gray-100 flex items-center gap-2.5">
                    <Loader2 className="animate-spin size-5 text-primary" />
                    <span className="font-mono text-sm text-gray-800">
                      Loading matching jobs...
                    </span>
                  </div>
                </div>
              )}

              {initialJobs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4 text-center px-4 w-full">
                  <div className="size-16 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                    <Search className="size-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">
                    No jobs found
                  </h3>
                  <p className="text-gray-500 max-w-md">
                    We couldn&apos;t find any jobs matching your current search
                    criteria. Try adjusting your filters or search terms.
                  </p>
                  <button
                    onClick={handleClearFilters}
                    className="mt-4 px-6 py-2 bg-primary text-white font-bold rounded-md hover:bg-emerald-700 transition-colors cursor-pointer"
                  >
                    Clear all filters
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {initialJobs.map((job) => (
                    <JobRow
                      key={job._id}
                      _id={job._id}
                      title={job.title}
                      company={job.company}
                      location={job.location}
                      salary={job.salary}
                      salary_min={job.salary_min}
                      salary_max={job.salary_max}
                      skills={job.skills || job.tags || []}
                      first_seen={job.first_seen}
                      logo={job.logoUrl || job.logo}
                      url={job.url}
                      experience={job.experience}
                      vacancy={job.vacancy}
                      deadline={job.deadline}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center items-center gap-1 md:gap-2 pb-12 w-full">
                <button
                  onClick={() => handlePageChange(currentParams.page - 1)}
                  disabled={currentParams.page <= 1 || isPending}
                  className="size-8 md:size-10 flex items-center justify-center border border-gray-200 rounded-md hover:border-gray-300 hover:bg-gray-50 transition-colors text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  aria-label="Previous page"
                >
                  &larr;
                </button>

                {getPages().map((p) => (
                  <button
                    key={p}
                    onClick={() => handlePageChange(p)}
                    disabled={isPending}
                    className={`size-8 md:size-10 flex items-center justify-center border rounded-md transition-colors font-medium cursor-pointer ${
                      p === currentParams.page
                        ? "border-primary bg-primary/10 text-primary font-bold"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-foreground"
                    }`}
                  >
                    {p}
                  </button>
                ))}

                {totalPages > getPages()[getPages().length - 1] && (
                  <>
                    <span className="px-1 md:px-2 text-gray-400">...</span>
                    <button
                      onClick={() => handlePageChange(totalPages)}
                      disabled={isPending}
                      className="size-8 md:size-10 flex items-center justify-center border border-gray-200 rounded-md hover:border-gray-300 hover:bg-gray-50 transition-colors text-foreground font-medium cursor-pointer"
                    >
                      {totalPages}
                    </button>
                  </>
                )}

                <button
                  onClick={() => handlePageChange(currentParams.page + 1)}
                  disabled={currentParams.page >= totalPages || isPending}
                  className="size-8 md:size-10 flex items-center justify-center border border-gray-200 rounded-md hover:border-gray-300 hover:bg-gray-50 transition-colors text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  aria-label="Next page"
                >
                  &rarr;
                </button>
              </div>
            )}
          </main>
        </div>
      </section>
    </>
  );
}
