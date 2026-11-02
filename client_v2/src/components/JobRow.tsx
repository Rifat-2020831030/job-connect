"use client";

import Link from "next/link";
import { Bookmark, Briefcase, Clock, Flag, MapPin, Users } from "lucide-react";
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

export interface JobRowProps {
  _id?: string;
  title: string;
  company: string;
  location: string;
  experience_level?: string;
  salary?: any;
  salary_min?: number;
  salary_max?: number;
  skills?: string[];
  first_seen: string;
  logo?: string;
  url?: string;
  experience?: any;
  vacancy?: string | number;
  deadline?: string;
  onViewDetails?: () => void;
  isExpired?: boolean;
}

export default function JobRow({
  _id,
  title,
  company,
  location,
  experience_level = "Experience Unknown",
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
  isExpired = false,
}: JobRowProps) {
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

  // Define mapping logic if level doesn't explicitly match the sidebar
  let mappedLevel = experience_level;
  if (!experience_level || /^not\s*specified$/i.test(experience_level.trim())) {
    mappedLevel = "Experience Unknown";
  } else if (typeof experience_level === "string") {
    if (experience_level.toUpperCase().includes("SENIOR"))
      mappedLevel = "Senior (5+ years)";
    else if (experience_level.toUpperCase().includes("MID"))
      mappedLevel = "Mid-Level (2-5 years)";
    else if (experience_level.toUpperCase().includes("JUNIOR"))
      mappedLevel = "Junior (0-2 years)";
  }

  const jobDetailsHref = _id ? `/jobs/${_id}` : url;

  return (
    <>
      <div className="group border border-gray-200 bg-white p-5 md:p-6 flex flex-col gap-5 hover:border-gray-300 transition-colors w-full">
        {/* Top Section: Logo & Title (Left) + Seniority & Bookmark (Right) */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          {/* Left: Logo + Title/Company */}
          <div className="flex items-start gap-4 min-w-0">
            <CompanyLogo
              companyName={company}
              className="size-12 shrink-0 border border-gray-200"
              fallbackClassName="bg-primary/10 text-primary font-bold text-lg"
            />

            <div className="flex flex-col min-w-0">
              {isExpired ? (
                <div className="inline-block text-gray-500">
                  <h3 className="text-lg md:text-xl font-bold break-words whitespace-normal">
                    {title}
                  </h3>
                </div>
              ) : _id ? (
                <Link
                  href={jobDetailsHref}
                  className="inline-block hover:text-primary transition-colors text-left"
                >
                  <h3 className="text-lg md:text-xl font-bold text-foreground break-words whitespace-normal">
                    {title}
                  </h3>
                </Link>
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
                <span className="mx-1 text-primary/60 sm:text-2xl">•</span>
                <MapPin className="size-3.5 inline-block -mt-1 sm:mr-0.5" />
                <span className="truncate max-w-[120px] sm:max-w-none">
                  {displayLocation}
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
                  <span>{displayVacancy}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Clock className="size-3.5" />
                  <span>{displayDeadline}</span>
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
              <div className="flex gap-2">
                {_id && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsReportModalOpen(true);
                    }}
                    className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
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
                  } hover:text-primary transition-colors cursor-pointer`}
                  aria-label={isSaved ? "Unsave Job" : "Save Job"}
                >
                  <Bookmark
                    className="size-5"
                    fill={isSaved ? "currentColor" : "none"}
                  />
                </button>
              </div>
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

        {/* Bottom Row: Salary, Tags, Posted Time, Details Link */}
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 min-w-0">
            <div className="flex flex-col">
              <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-0.5">
                Salary
              </span>
              <span className="text-base md:text-lg font-bold text-foreground shrink-0">
                {displaySalary}
              </span>
            </div>

            {/* Capped at 5 with hover tooltip for continuous skills */}
            <div className="flex flex-wrap items-center gap-1.5 sm:ml-4">
              {skills.slice(0, 5).map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 text-[11px] font-mono border border-gray-200 text-gray-600 uppercase truncate max-w-[120px]"
                >
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
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4 lg:gap-6 shrink-0 border-t border-gray-100 sm:border-0 pt-4 sm:pt-0">
            {isExpired ? (
              <div className="flex items-center justify-center px-6 py-2 text-sm font-bold text-gray-400 border border-gray-200 bg-gray-50 uppercase tracking-wider">
                Closed
              </div>
            ) : (
              <div className="flex gap-3 mt-2 sm:mt-0 w-full sm:w-auto">
                {_id ? (
                  <Link
                    href={jobDetailsHref}
                    className="flex-1 sm:flex-none text-center px-6 py-2 text-xs md:text-sm font-bold text-primary border border-primary uppercase tracking-wider hover:bg-primary/5 transition-colors whitespace-nowrap block"
                  >
                    View Details
                  </Link>
                ) : (
                  <a
                    href={url}
                    className="flex-1 sm:flex-none text-center px-6 py-2 text-xs md:text-sm font-bold text-primary border border-primary uppercase tracking-wider hover:bg-primary/5 transition-colors whitespace-nowrap block"
                  >
                    View Details
                  </a>
                )}
              </div>
            )}
          </div>
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
