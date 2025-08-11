import axios from "axios";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import JobCard from "../components/JobCard";
import Pagination from "../components/Pagination";

const JobList = ({ isSearching, setIsSearching, searchQuery, sortByValue }) => {
  const [jobs, setJobs] = useState([]);
  const [totalJobs, setTotalJobs] = useState(1);
  const [queriedJobs, setQueriedJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const jobsPerPage = 12;
  // extracting and removing utm_source
  const [searchParams, setSearchParams] = useSearchParams();

  const getAlljobs = async () => {
    try {
      setLoading(true);
      const utm_source = searchParams.get("utm_source");
      searchParams.delete("utm_source");
      setSearchParams(searchParams);
      const response = await axios.get(
        import.meta.env.VITE_BACKEND_URL + `/jobs?utm_source=${utm_source}`
      );
      if (response.status == 200) {
        setJobs(response.data.data);
        setFilteredJobs(response.data.data.slice(0, 12)); // Initialize with first 12 jobs
        setTotalJobs(response.data.total);
        setTotalPages(Math.ceil(response.data.total / jobsPerPage) || 1); // total pages to show = totaljobs / jobsPerPage
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching all jobs:", error);
      setLoading(false);
    }
  };

  const setJobsbyPage = (page = 1, isQuery = false) => {
    const startIndex = (page - 1) * jobsPerPage;
    const endIndex = startIndex + jobsPerPage;
    // if seaching, show from quired jobs
    if (isQuery) {
      setFilteredJobs(queriedJobs.slice(startIndex, endIndex));
      return;
    }
    const paginatedJobs = jobs.slice(startIndex, endIndex);
    setFilteredJobs(paginatedJobs);
  };

  const handleSort = (value) => {
    const copyOfJobs = [...jobs];
    switch (value) {
      case "company":
        copyOfJobs.sort((a, b) => a.company.localeCompare(b.company));
        break;
      case "location":
        copyOfJobs.sort((a, b) => a.location.localeCompare(b.location));
        break;
      case "date":
        copyOfJobs.sort((a, b) => new Date(b.date) - new Date(a.date));
        break;
      case "salary":
        copyOfJobs.sort((a, b) => {
          const salaryA = parseInt(a.salary.replace(/[^0-9]/g, ""));
          const salaryB = parseInt(b.salary.replace(/[^0-9]/g, ""));
          return salaryB - salaryA; // Sort by descending salary
        });
        break;
    }
    setQueriedJobs(copyOfJobs);
  };

  const handleSearch = () => {
    if (!searchQuery && sortByValue === "relevance") {
      // Reset queried jobs if no search query
      setQueriedJobs([]);
      setFilteredJobs(jobs.slice(0, 12));
      setCurrentPage(1);
      setTotalPages(Math.ceil(totalJobs / jobsPerPage) || 1);
      return;
    }
    // if search button clicked
    if (isSearching) {
      const query = searchQuery.toLowerCase();
      // Search from all jobs set
      const copyOfJobs = [...jobs];
      const filtered = copyOfJobs.filter((job) => {
        if (
          job.title.toLowerCase().includes(query) ||
          job.company.toLowerCase().includes(query)
        )
          return true;
      });
      setQueriedJobs(filtered);
      setIsSearching(false); // Reset search state after filtering
      // Reset pagination data
      setCurrentPage(1);
      setTotalPages(Math.ceil(filtered.length / jobsPerPage) || 1);
      // setJobsbyPage(1, true); // Set jobs for first page based on search
      setFilteredJobs(filtered);
    } else if (sortByValue !== "relevance") {
      // If sorting is applied without search
      handleSort(sortByValue);
    }
  };

  // Handle page change with smooth scroll to top
  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Scroll to top of job list section
    window.scrollTo({
      top: document.getElementById("job-list").offsetTop,
      behavior: "smooth",
    });
  };

  // fetch all jobs on page load
  useEffect(() => {
    getAlljobs();
  }, []);

  // set jobs for each page
  useEffect(() => {
    setJobsbyPage(currentPage);
  }, [currentPage]);

  // Filter jobs based on search query and sort by value
  useEffect(() => {
    handleSearch();
  }, [isSearching, searchQuery, sortByValue]);

  return (
    <div className="space-y-8">
      {/* Jobs Grid */}
      <div className="grid grid-cols-1 mx-auto md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-md:place-items-center max-md:justify-center">
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
            filteredJobs.map((job, index) => <JobCard key={index} job={job} />)
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
