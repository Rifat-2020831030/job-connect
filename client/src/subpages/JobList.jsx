import axios from "axios";
import { useEffect, useState } from "react";

import JobCard from "../components/JobCard";
import Pagination from "../components/Pagination";

const JobList = ({ totalJobs }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const jobsPerPage = 12;

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          import.meta.env.VITE_BACKEND_URL +
            `/jobs?page=${currentPage}&limit=12`
        );
        setJobs(response.data.data);
        const totalCount = response.data.total;
        setTotalPages(Math.ceil(totalCount / jobsPerPage));
        setLoading(false);
      } catch (error) {
        console.error("Error fetching jobs:", error);
        setLoading(false);
      }
    };
    fetchJobs();
  }, [currentPage, totalJobs, jobsPerPage]);

  // Handle page change with smooth scroll to top
  const handlePageChange = (page) => {
    setCurrentPage(page);
    console.log("Page changed to:", page);
    console.log("CLieked Page:", page);
    // Scroll to top of job list section
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="space-y-8">
      {/* Jobs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          // Loading skeleton
          Array.from({ length: 12 }).map((_, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-lg shadow-md animate-pulse"
            >
              <div className="h-4 bg-gray-200 rounded mb-4"></div>
              <div className="h-3 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded mb-4"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </div>
          ))
        ) : jobs.length > 0 ? (
          jobs.map((job, index) => <JobCard key={index} job={job} />)
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
        {console.log("Total Pages:", totalPages)}
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
