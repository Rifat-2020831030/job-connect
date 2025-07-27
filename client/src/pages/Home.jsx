import {
  AdjustmentsHorizontalIcon,
  BriefcaseIcon,
  BuildingOfficeIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import axios from "axios";

import Stat from "../components/Stat";
import JobList from "../subpages/JobList";
import Pagination from "../components/Pagination";

const Home = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("");
  const [sortBy, setSortBy] = useState("relevance");
  const [stats, setStats] = useState({
    totalJobs: "0",
    totalCompanies: "0",
    totalLocations: "0",
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/stat');
        setStats(response.data.data);
      } catch (error) {
        console.error("Error fetching stats:", error);
        setStats({
          totalJobs: "0",
          totalCompanies: "0",
          totalLocations: "0",
        });
      }
    };
    fetchStats();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    // Implement search functionality here
    console.log("Searching for:", { searchQuery, location, sortBy });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-300">
      {/* Header Section */}
      <div className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

        {/* Main Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24">
          {/* Site Name with Gradient */}
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-6">
              JobFinder
            </h1>
            {/* <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Discover your dream job from thousands of opportunities across top
              companies worldwide
            </p> */}
          </div>

          {/* Statistics Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <Stat
              info="Total Jobs Available"
              number={stats.totalJobs}
              Icon={<BriefcaseIcon className="w-8 h-8 text-white" />}
            />

            <Stat
              info="Companies Hiring"
              number={stats.totalCompanies}
              Icon={<BuildingOfficeIcon className="w-8 h-8 text-white" />}
            />
            <Stat
              info="Locations Worldwide"
              number={stats.totalLocations}
              Icon={<MapPinIcon className="w-8 h-8 text-white" />}
            />
          </div>

          {/* Search Section */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/30">
              <form onSubmit={handleSearch} className="space-y-6">
                {/* Search Bar */}
                <div className="flex gap-4 items-center justify-between">
                  <div className="flex-1 relative">
                    <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Job title, keywords, or company"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 text-gray-700 placeholder-gray-400"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-4 px-12 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-colors duration-200"
                  >
                    Search Jobs
                  </button>
                </div>

                {/* Sorting Options */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center space-x-3">
                    <AdjustmentsHorizontalIcon className="w-5 h-5 text-gray-500" />
                    <span className="text-gray-600 font-medium">Sort by:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-700"
                    >
                      <option value="relevance">Relevance</option>
                      <option value="date">Date Posted</option>
                      <option value="salary">Salary</option>
                      <option value="company">Company</option>
                      <option value="location">Location</option>
                    </select>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* joblist section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-2">
          <JobList totalJobs={stats.totalJobs} />
        </div>
      </div>
    </div>
  );
};

export default Home;
