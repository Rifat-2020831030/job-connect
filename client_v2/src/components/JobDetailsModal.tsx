"use client";

import { useTracking } from "@/contexts/TrackingContext";
import type { JobDetail } from "@/types/job";
import {
  Banknote,
  Briefcase,
  Calendar,
  Check,
  GraduationCap,
  MapPin,
  Maximize2,
  Share2,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { RemoveScroll } from "react-remove-scroll";
import { toast } from "sonner";
import {
  formatDate,
  formatExp,
  formatSalary,
  formatVacancy,
} from "../lib/utils";
import CompanyLogo from "./CompanyLogo";

export type { JobDetail };

interface JobDetailsModalProps {
  job: JobDetail;
  onClose: () => void;
}

export default function JobDetailsModal({
  job,
  onClose,
}: JobDetailsModalProps) {
  const { handleApply } = useTracking();

  const companyName = job.company?.trim() || "Company";
  const jobTitle = job.title?.trim() || "Untitled Position";
  const jobLocation =
    job.location && !/^not\s*specified$/i.test(job.location.trim())
      ? job.location.trim()
      : "Location Unknown";
  const jobType =
    job.job_type && !/^not\s*specified$/i.test(job.job_type.trim())
      ? job.job_type.trim()
      : "Job Type Unspecified";

  const salaryObj =
    typeof job.salary === "object" && job.salary !== null ? job.salary : null;
  const expObj =
    typeof job.experience === "object" && job.experience !== null
      ? job.experience
      : null;

  const displaySalary = formatSalary(
    job.salary,
    job.salary_min,
    job.salary_max
  );
  const displayExp = formatExp(job.experience);
  const displayVacancy = formatVacancy(job.vacancy);
  const displayDeadline = formatDate(job.deadline) || "No Deadline Set";

  const isFreshersAllowed = Boolean(
    expObj?.is_freshers_allowed ||
      (typeof job.experience === "string" && /fresher/i.test(job.experience)) ||
      (expObj?.text_form && /fresher/i.test(expObj.text_form))
  );

  const reqObj = job.requirements || null;
  const educationList = reqObj?.education || [];
  const requiredList = reqObj?.required || [];
  const preferredList = reqObj?.preferred || [];
  const responsibilities = job.responsibilities || [];
  const benefits = job.benefits || [];
  const skills = job.skills || [];

  const handleShare = async () => {
    try {
      const base = job._id
        ? `${window.location.origin}/jobs/${job._id}`
        : window.location.href;
      let shareUrl = base;
      try {
        const u = new URL(base);
        u.searchParams.set("utm_source", "job_share");
        shareUrl = u.toString();
      } catch {
        shareUrl = base;
      }
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied to clipboard!");
    } catch {
      toast.error("Failed to copy link");
    }
  };

  return (
    <RemoveScroll>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-[#131b2e]/50 backdrop-blur-xs transition-opacity"
          onClick={onClose}
        />

        {/* Modal Container */}
        <div className="relative bg-white w-full max-w-3xl max-h-[92vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-gray-200">
          {/* Header */}
          <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-gray-100 bg-white shrink-0">
            <h2 className="text-sm sm:text-base font-bold text-foreground">
              Job Overview
            </h2>
            <div className="flex items-center gap-2">
              {job._id && (
                <Link
                  href={`/jobs/${job._id}`}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 hover:text-black flex items-center gap-1.5 text-xs font-semibold"
                  title="Open in full page view"
                >
                  <Maximize2 className="size-3.5" />
                  <span className="hidden sm:inline">Full Page</span>
                </Link>
              )}
              <button
                onClick={handleShare}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 hover:text-black flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
                title="Share Job"
              >
                <Share2 className="size-3.5" />
                <span className="hidden sm:inline">Share</span>
              </button>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-black cursor-pointer"
                aria-label="Close modal"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-7 flex flex-col gap-6 custom-scrollbar">
            {/* Title & Company Row */}
            <div className="flex items-start gap-4">
              <CompanyLogo
                logo={job.logo || job.logoUrl}
                companyName={companyName}
                className="size-14 border border-gray-200 rounded-xl bg-white shrink-0"
                fallbackClassName="bg-primary/10 text-primary font-bold text-xl rounded-xl"
              />
              <div className="flex-1 min-w-0">
                <h1 className="text-lg sm:text-2xl font-extrabold text-foreground tracking-tight leading-tight">
                  {jobTitle}
                </h1>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs sm:text-sm text-gray-600">
                  <span className="font-mono font-bold text-emerald-700 uppercase tracking-wide">
                    {companyName}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="size-3.5 text-gray-400" />
                    <span>{jobLocation}</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Briefcase className="size-3.5 text-gray-400" />
                    <span>{jobType}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Freshers Allowed Pill */}
            {isFreshersAllowed && (
              <div className="flex">
                <span className="px-2.5 py-0.5 text-[11px] font-bold font-mono uppercase text-black border border-black bg-white rounded-full inline-flex items-center gap-1.5">
                  <Check className="size-3 text-blue-600 stroke-[2.5]" />
                  <span>Freshers Allowed</span>
                </span>
              </div>
            )}

            {/* Quick Metrics Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100 text-xs">
              <div className="flex flex-col gap-0.5">
                <span className="font-mono text-gray-400 uppercase text-[10px] tracking-wider flex items-center gap-1">
                  <Banknote className="size-3" />
                  Salary
                </span>
                <span className="font-bold text-gray-900 truncate">
                  {displaySalary}
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="font-mono text-gray-400 uppercase text-[10px] tracking-wider flex items-center gap-1">
                  <Briefcase className="size-3" />
                  Experience
                </span>
                <span className="font-bold text-gray-900 truncate">
                  {displayExp}
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="font-mono text-gray-400 uppercase text-[10px] tracking-wider flex items-center gap-1">
                  <Users className="size-3" />
                  Vacancy
                </span>
                <span className="font-bold text-gray-900 truncate">
                  {displayVacancy}
                </span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="font-mono text-gray-400 uppercase text-[10px] tracking-wider flex items-center gap-1">
                  <Calendar className="size-3" />
                  Deadline
                </span>
                <span className="font-bold text-gray-900 truncate">
                  {displayDeadline}
                </span>
              </div>
            </div>

            {/* Intro */}
            {job.intro && (
              <div className="p-4 bg-emerald-50/50 border-l-4 border-emerald-600 rounded-r-xl">
                <p className="text-sm text-gray-700 leading-relaxed italic">
                  &ldquo;{job.intro}&rdquo;
                </p>
              </div>
            )}

            {/* Responsibilities */}
            {responsibilities.length > 0 && (
              <div className="flex flex-col gap-2.5">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-gray-900">
                  Key Responsibilities
                </h3>
                <ul className="flex flex-col gap-2">
                  {responsibilities.map((resp, idx) => (
                    <li
                      key={idx}
                      className="text-xs sm:text-sm text-gray-700 flex items-start gap-2.5 leading-relaxed"
                    >
                      <span className="size-1.5 rounded-full bg-emerald-600 shrink-0 mt-2" />
                      <span>{resp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Requirements */}
            {(educationList.length > 0 ||
              requiredList.length > 0 ||
              preferredList.length > 0) && (
              <div className="flex flex-col gap-4">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-gray-900">
                  Requirements & Qualifications
                </h3>

                {educationList.length > 0 && (
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <span className="text-xs font-semibold text-gray-900 flex items-center gap-1.5 mb-1.5">
                      <GraduationCap className="size-3.5 text-gray-500" />
                      Education
                    </span>
                    <ul className="flex flex-col gap-1 text-xs text-gray-700">
                      {educationList.map((edu, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span>•</span>
                          <span>{edu}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {requiredList.length > 0 && (
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-semibold text-gray-900">
                      Required
                    </span>
                    <ul className="flex flex-col gap-2">
                      {requiredList.map((req, idx) => (
                        <li
                          key={idx}
                          className="text-xs sm:text-sm text-gray-700 flex items-start gap-2.5 leading-relaxed"
                        >
                          <Check className="size-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {preferredList.length > 0 && (
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-semibold text-gray-900">
                      Preferred / Bonus
                    </span>
                    <ul className="flex flex-col gap-2">
                      {preferredList.map((pref, idx) => (
                        <li
                          key={idx}
                          className="text-xs sm:text-sm text-gray-700 flex items-start gap-2.5 leading-relaxed"
                        >
                          <Sparkles className="size-3.5 text-amber-500 shrink-0 mt-0.5" />
                          <span>{pref}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Description fallback if no structured responsibilities or requirements */}
            {!job.intro &&
              responsibilities.length === 0 &&
              !reqObj &&
              job.description && (
                <div className="flex flex-col gap-2">
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-gray-900">
                    About The Role
                  </h3>
                  <div className="text-xs sm:text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                    {job.description}
                  </div>
                </div>
              )}

            {/* Benefits */}
            {benefits.length > 0 && (
              <div className="flex flex-col gap-2.5">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-gray-900">
                  Benefits & Perks
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {benefits.map((benefit, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-gray-50 border border-gray-100 rounded-lg text-xs text-gray-700 flex items-start gap-2"
                    >
                      <Check className="size-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skills */}
            {skills.length > 0 && (
              <div className="flex flex-col gap-2">
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-gray-900">
                  Skills & Technologies
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 text-xs font-mono border border-gray-200 bg-gray-50 text-gray-700 rounded-md"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-4 sm:p-5 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-3 shrink-0">
            {job._id ? (
              <Link
                href={`/jobs/${job._id}`}
                className="text-xs font-semibold text-gray-700 hover:text-black hover:underline"
              >
                View Full Page Details &rarr;
              </Link>
            ) : (
              <span />
            )}
            <button
              onClick={() => handleApply({ url: job.url, _id: job._id })}
              className="px-6 py-2.5 bg-primary hover:bg-emerald-700 text-white font-bold rounded-lg text-sm transition-colors cursor-pointer shadow-xs"
            >
              Apply on Company Site
            </button>
          </div>
        </div>
      </div>
    </RemoveScroll>
  );
}
