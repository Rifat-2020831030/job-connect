import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import NotfoundImg from "../assets/browser.png";
import JobCard from "../components/job/JobCard";
import Pagination from "../components/Pagination";

const JobList = ({
  isSearching,
  setIsSearching,
  searchQuery,
  sortByValue,
  selectedCompany,
}) => {
  const [totalJobs, setTotalJobs] = useState(0);
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
        selectedCompany
          .filter(Boolean) // removes undefined, null, empty string
          .forEach((company) => {
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
    selectedCompany,
    searchParams,
    // searchQuery,
    setIsSearching,
    setSearchParams,
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
      {Math.min(currentPage * jobsPerPage, totalJobs) > 0 && (
        <h3 className="text-lg font-semibold text-gray-900 text-center">
          Seeing {currentPage * jobsPerPage - jobsPerPage + 1} to{" "}
          {Math.min(currentPage * jobsPerPage, totalJobs)} Jobs out of{" "}
          {totalJobs}
        </h3>
      )}
      {/* /* Jobs Grid */}
      <div className="flex flex-wrap justify-center items-start gap-8 max-w-full mx-8">
        {loading ? (
          // Loading skeleton
          Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="bg-white p-8 rounded-xl shadow-lg animate-pulse w-full max-w-[350px] min-w-[280px]"
            >
              <div className="h-6 bg-gray-400 rounded mb-6"></div>
              <div className="h-4 bg-gray-400 rounded mb-3"></div>
              <div className="h-4 bg-gray-400 rounded mb-3"></div>
              <div className="h-4 bg-gray-400 rounded mb-6"></div>
              <div className="h-10 bg-gray-400 rounded"></div>
            </div>
          ))
        ) : filteredJobs.length > 0 ? (
          filteredJobs.map((job, index) => <JobCard key={index} job={job} />)
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-8 px-8">
            <div className="p-6 mb-3">
              <img
                src={NotfoundImg}
                alt="No Jobs Found"
                className="h-16 w-16 text-blue-500"
              />
            </div>

            <div className="text-center max-w-md">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                No Jobs Found
              </h3>
              <p className="text-gray-600 text-base leading-relaxed mb-6">
                We couldn't find any jobs for you. <br />
                Don't worry, new opportunities are added regularly!
              </p>

              <div className="space-y-3">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2 text-sm">
                    💡 Try these suggestions for searching:
                  </h4>
                  <ul className="text-blue-800 text-sm space-y-1 text-left">
                    <li>• Broaden your search terms</li>
                    <li>• Remove some filters</li>
                    <li>• Check for typos in your search</li>
                    <li>• Try different keywords</li>
                  </ul>
                </div>
              </div>
            </div>
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
