import axios from "axios";
import { useEffect, useState } from "react";

import HeroSection from "../components/HeroSection";
import JobSearchAndFilter from "../components/job/JobSearchAndFilter";
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
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <HeroSection stats={stats} />

      {/* Search And Job List */}
      <div className="bg-[#f5fff5]">
        <JobSearchAndFilter
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          setIsSearching={setIsSearching}
          handleSearch={handleSearch}
          sortBy={sortBy}
          setSortBy={setSortBy}
          companies={companies}
          selectedCompany={selectedCompany}
          setSelectedCompany={setSelectedCompany}
          handleCompanySelection={handleCompanySelection}
        />

        {/* Job List Section */}
        <div
          className="xl:max-w-full lg:max-w-[1350px] mx-20 px-4 sm:px-6 lg:px-8 pb-10"
          id="job-list"
        >
          <JobList
            isSearching={isSearching}
            setIsSearching={setIsSearching}
            searchQuery={searchQuery}
            sortByValue={sortBy}
          />
        </div>
      </div>
    </div>
  );
};

export default Home;
