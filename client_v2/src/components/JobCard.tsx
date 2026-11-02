import Link from "next/link";
import { Bookmark, Flag, MapPin } from "lucide-react";
import { useState } from "react";
import { useSavedJobs } from "../lib/SavedJobsContext";
import {
  formatDate,
  formatExp,
  formatRelativeTime,
  formatSalary,
  formatVacancy,
} from "../lib/utils";
import CompanyLogo from "./CompanyLogo";
import ReportJobModal from "./ReportJobModal";

export interface JobCardProps {
  _id?: string;
  title: string;
  company: string;
  location: string;
  experience_level?: string;
  salary?: any;
  salary_min?: number;
  salary_max?: number;
  vacancy?: string | number;
  experience?: any;
  deadline?: string;
  first_seen: string;
  skills?: string[];
  logo?: string;
  url?: string;
  onViewDetails?: () => void;
}

export default function JobCard({
  _id,
  title,
  company,
  location,
  experience_level = "Experience Unknown",
  salary,
  salary_min,
  salary_max,
  vacancy,
  experience,
  deadline,
  first_seen,
  skills = [],
  logo,
  url = "#",
  onViewDetails,
}: JobCardProps) {
  const { isJobSaved, toggleSavedJob } = useSavedJobs();
  const isSaved = _id ? isJobSaved(_id) : false;
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const displaySalary = formatSalary(salary, salary_min, salary_max);
  const displayTime = formatRelativeTime(first_seen);

  const displayExp = formatExp(experience);
  const displayVacancy = formatVacancy(vacancy);
  const displayDeadline = formatDate(deadline) || "No Deadline Set";

  const displayLocation =
    location && !/^not\s*specified$/i.test(location.trim())
      ? location.trim()
      : "Location Unknown";

  const displayLevel =
    experience_level && !/^not\s*specified$/i.test(experience_level.trim())
      ? experience_level.trim()
      : "Experience Unknown";

  const jobDetailsHref = _id ? `/jobs/${_id}` : url;

  return (
    <>
      <div className="card flex flex-col justify-between h-full group hover:border-gray-300 transition-colors">
        <div>
          <div className="flex justify-between items-start mb-4">
            <CompanyLogo
              logo={logo}
              companyName={company}
              className="size-12 logo-box text-xl shrink-0"
            />
            <div className="flex gap-2">
              {_id && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsReportModalOpen(true);
                  }}
                  className="text-gray-400 hover:text-red-500 transition-colors shrink-0 cursor-pointer"
                  aria-label="Report Job"
                  title="Report issue with this job"
                >
                  <Flag className="size-5" />
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  _id && toggleSavedJob(_id);
                }}
                className={`${
                  isSaved ? "text-primary" : "text-gray-400"
                } hover:text-primary transition-colors shrink-0 cursor-pointer`}
                aria-label={isSaved ? "Unsave Job" : "Save Job"}
              >
                <Bookmark
                  className="size-5"
                  fill={isSaved ? "currentColor" : "none"}
                />
              </button>
            </div>
          </div>

          <div className="mb-4">
            {_id ? (
              <Link href={jobDetailsHref} className="hover:text-primary transition-colors block">
                <h3
                  className="text-xl font-bold text-foreground mb-1 line-clamp-1"
                  title={title}
                >
                  {title}
                </h3>
              </Link>
            ) : (
              <h3
                className="text-xl font-bold text-foreground mb-1 line-clamp-1"
                title={title}
              >
                {title}
              </h3>
            )}
            <p
              className="text-meta !text-primary mb-2 line-clamp-1"
              title={`${company} • ${displayLocation}`}
            >
              {company} <span className="sm:mx-1 text-primary/60">•</span>
              <MapPin className="size-3.5 inline-block -mt-1 sm:mr-0.5" />
              {displayLocation}
            </p>
            <p className="text-meta tracking-widest mb-2 line-clamp-1">
              {displayLevel}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-y-1 mb-4 text-xs text-gray-500 font-mono">
            <div className="truncate">
              <span className="font-semibold text-gray-700">Exp:</span>{" "}
              {displayExp}
            </div>
            <div className="truncate">
              <span className="font-semibold text-gray-700">Vacancies:</span>{" "}
              {displayVacancy}
            </div>
            {displayDeadline && (
              <div className="col-span-2 truncate">
                <span className="font-semibold text-gray-700">Deadline:</span>{" "}
                {displayDeadline}
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between border-t border-gray-200 pt-4 mb-4">
            <div className="flex flex-col">
              <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-0.5">
                Salary
              </span>
              <span className="font-bold text-foreground truncate">
                {displaySalary}
              </span>
            </div>
            <div className="flex flex-col items-end text-right">
              <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-0.5">
                Posted
              </span>
              <span className="text-meta shrink-0">{displayTime}</span>
            </div>
          </div>

          {/* Capped at 5 with hover tooltip for continuous skills */}
          <div className="flex flex-wrap items-center gap-1.5 mb-4">
            {skills.slice(0, 5).map((tag, index) => (
              <span key={index} className="tag-outline">
                {tag}
              </span>
            ))}
            {skills.length > 5 && (
              <div className="relative group/skills inline-flex items-center">
                <span className="px-2 py-0.5 text-[11px] font-mono border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 uppercase rounded cursor-pointer transition-colors">
                  +{skills.length - 5} more
                </span>
                {/* Hover Popover */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/skills:flex flex-col gap-1.5 p-3 bg-gray-900 text-white rounded-xl shadow-xl z-50 min-w-[200px] max-w-[280px] pointer-events-none transition-all">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-gray-400 border-b border-gray-800 pb-1">
                    Remaining Skills ({skills.length - 5})
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {skills.slice(5).map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-1.5 py-0.5 text-[10px] font-mono bg-gray-800 text-gray-200 rounded border border-gray-700/60"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                </div>
              </div>
            )}
          </div>

          {_id ? (
            <Link
              href={jobDetailsHref}
              className="w-full py-2 btn-secondary block text-center cursor-pointer hover:bg-gray-100 transition-colors"
            >
              View Details
            </Link>
          ) : (
            <a
              href={url}
              className="w-full py-2 btn-secondary block text-center"
            >
              View Details
            </a>
          )}
        </div>
      </div>
      {isReportModalOpen && _id && (
        <ReportJobModal
          jobId={_id}
          onClose={() => setIsReportModalOpen(false)}
        />
      )}
    </>
  );
}
