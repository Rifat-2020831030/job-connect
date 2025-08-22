import axios from "axios";
import { useEffect, useState } from "react";

import HeroSection from "../components/HeroSection";
import JobSearchAndFilter from "../components/job/JobSearchAndFilter";
import JobList from "../subpages/JobList";
import ShareComponent from "../components/ShareComponent";
import Footer from "../components/Footer";

const Home = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("relevance");
  const [isSearching, setIsSearching] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState([]);
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

  const handleQueryChange = (query) => {
    // handle search query changes to null state
    if(!query) {
      setSearchQuery(query);
      setIsSearching(true);
      return;
    }
    setSearchQuery(query);
    setIsSearching(false);
  };

  const handleSearch = () => {
    setSearchQuery(searchQuery.trim().toLowerCase());
    setSortBy("relevance"); // Reset sort to relevance on new search
    setIsSearching(true);
    setSelectedCompany([]);
    window.scrollTo({
      top: document.getElementById("job-list").offsetTop,
      behavior: "smooth",
    });
  };

  const handleCompanySelection = (company) => {
    if (selectedCompany.includes(company)) {
      const updatedCompanies = selectedCompany.filter((c) => c !== company);
      setSelectedCompany(updatedCompanies);
    } else {
      setSelectedCompany((prev) => [...prev, company]);
    }
    // trigger searching
    // console.log("Selected Companies:", selectedCompany);
    setIsSearching(true);
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
      <div className="bg-[#f5fff5] pb-10">
        <JobSearchAndFilter
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          handleQueryChange={handleQueryChange}
          setIsSearching={setIsSearching}
          handleSearch={handleSearch}
          sortBy={sortBy}
          setSortBy={setSortBy}
          companies={companies}
          selectedCompany={selectedCompany}
          handleCompanySelection={handleCompanySelection}
        />

        {/* Job List Section */}
        <div
          // className="xl:max-w-full lg:max-w-[1350px] mx-20 px-4 sm:px-6 lg:px-8 pb-10"
          id="job-list"
        >
          <JobList
            isSearching={isSearching}
            setIsSearching={setIsSearching}
            searchQuery={searchQuery}
            sortByValue={sortBy}
            selectedCompany={selectedCompany}
          />
        </div>
      </div>
      {/* Share Component */}
      <ShareComponent />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Home;
