import {
  AdjustmentsHorizontalIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { Check } from "lucide-react";

const JobSearchAndFilter = ({
  searchQuery,
  handleQueryChange,
  handleSearch,
  sortBy,
  setSortBy,
  companies,
  selectedCompany,
  handleCompanySelection,
}) => {
  return (
    <div className="py-10" data-job-search id="data-job-search">
      {/* Search and Filter Section */}
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
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
                        handleQueryChange(e.target.value);
                      }}
                      className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 text-gray-700 placeholder-gray-400"
                    />
                  </div>
                  <button
                    type="submit"
                    onClick={handleSearch}
                    className={`w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-12 rounded-xl transition-all duration-200`}
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

              {/* Company list or skeleton */}
              <div className="flex flex-wrap gap-2 my-6">
                <p className="text-lg font-semibold mb-3 w-full">
                  Top Companies Hiring
                </p>
                {companies.length > 0
                  ? companies.map((company, index) => (
                      <span
                        key={index}
                        onClick={() => handleCompanySelection(company)}
                        className={`flex flex-row items-center gap-0.5 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium hover:bg-blue-200 transition-colors duration-200 cursor-pointer ${
                          selectedCompany.includes(company)
                            ? "bg-blue-500 text-white font-bold"
                            : ""
                        }`}
                      >
                        {company}
                        {selectedCompany.includes(company) && <Check />}
                      </span>
                    ))
                  : Array.from({ length: 6 }).map((_, idx) => (
                      <span
                        key={idx}
                        className="h-8 w-28 bg-gray-200 animate-pulse rounded-full"
                      ></span>
                    ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobSearchAndFilter;
