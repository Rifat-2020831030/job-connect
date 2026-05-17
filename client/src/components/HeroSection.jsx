import { ChevronDownIcon } from "@heroicons/react/24/outline";
import EmailCard from "./EmailCard";
import Navbar from "./Navbar";
import StatCard from "./StatCard";

const HeroSection = ({ stats }) => {
  const scrollToJobSearch = () => {
    const jobSearchElement = document.querySelector("[data-job-search]");
    if (jobSearchElement) {
      jobSearchElement.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Grid Background Pattern with gradient fade */}
      <div className="absolute inset-0 bg-grid-pattern opacity-40"></div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-16 pb-16 sm:pb-20">
        <div className="text-center">
          {/* Main Heading */}
          <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight px-4">
            Your Next Tech Job,
            <br />
            <span className="text-gray-600">Found.</span>
          </h1>

          {/* Subheading */}
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-8 sm:mb-12 leading-relaxed px-4">
            A one-stop platform to get all the latest job updates
            <br className="hidden sm:block" />
            from leading companies and startups.
          </p>

          {/* Email Subscription Box */}
          <EmailCard />

          {/* Stats Section */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 sm:gap-8 max-w-4xl mx-auto px-4 @max-sm:justify-items-center">
            <StatCard label="Active Jobs" value={stats?.totalJobs} delay={0} />
            <StatCard
              label="Companies"
              value={stats?.totalCompanies}
              delay={200}
            />
            <StatCard
              label="Job Seekers"
              value={stats?.totalLocations}
              delay={400}
            />
          </div>

          {/* Animated Down Arrow with Search Job Text */}
          <div className="flex flex-col items-center mt-12 sm:mt-16">
            <button
              onClick={scrollToJobSearch}
              className="group flex flex-col items-center text-gray-600 hover:text-gray-900 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 rounded-lg p-3"
              aria-label="Scroll to job search section"
            >
              <span className="text-xl sm:text-3xl font-medium mb-2 group-hover:text-gray-900 transition-colors duration-300">
                Search Jobs
              </span>
              <ChevronDownIcon className="w-6 h-6 sm:w-10 sm:h-10 animate-bounce group-hover:scale-110 transition-transform duration-300" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
