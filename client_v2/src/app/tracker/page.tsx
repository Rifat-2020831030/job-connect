"use client";

import TrackerNotesModal from "@/components/tracker/TrackerNotesModal";
import TrackerTable, { TrackedJob } from "@/components/tracker/TrackerTable";
import { fetchWithAuth } from "@/lib/apiClient";
import { getUserInfo } from "@/lib/auth";
import { ChevronLeft, ChevronRight, Filter, Loader2, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export default function TrackerPage() {
  const [jobs, setJobs] = useState<TrackedJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<TrackedJob | null>(null);

  // Pagination, Search, Filter & Sort state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortOption, setSortOption] = useState("createdAt_desc");

  const [availableCompanies, setAvailableCompanies] = useState<string[]>([]);
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = useState(false);
  const companyDropdownRef = useRef<HTMLDivElement>(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const LIMIT = 10;

  const router = useRouter();
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fast Auth Guard
  useEffect(() => {
    if (!getUserInfo()) {
      router.push("/login");
    }
  }, [router]);

  // Close company dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (companyDropdownRef.current && !companyDropdownRef.current.contains(e.target as Node)) {
        setIsCompanyDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch available companies
  useEffect(() => {
    const fetchCompanies = async () => {
      const userInfo = getUserInfo();
      if (!userInfo) return;
      try {
        const res = await fetchWithAuth(`/users/${userInfo.userId}/tracked-companies`);
        const data = await res.json();
        if (data.status === 1) {
          setAvailableCompanies(data.data || []);
        }
      } catch (err) {
        console.error("Failed to fetch companies", err);
      }
    };
    fetchCompanies();
  }, []);

  const loadJobs = useCallback(
    async (pageNum: number, query: string, status: string, sort: string, companies: string[]) => {
      const userInfo = getUserInfo();
      if (!userInfo) return;

      setIsLoading(true);
      try {
        let url = `/users/${userInfo.userId}/tracked-jobs?page=${pageNum}&limit=${LIMIT}&sort=${sort}`;
        if (query) url += `&q=${encodeURIComponent(query)}`;
        if (status) url += `&status=${encodeURIComponent(status)}`;
        if (companies.length > 0) url += `&company=${encodeURIComponent(companies.join(","))}`;

        const res = await fetchWithAuth(url);
        const data = await res.json();
        if (data.status === 1) {
          setJobs(data.data);
          if (data.pagination) {
            setTotalPages(data.pagination.totalPages);
            setTotalCount(data.pagination.total);
          }
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load tracked jobs");
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    // Only fetch on page, filter, or sort changes, searchQuery is handled via debounce
    loadJobs(page, searchQuery, statusFilter, sortOption, selectedCompanies);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter, sortOption, selectedCompanies, loadJobs]); // Exclude searchQuery from dependencies

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    setPage(1); // reset to first page on search

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      loadJobs(1, val, statusFilter, sortOption, selectedCompanies);
    }, 350);
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const userInfo = getUserInfo();
      if (!userInfo) return;
      const res = await fetchWithAuth(
        `/users/${userInfo.userId}/tracked-jobs/${id}`,
        {
          method: "PUT",
          body: JSON.stringify({ status }),
        }
      );
      const data = await res.json();
      if (data.status === 1) {
        setJobs((prev) =>
          prev.map((j) => (j._id === id ? { ...j, ...data.data } : j))
        );
        toast.success(`Status updated to ${status}`);
      }
    } catch (err) {
      toast.error("Failed to update status");
      throw err; // throw to let table remove loading state
    }
  };

  const handleUpdateNotes = async (id: string, notes: string) => {
    try {
      const userInfo = getUserInfo();
      if (!userInfo) return;
      const res = await fetchWithAuth(
        `/users/${userInfo.userId}/tracked-jobs/${id}`,
        {
          method: "PUT",
          body: JSON.stringify({ notes }),
        }
      );
      const data = await res.json();
      if (data.status === 1) {
        setJobs((prev) =>
          prev.map((j) => {
            if (j._id === id) {
              const updated = { ...j, ...data.data };
              setSelectedJob(updated); // Update modal view
              return updated;
            }
            return j;
          })
        );
        toast.success("Notes saved");
      }
    } catch (err) {
      toast.error("Failed to save notes");
      throw err;
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const userInfo = getUserInfo();
      if (!userInfo) return;
      const res = await fetchWithAuth(
        `/users/${userInfo.userId}/tracked-jobs/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await res.json();
      if (data.status === 1 || res.ok) {
        setJobs((prev) => prev.filter((j) => j._id !== id));
        setSelectedJob(null);
        toast.success("Job removed from tracker");

        // Reload if empty page
        if (jobs.length === 1 && page > 1) {
          setPage(page - 1);
        } else {
          loadJobs(page, searchQuery, statusFilter, sortOption, selectedCompanies);
        }
      } else {
        toast.error(data.message || "Failed to delete job");
        throw new Error("Delete failed");
      }
    } catch (err) {
      throw err;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 pb-12">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 md:px-12 py-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Application Tracker
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage and track your job hunt history.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full sm:w-auto px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="PENDING_CONFIRMATION">Pending</option>
              <option value="APPLIED">Applied</option>
              <option value="INTERVIEWING">Interviewing</option>
              <option value="OFFER">Offer</option>
              <option value="REJECTED">Rejected</option>
              <option value="EXPIRED">Expired</option>
            </select>

            <select
              value={sortOption}
              onChange={(e) => {
                setSortOption(e.target.value);
                setPage(1);
              }}
              className="w-full sm:w-auto px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer"
            >
              <option value="createdAt_desc">Newest First</option>
              <option value="createdAt_asc">Oldest First</option>
              <option value="updatedAt_desc">Recently Updated</option>
            </select>

            {/* Company Multi-Select Filter */}
            <div className="relative" ref={companyDropdownRef}>
              <button
                type="button"
                onClick={() => setIsCompanyDropdownOpen(!isCompanyDropdownOpen)}
                className="flex items-center gap-2 w-full sm:w-auto px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer"
              >
                <Filter className="w-4 h-4 text-gray-500" />
                <span>Companies {selectedCompanies.length > 0 ? `(${selectedCompanies.length})` : ""}</span>
              </button>

              {isCompanyDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-100 rounded-lg shadow-xl py-2 z-50 flex flex-col max-h-64">
                  <div className="px-3 pb-2 border-b border-gray-100 mb-2">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Filter by Company</span>
                  </div>
                  <div className="flex-1 overflow-y-auto px-3 flex flex-col gap-2 custom-scrollbar">
                    {availableCompanies.length === 0 ? (
                      <div className="text-sm text-gray-500 italic py-2">No companies found</div>
                    ) : (
                      availableCompanies.map(company => (
                        <label key={company} className="flex items-center gap-2 cursor-pointer group">
                          <input 
                            type="checkbox"
                            checked={selectedCompanies.includes(company)}
                            onChange={() => {
                              setSelectedCompanies(prev => 
                                prev.includes(company) ? prev.filter(c => c !== company) : [...prev, company]
                              );
                            }}
                            className="appearance-none size-4 border border-gray-300 rounded-sm checked:bg-emerald-600 checked:border-emerald-600 cursor-pointer relative after:content-[''] after:hidden checked:after:block after:absolute after:left-[4px] after:top-[1px] after:w-[6px] after:h-[10px] after:border-r-2 after:border-b-2 after:border-white after:rotate-45"
                          />
                          <span className="text-sm text-gray-700 group-hover:text-emerald-700 truncate">{company}</span>
                        </label>
                      ))
                    )}
                  </div>
                  {selectedCompanies.length > 0 && (
                    <div className="px-3 pt-2 border-t border-gray-100 mt-2">
                      <button 
                        onClick={() => setSelectedCompanies([])}
                        className="text-xs font-medium text-gray-500 hover:text-gray-800 w-full text-left"
                      >
                        Clear selection
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search companies or titles..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-12 py-8 w-full">
        {isLoading && jobs.length === 0 ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <TrackerTable
              jobs={jobs}
              onUpdateStatus={handleUpdateStatus}
              onOpenNotes={setSelectedJob}
              onDelete={handleDelete}
            />

            {/* Pagination Controls */}
            {jobs.length > 0 && (
              <div className="flex items-center justify-between bg-white px-4 py-3 border border-gray-200 rounded-lg">
                <div className="text-sm text-gray-700">
                  Showing{" "}
                  <span className="font-medium">{(page - 1) * LIMIT + 1}</span>{" "}
                  to{" "}
                  <span className="font-medium">
                    {Math.min(page * LIMIT, totalCount)}
                  </span>{" "}
                  of <span className="font-medium">{totalCount}</span> results
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-1 rounded border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="text-sm font-medium px-2">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-1 rounded border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {selectedJob && (
        <TrackerNotesModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          onUpdateNotes={handleUpdateNotes}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
