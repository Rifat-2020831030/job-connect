import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import JobCard from "../components/job/JobCard";
import Pagination from "../components/Pagination";

const JobList = ({ isSearching, setIsSearching, searchQuery, sortByValue, selectedCompany }) => {
  const [totalJobs, setTotalJobs] = useState(1);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const jobsPerPage = 9;
  // for extracting and removing utm_source
  const [searchParams, setSearchParams] = useSearchParams();

  const getAlljobs = useCallback(async () => {
    try {
      setLoading(true);
      const utm_source = searchParams.get("utm_source");
      searchParams.delete("utm_source");
      setSearchParams(searchParams);

      // Build the URL with current page and search parameters
      let url = `${
        import.meta.env.VITE_BACKEND_URL
      }/jobs?limit=${jobsPerPage}&page=${currentPage}`;

      // Add UTM source if exists
      if (utm_source) {
        url += `&utm_source=${utm_source}`;
      }

      // Add search query if exists
      if (searchQuery && searchQuery.trim()) {
        url += `&search=${encodeURIComponent(searchQuery.trim())}`;
      }

      // Add sort parameter if specified
      if (sortByValue && sortByValue !== "relevance") {
        url += `&sort=${sortByValue}`;
      }

      // Add company filter if exists
      if (selectedCompany.length > 0) {
        selectedCompany.forEach(company => {
          url += `&companies=${encodeURIComponent(company)}`;
        });
      }

      // Fetch result
      const response = await axios.get(url);
      if (response.status === 200) {
        setFilteredJobs(response.data.data);
        setTotalJobs(response.data.total);
        setTotalPages(Math.ceil(response.data.total / jobsPerPage) || 1);
      }
      setLoading(false);

      // Reset search state
      if (isSearching) {
        setIsSearching(false);
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
      setLoading(false);
    }
  }, [
    currentPage,
    sortByValue,
    isSearching,
    jobsPerPage,
    selectedCompany
  ]);

  // Handle page change with smooth scroll to top
  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Scroll to top of job list section
    window.scrollTo({
      top: document.getElementById("job-list").offsetTop,
      behavior: "smooth",
    });
  };

  // Fetch jobs when component mounts or when search/sort/page parameters change
  useEffect(() => {
    getAlljobs();
  }, [getAlljobs]);

  return (
    <div className="space-y-8">
      {/* Jobs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-md:place-items-center max-md:justify-center">
        {loading ? (
          // Loading skeleton
          Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-lg shadow-md animate-pulse w-full max-w-sm"
            >
              <div className="h-4 bg-gray-400 rounded mb-4"></div>
              <div className="h-3 bg-gray-400 rounded mb-2"></div>
              <div className="h-3 bg-gray-400 rounded mb-4"></div>
              <div className="h-8 bg-gray-400 rounded"></div>
            </div>
          ))
        ) : filteredJobs.length > 0 ? (
          filteredJobs.map((job, index) => (
            <JobCard key={index} job={job} />
          ))
        ) : (
          <div className="col-span-full text-center text-gray-600 text-lg py-12">
            <div className="mb-4">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              No jobs found
            </h3>
            <p className="text-gray-500">
              Try adjusting your search criteria or check back later for new
              opportunities.
            </p>
          </div>
        )}
      </div>
      {/* Pagination */}
      <div className="flex justify-center mt-8">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
};

export default JobList;
