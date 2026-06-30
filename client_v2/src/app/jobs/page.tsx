"use client";

import JobFilters, { ActiveFilters, FilterOptions } from "@/components/JobFilters";
import JobRow from "@/components/JobRow";
import JobSearchBar from "@/components/JobSearchBar";
import JobDetailsModal, { JobDetail } from "@/components/JobDetailsModal";
import { API_BASE_URL } from "@/lib/api";
import { Filter, X, Loader2, Search } from "lucide-react";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { toast } from "sonner";

function JobsPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobDetail | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  const [jobs, setJobs] = useState<any[]>([]);
  const [totalJobs, setTotalJobs] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);

  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    categories: [],
    experienceLevels: [],
    jobTypes: [],
    topCompanies: []
  });

  // URL state parsing
  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const currentSort = searchParams.get("sort") || "recent";
  const currentQuery = searchParams.get("q") || "";
  const currentLocation = searchParams.get("location") || "";
  
  const activeFilters: ActiveFilters = {
    categories: searchParams.get("category") ? searchParams.get("category")!.split(",") : [],
    experienceLevels: searchParams.get("experience_level") ? searchParams.get("experience_level")!.split(",") : [],
    jobTypes: searchParams.get("job_type") ? searchParams.get("job_type")!.split(",") : [],
    companies: searchParams.get("company") ? searchParams.get("company")!.split(",") : [],
  };

  // Fetch Filter Options
  useEffect(() => {
    async function fetchOptions() {
      try {
        const [optRes, catRes] = await Promise.all([
          fetch(`${API_BASE_URL}/jobs/filter-options`),
          fetch(`${API_BASE_URL}/jobs/categories`)
        ]);
        
        const optData = await optRes.json();
        const catData = await catRes.json();

        if (optData.status === 1 && catData.status === 1) {
          setFilterOptions({
            categories: catData.data.map((c: any) => ({ value: c.label || c.category, count: c.count })),
            experienceLevels: optData.data.experienceLevels,
            jobTypes: optData.data.jobTypes,
            topCompanies: optData.data.topCompanies
          });
        }
      } catch (err) {
        console.error("Failed to fetch filter options", err);
      }
    }
    fetchOptions();
  }, []);

  // Fetch Jobs
  useEffect(() => {
    async function fetchJobs() {
      setIsLoadingJobs(true);
      try {
        const params = new URLSearchParams(searchParams.toString());
        // Clean empty params
        Array.from(params.keys()).forEach(key => {
          if (!params.get(key)) params.delete(key);
        });

        const res = await fetch(`${API_BASE_URL}/jobs?${params.toString()}`);
        const data = await res.json();
        
        if (data.status === 1) {
          setJobs(data.data);
          setTotalJobs(data.total);
          setTotalPages(data.totalPages || 1);
        } else {
          setJobs([]);
          toast.error(data.message || "Failed to load jobs");
        }
      } catch (err) {
        setJobs([]);
        toast.error("Failed to fetch jobs. Check your connection.");
      } finally {
        setIsLoadingJobs(false);
      }
    }
    fetchJobs();
  }, [searchParams]);

  const updateUrl = (newParams: Record<string, string | null>, resetPage = true) => {
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
    const isPageChange = !resetPage;
    router.push(`${pathname}?${params.toString()}`, { scroll: isPageChange });
  };

  const handleSearch = (q: string, loc: string) => {
    updateUrl({ q, location: loc });
  };

  const handleApplyFilters = (filters: ActiveFilters) => {
    updateUrl({
      category: filters.categories.length > 0 ? filters.categories.join(",") : null,
      experience_level: filters.experienceLevels.length > 0 ? filters.experienceLevels.join(",") : null,
      job_type: filters.jobTypes.length > 0 ? filters.jobTypes.join(",") : null,
      company: filters.companies.length > 0 ? filters.companies.join(",") : null,
    });
    setShowMobileFilters(false);
  };

  const handleClearFilters = () => {
    updateUrl({ category: null, experience_level: null, job_type: null, company: null });
  };

  const handleViewDetails = async (jobId: string, fallbackJob: any) => {
    if (!jobId) {
      setSelectedJob(fallbackJob);
      return;
    }
    
    setIsLoadingDetails(true);
    try {
      const res = await fetch(`${API_BASE_URL}/jobs/${jobId}`);
      const data = await res.json();
      
      if (res.ok && data.status === 1) {
        setSelectedJob(data.data);
      } else {
        toast.error("Failed to load job details. Showing cached data.");
        setSelectedJob(fallbackJob);
      }
    } catch (err) {
      toast.error("Failed to fetch job details. Check your connection.");
      setSelectedJob(fallbackJob);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  // Generate pagination pages
  const getPages = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="min-h-screen bg-background pb-20 relative">
      {isLoadingDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="bg-white p-4 rounded-lg shadow-lg flex items-center gap-3">
            <Loader2 className="animate-spin h-5 w-5 text-primary" />
            <span className="font-mono text-sm text-gray-700">Loading details...</span>
          </div>
        </div>
      )}
      
      {/* Header / Search Section */}
      <section className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 py-8 md:py-12 flex flex-col items-center">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground tracking-tight text-center mb-3 md:mb-4">
            Find your next opportunity
          </h1>
          <p className="text-sm md:text-base text-gray-600 text-center mb-6 md:mb-8 max-w-2xl px-4">
            Browse thousands of active jobs from top tech companies.
          </p>
          <div className="w-full max-w-4xl">
            <JobSearchBar 
              initialQuery={currentQuery} 
              initialLocation={currentLocation} 
              onSearch={handleSearch} 
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
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 py-6 md:py-8">
        <div className="lg:hidden mb-4 flex justify-end">
          <button
            onClick={() => setShowMobileFilters(true)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-bold text-foreground hover:bg-gray-50 transition-colors"
          >
            <Filter className="size-4" />
            Filters
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 md:gap-8 relative">
          {showMobileFilters && (
            <div
              className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity"
              onClick={() => setShowMobileFilters(false)}
            />
          )}

          <aside
            className={`fixed inset-y-0 left-0 z-50 w-[75vw] sm:w-80 bg-white transform transition-transform duration-300 ease-in-out lg:relative lg:transform-none lg:w-72 shrink-0 ${
              showMobileFilters
                ? "translate-x-0"
                : "-translate-x-full lg:translate-x-0"
            } overflow-y-auto lg:overflow-visible shadow-2xl lg:shadow-none`}
          >
            <div className="p-4 lg:p-0 min-h-screen lg:min-h-0 lg:sticky lg:top-[5rem] lg:max-h-[calc(100vh-5rem)] lg:overflow-y-auto custom-scrollbar lg:pb-4 z-10 lg:z-auto">
              <div className="flex items-center justify-between lg:hidden mb-4 pb-4 border-b border-gray-100">
                <span className="font-bold text-lg">Filters</span>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="p-2 cursor-pointer hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="size-5" />
                </button>
              </div>
              <JobFilters 
                options={filterOptions}
                activeFilters={activeFilters}
                onApplyFilters={handleApplyFilters}
                onClearFilters={handleClearFilters}
              />
            </div>
          </aside>

          <main className="flex-1 flex flex-col min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
              <h2 className="text-lg md:text-xl font-bold text-foreground">
                Showing Results
              </h2>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="font-mono">Sort by:</span>
                <select 
                  className="border-none bg-transparent font-bold text-primary cursor-pointer outline-none hover:text-emerald-700"
                  value={currentSort}
                  onChange={(e) => updateUrl({ sort: e.target.value }, true)}
                >
                  <option value="recent">Most Recent</option>
                  <option value="salary_high">Highest Salary</option>
                </select>
              </div>
            </div>

            {isLoadingJobs ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="animate-spin h-8 w-8 text-primary" />
                <span className="text-gray-500 font-medium">Loading jobs...</span>
              </div>
            ) : jobs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4 text-center px-4">
                <div className="size-16 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                  <Search className="size-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-foreground">No jobs found</h3>
                <p className="text-gray-500 max-w-md">
                  We couldn't find any jobs matching your current search criteria. Try adjusting your filters or search terms.
                </p>
                <button 
                  onClick={handleClearFilters}
                  className="mt-4 px-6 py-2 bg-primary text-white font-bold rounded-md hover:bg-emerald-700 transition-colors"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {jobs.map((job) => (
                  <JobRow
                    key={job._id}
                    _id={job._id}
                    title={job.title}
                    company={job.company}
                    location={job.location}
                    experience_level={job.experience_level}
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
                    onViewDetails={() => handleViewDetails(job._id, job)}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {!isLoadingJobs && totalPages > 1 && (
              <div className="mt-8 md:mt-12 flex justify-center items-center gap-1 md:gap-2">
                <button
                  onClick={() => updateUrl({ page: (currentPage - 1).toString() }, false)}
                  disabled={currentPage <= 1}
                  className="size-8 md:size-10 flex items-center justify-center border border-gray-200 rounded-md hover:border-gray-300 hover:bg-gray-50 transition-colors text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  &larr;
                </button>
                
                {getPages().map(p => (
                  <button 
                    key={p}
                    onClick={() => updateUrl({ page: p.toString() }, false)}
                    className={`size-8 md:size-10 flex items-center justify-center border rounded-md transition-colors font-medium cursor-pointer ${
                      p === currentPage 
                        ? 'border-primary bg-primary/10 text-primary font-bold' 
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-foreground'
                    }`}
                  >
                    {p}
                  </button>
                ))}

                {totalPages > getPages()[getPages().length - 1] && (
                  <>
                    <span className="px-1 md:px-2 text-gray-400">...</span>
                    <button 
                      onClick={() => updateUrl({ page: totalPages.toString() }, false)}
                      className="size-8 md:size-10 flex items-center justify-center border border-gray-200 rounded-md hover:border-gray-300 hover:bg-gray-50 transition-colors text-foreground font-medium cursor-pointer"
                    >
                      {totalPages}
                    </button>
                  </>
                )}

                <button 
                  onClick={() => updateUrl({ page: (currentPage + 1).toString() }, false)}
                  disabled={currentPage >= totalPages}
                  className="size-8 md:size-10 flex items-center justify-center border border-gray-200 rounded-md hover:border-gray-300 hover:bg-gray-50 transition-colors text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  &rarr;
                </button>
              </div>
            )}
          </main>
        </div>
      </section>

      {selectedJob && (
        <JobDetailsModal 
          job={selectedJob} 
          onClose={() => setSelectedJob(null)} 
        />
      )}
    </div>
  );
}

export default function JobsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    }>
      <JobsPageContent />
    </Suspense>
  );
}
