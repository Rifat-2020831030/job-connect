import {
  AdjustmentsHorizontalIcon,
  BriefcaseIcon,
  BuildingOfficeIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";
import axios from "axios";
import { useEffect, useState } from "react";

import Stat from "../components/Stat";
import JobList from "../subpages/JobList";

const Home = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("relevance");
  const [isSearching, setIsSearching] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [stats, setStats] = useState({
    totalJobs: "0",
    totalCompanies: "0",
    totalLocations: "0",
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/stat`
        );
        setStats(response.data.data);
        const companiesResponse = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/stat/companies`
        );
        if (companiesResponse.status === 200) {
          setCompanies(companiesResponse.data.data);
        }
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

  const handleSearch = () => {
    setIsSearching(true);
    setSelectedCompany(""); 
    setSearchQuery(searchQuery.trim());
    setSortBy("relevance"); // Reset sort to relevance on new search
    window.scrollTo({
      top: document.getElementById("job-list").offsetTop,
      behavior: "smooth",
    });
  };

  const handleCompanySelection = (company) => {
    setIsSearching(true);
    setSelectedCompany(company);
    setSearchQuery(company);
    window.scrollTo({
      top: document.getElementById("job-list").offsetTop,
      behavior: "smooth",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-300">
      {/* Header Section */}
      <div className="relative overflow-hidden w-full">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5 z-0"></div>

        {/* Main Content Container */}
        <div className="relative z-10">
          {/* Hero Section */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-16">
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
                <div className="space-y-6">
                  {/* Search Bar */}
                  <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <div className="flex-1 relative w-full">
                      <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Job title, keywords, or company"
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setIsSearching(false); // Reset search state on input change
                        }}
                        className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 text-gray-700 placeholder-gray-400"
                      />
                    </div>
                    <button
                      type="submit"
                      onClick={handleSearch}
                      className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-4 px-12 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-colors duration-200"
                    >
                      Search Jobs
                    </button>
                  </div>

                  {/* Sorting Options */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center space-x-3">
                      <AdjustmentsHorizontalIcon className="w-5 h-5 text-gray-500" />
                      <span className="text-gray-600 font-medium">
                        Sort by:
                      </span>
                      <select
                        value={sortBy}
                        onChange={(e) => {
                          setSortBy(e.target.value);
                          window.scrollTo({
                            top: document.getElementById("job-list").offsetTop,
                            behavior: "smooth",
                          });
                        }}
                        className="border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-700"
                      >
                        <option value="relevance">Relevance</option>
                        <option value="date">Deadline</option>
                        <option value="salary">Salary</option>
                        <option value="company">Company</option>
                        <option value="location">Location</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Company list */}
                {companies.length > 0 && (
                  <div className="flex flex-wrap gap-2 my-2">
                    <p className="text-lg font-semibold">
                      Top Companies Hiring
                    </p>
                    {companies.map((company, index) => (
                      <span
                        key={index}
                        onClick={(e) => {
                          if (selectedCompany === company) {
                            setSelectedCompany("");
                            setSearchQuery("");
                            setIsSearching(false);
                          } else {
                            handleCompanySelection(e.target.innerText);
                          }
                        }}
                        className={`px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium hover:bg-blue-200 transition-colors duration-200 cursor-pointer ${
                          selectedCompany === company
                            ? "bg-blue-300 text-blue-900"
                            : ""
                        }`}
                      >
                        {company}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Job List Section - Separate Container */}
        <div className="bg-white/50 backdrop-blur-sm py-10" id="job-list">
          <div className="max-w-7xl lg:max-w-[1350px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <JobList
              isSearching={isSearching}
              setIsSearching={setIsSearching}
              searchQuery={searchQuery}
              sortByValue={sortBy}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
