import axios from "axios";
import { useState } from "react";
import ExpandableSection from "./ExpandableSection";
import JobCardDetails from "./JobCardDetails";
import JobCardHeader from "./JobCardHeader";
import JobCardTags from "./JobCardTags";

const ModernJobCard = ({ job }) => {
  const [expandedSections, setExpandedSections] = useState({
    benefits: false,
    languages: false,
    skills: false,
  });

  // Helper function to check if job is recent (within 3 days)
  const isRecent = () => {
    if (!job.timestamp) return false;
    const jobDate = new Date(job.timestamp);
    const currentDate = new Date();
    const diffTime = currentDate - jobDate;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3;
  };

  // Helper function to check if deadline is urgent (within 3 days)
  const isUrgent = () => {
    if (!job.deadline) return false;
    const deadlineDate = new Date(job.deadline);
    const currentDate = new Date();
    const diffTime = deadlineDate - currentDate;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3 && diffDays > 0;
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      benefits: false,
      languages: false,
      skills: false,
      [section]: !prev[section],
    }));
  };

  const formatDeadline = (deadline) => {
    if (!deadline) return "Not Specified";
    return new Date(deadline).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatSalary = (salaryMin, salaryMax) => {
    if ((!salaryMin || salaryMin === -1) && (!salaryMax || salaryMax === -1))
      return "Not Specified";
    if (salaryMin && salaryMin !== -1 && salaryMax && salaryMax !== -1)
      return `${salaryMin} - ${salaryMax}`;
    if (salaryMin && salaryMin !== -1) return `From $${salaryMin}`;
    if (salaryMax && salaryMax !== -1) return `Up to $${salaryMax}`;
  };

  // Get job type color
  const getJobTypeColor = (type) => {
    const colors = {
      "Full-time": "bg-green-100 text-green-800",
      "Part-time": "bg-blue-100 text-blue-800",
      Onsite: "bg-purple-100 text-purple-800",
      Remote: "bg-orange-100 text-orange-800",
      Hybrid: "bg-indigo-100 text-indigo-800",
      Internship: "bg-green-100 text-green-800",
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  // Get experience level color
  const getExperienceLevelColor = (level) => {
    const colors = {
      Junior: "bg-blue-100 text-blue-800",
      Mid: "bg-yellow-100 text-yellow-800",
      Senior: "bg-red-100 text-purple-800",
    };
    return colors[level] || "bg-gray-100 text-gray-800";
  };

  const handleJobClick = async () => {
    try {
      await axios.get(
        import.meta.env.VITE_BACKEND_URL + `/stat/jobs/clicks?jobID=${job._id}`
      );
    } catch (error) {}
    window.open(job.url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="flex flex-col bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden min-w-[350px] max-w-[400px] w-full">
      {/* Header Section */}
      <JobCardHeader job={job} isRecent={isRecent} isUrgent={isUrgent} />

      {/* Details Section */}
      <JobCardDetails
        job={job}
        formatSalary={formatSalary}
        formatDeadline={formatDeadline}
        isUrgent={isUrgent}
      />

      {/* Tags Section */}
      <JobCardTags
        job={job}
        getJobTypeColor={getJobTypeColor}
        getExperienceLevelColor={getExperienceLevelColor}
      />

      {/* Expandable Sections */}
      <div className="px-6 py-4 space-y-3">
        <ExpandableSection
          title="Skills"
          icon={
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
              />
            </svg>
          }
          items={job.skills}
          isExpanded={expandedSections.skills}
          onToggle={() => toggleSection("skills")}
          colorClass="bg-blue-100 text-blue-800"
          previewCount={3}
        />

        <ExpandableSection
          title="Languages"
          icon={
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
              />
            </svg>
          }
          items={job.languages}
          isExpanded={expandedSections.languages}
          onToggle={() => toggleSection("languages")}
          colorClass="bg-green-100 text-green-800"
          previewCount={3}
        />

        <ExpandableSection
          title="Benefits"
          icon={
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
              />
            </svg>
          }
          items={job.benefits}
          isExpanded={expandedSections.benefits}
          onToggle={() => toggleSection("benefits")}
          colorClass="bg-purple-100 text-purple-800"
          previewCount={2}
        />
      </div>

      {/* Cover empty space and push button to bottom */}
      <div className="flex-grow"></div>

      {/* Action Button */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
        <button
          className="w-full bg-[#1d1160] hover:bg-[#1d1160c6] text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"
          onClick={() => handleJobClick()}
        >
          <span>Apply Now</span>
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14 5l7 7m0 0l-7 7m7-7H3"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ModernJobCard;
