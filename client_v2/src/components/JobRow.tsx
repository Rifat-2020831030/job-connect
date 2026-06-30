import { Bookmark, Briefcase, Clock, Users } from "lucide-react";
import Image from "next/image";
import { API_BASE_URL } from "../lib/api";
import { formatDate, formatRelativeTime, formatSalary } from "../lib/utils";
import { useSavedJobs } from "../lib/SavedJobsContext";

export interface JobRowProps {
  _id?: string;
  title: string;
  company: string;
  location: string;
  experience_level: string;
  salary?: string;
  salary_min?: number;
  salary_max?: number;
  skills: string[];
  first_seen: string;
  logo?: string;
  url?: string;
  experience?: string;
  vacancy?: string | number;
  deadline?: string;
  onViewDetails?: () => void;
}

export default function JobRow({
  _id,
  title,
  company,
  location,
  experience_level = "Not Specified",
  salary,
  salary_min,
  salary_max,
  skills = [],
  first_seen,
  logo,
  url = "#",
  experience,
  vacancy,
  deadline,
  onViewDetails,
}: JobRowProps) {
  const { isJobSaved, toggleSavedJob } = useSavedJobs();
  const isSaved = _id ? isJobSaved(_id) : false;

  const displaySalary = formatSalary(salary, salary_min, salary_max);
  const displayTime = formatRelativeTime(first_seen);

  const displayExp =
    !experience || experience === "-1" ? "Not Mentioned" : experience;
  const displayVacancy =
    !vacancy || vacancy === "-1" ? "Not Mentioned" : vacancy;
  const displayDeadline = formatDate(deadline) || "Not Mentioned";

  // Define mapping logic if level doesn't explicitly match the sidebar
  let mappedLevel = experience_level;
  if (experience_level && typeof experience_level === "string") {
    if (experience_level.toUpperCase().includes("SENIOR"))
      mappedLevel = "Senior (5+ years)";
    else if (experience_level.toUpperCase().includes("MID"))
      mappedLevel = "Mid-Level (2-5 years)";
    else if (experience_level.toUpperCase().includes("JUNIOR"))
      mappedLevel = "Junior (0-2 years)";
  }

  const handleApplyClick = async () => {
    if (_id) {
      try {
        await fetch(`${API_BASE_URL}/stat/jobs/clicks?jobID=${_id}`);
      } catch (error) {
        console.error("Failed to register job click stat", error);
      }
    }
    if (url && url !== "#") {
      window.open(url, "_blank", "noopener,noreferrer");
    } else {
      alert("No application URL provided for this job.");
    }
  };

  return (
    <div className="group border border-gray-200 bg-white p-5 md:p-6 flex flex-col gap-5 hover:border-gray-300 transition-colors w-full">
      {/* Top Section: Logo & Title (Left) + Seniority & Bookmark (Right) */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        {/* Left: Logo + Title/Company */}
        <div className="flex items-start gap-4 min-w-0">
          <div className="relative size-12 border border-gray-200 p-2 flex items-center justify-center shrink-0">
            {logo ? (
              <Image
                src={logo}
                alt={`${company} logo`}
                fill
                unoptimized
                className="object-contain p-1"
              />
            ) : (
              <div className="w-full h-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                {company.charAt(0)}
              </div>
            )}
          </div>

          <div className="flex flex-col min-w-0">
            {onViewDetails ? (
              <button
                onClick={onViewDetails}
                className="inline-block hover:text-primary transition-colors text-left cursor-pointer"
              >
                <h3 className="text-lg md:text-xl font-bold text-foreground break-words whitespace-normal">
                  {title}
                </h3>
              </button>
            ) : (
              <a
                href={url}
                className="inline-block hover:text-primary transition-colors"
              >
                <h3 className="text-lg md:text-xl font-bold text-foreground break-words whitespace-normal">
                  {title}
                </h3>
              </a>
            )}
            <div className="text-[11px] sm:text-xs font-mono text-gray-500 uppercase tracking-widest flex flex-wrap items-center gap-x-2 gap-y-1 mt-1">
              <span className="truncate max-w-[120px] sm:max-w-none">
                {company}
              </span>
              <span className="text-gray-300">•</span>
              <span className="truncate max-w-[120px] sm:max-w-none">
                {location}
              </span>
            </div>

            {/* Crucial Info (Experience, Vacancy, Deadline) */}
            <div className="flex flex-wrap items-center gap-3 md:gap-5 mt-3">
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <Briefcase className="size-3.5" />
                <span>{displayExp}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <Users className="size-3.5" />
                <span>{displayVacancy} Vacancies</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <Clock className="size-3.5" />
                <span>Deadline: {displayDeadline}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Seniority & Bookmark & Posted */}
        <div className="flex flex-col sm:items-end w-full sm:w-auto shrink-0 mt-2 sm:mt-0 border-t border-gray-100 sm:border-0 pt-3 sm:pt-0">
          <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
            <span className="font-mono text-[11px] uppercase tracking-wider text-gray-400">
              {mappedLevel}
            </span>
            <button
              onClick={() => _id && toggleSavedJob(_id)}
              className={`${isSaved ? "text-primary" : "text-gray-400"} hover:text-primary transition-colors cursor-pointer`}
              aria-label={isSaved ? "Unsave Job" : "Save Job"}
            >
              <Bookmark className="size-5" fill={isSaved ? "currentColor" : "none"} />
            </button>
          </div>
          <div className="flex flex-col sm:items-end text-left sm:text-right mt-3 sm:mt-4">
            <span className="text-[10px] text-gray-400 font-mono uppercase tracking-widest mb-0.5">
              Posted
            </span>
            <span className="text-[11px] font-mono text-gray-600 uppercase tracking-widest">
              {displayTime}
            </span>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="w-full h-px bg-gray-100 my-1 hidden sm:block"></div>

      {/* Bottom Row: Salary, Tags, Posted Time, Buttons */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 min-w-0">
          <div className="flex flex-col">
            <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-0.5">
              Salary
            </span>
            <span className="text-base md:text-lg font-bold text-foreground shrink-0">
              {displaySalary || "Not Mentioned"}
            </span>
          </div>
          <div className="flex flex-wrap gap-2 items-center sm:ml-4">
            {skills.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-1 text-[11px] font-mono border border-gray-200 text-gray-600 uppercase truncate max-w-[120px]"
              >
                {tag}
              </span>
            ))}
            {skills.length > 3 && (
              <span className="px-2.5 py-1 text-[11px] font-mono border border-transparent text-gray-400 uppercase">
                +{skills.length - 3} more
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4 lg:gap-6 shrink-0 border-t border-gray-100 sm:border-0 pt-4 sm:pt-0">
          <div className="flex gap-3 mt-2 sm:mt-0 w-full sm:w-auto">
            {onViewDetails ? (
              <button
                onClick={onViewDetails}
                className="flex-1 sm:flex-none text-center px-4 md:px-6 py-2 text-xs md:text-sm font-bold text-primary border border-primary uppercase tracking-wider hover:bg-primary/5 transition-colors whitespace-nowrap cursor-pointer"
              >
                Details
              </button>
            ) : (
              <a
                href={url}
                className="flex-1 sm:flex-none text-center px-4 md:px-6 py-2 text-xs md:text-sm font-bold text-primary border border-primary uppercase tracking-wider hover:bg-primary/5 transition-colors whitespace-nowrap block"
              >
                Details
              </a>
            )}
            <button
              onClick={handleApplyClick}
              className="flex-1 sm:flex-none text-center px-4 md:px-6 py-2 text-xs md:text-sm font-bold bg-primary text-white border border-primary uppercase tracking-wider hover:bg-emerald-700 transition-colors whitespace-nowrap block cursor-pointer"
            >
              Apply Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
