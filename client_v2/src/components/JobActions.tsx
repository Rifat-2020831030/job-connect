"use client";

import React, { useState } from "react";
import { Bookmark, ExternalLink, Flag, Share2, Check, Clock } from "lucide-react";
import { toast } from "sonner";
import { useSavedJobs } from "@/lib/SavedJobsContext";
import { useTracking } from "@/contexts/TrackingContext";
import ReportJobModal from "./ReportJobModal";
import { JobDetail } from "@/types/job";

interface JobActionsProps {
  job: JobDetail;
  isExpired?: boolean;
  variant?: "header" | "card" | "mobile-bar" | "compact";
}

export default function JobActions({
  job,
  isExpired = false,
  variant = "header",
}: JobActionsProps) {
  const { handleApply } = useTracking();
  const { isJobSaved, toggleSavedJob } = useSavedJobs();
  const isSaved = job._id ? isJobSaved(job._id) : false;

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const jobTitle = job.title?.trim() || "Job Opening";
    const companyName = job.company?.trim() || "Company";

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${jobTitle} at ${companyName}`,
          text: `Check out this opening for ${jobTitle} at ${companyName} on ChakriLagbe!`,
          url,
        });
        return;
      } catch (err: any) {
        if (err.name !== "AbortError") {
          // Fall back to copy
        }
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Job link copied to clipboard!");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const onApplyClick = () => {
    if (!job.url) {
      toast.error("Application link is not available for this job.");
      return;
    }
    handleApply({ url: job.url, _id: job._id });
  };

  if (variant === "mobile-bar") {
    return (
      <div className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 p-3 sm:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        <div className="flex items-center gap-2 max-w-lg mx-auto">
          <button
            onClick={() => job._id && toggleSavedJob(job._id)}
            className={`p-3 rounded-lg border transition-colors cursor-pointer ${
              isSaved
                ? "border-primary bg-primary/10 text-primary"
                : "border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
            aria-label={isSaved ? "Saved" : "Save Job"}
          >
            <Bookmark className="size-5" fill={isSaved ? "currentColor" : "none"} />
          </button>

          <button
            onClick={handleShare}
            className="p-3 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
            aria-label="Share"
          >
            {copied ? <Check className="size-5 text-emerald-600" /> : <Share2 className="size-5" />}
          </button>

          {isExpired ? (
            <div className="flex-1 py-3 px-4 bg-gray-100 text-gray-500 font-bold rounded-lg text-center text-sm flex items-center justify-center gap-1.5 cursor-not-allowed">
              <Clock className="size-4" />
              <span>Application Closed</span>
            </div>
          ) : (
            <button
              onClick={onApplyClick}
              disabled={!job.url}
              className="flex-1 py-3 px-4 bg-primary hover:bg-emerald-700 text-white font-bold rounded-lg text-center text-sm transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Apply</span>
              <ExternalLink className="size-4" />
            </button>
          )}
        </div>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <>
        <div className="flex items-center gap-2">
          <button
            onClick={() => job._id && toggleSavedJob(job._id)}
            className={`p-2.5 rounded-lg border transition-colors cursor-pointer ${
              isSaved
                ? "border-primary/40 bg-primary/10 text-primary"
                : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
            }`}
            title={isSaved ? "Saved" : "Save Job"}
          >
            <Bookmark className="size-4" fill={isSaved ? "currentColor" : "none"} />
          </button>
          <button
            onClick={handleShare}
            className="p-2.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
            title="Share"
          >
            {copied ? <Check className="size-4 text-emerald-600" /> : <Share2 className="size-4" />}
          </button>
          {isExpired ? (
            <div className="px-4 py-2 bg-gray-100 text-gray-400 font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-not-allowed">
              <Clock className="size-3.5" />
              <span>Closed</span>
            </div>
          ) : (
            <button
              onClick={onApplyClick}
              disabled={!job.url}
              className="px-4 py-2 bg-primary hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <span>Apply</span>
              <ExternalLink className="size-3.5" />
            </button>
          )}
        </div>
        {isReportModalOpen && job._id && (
          <ReportJobModal
            jobId={job._id}
            onClose={() => setIsReportModalOpen(false)}
          />
        )}
      </>
    );
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        {/* Save / Bookmark Button */}
        <button
          onClick={() => job._id && toggleSavedJob(job._id)}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-lg border text-sm font-semibold transition-all cursor-pointer ${
            isSaved
              ? "border-primary/40 bg-primary/10 text-primary shadow-xs"
              : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300"
          }`}
          title={isSaved ? "Remove from saved jobs" : "Save job"}
        >
          <Bookmark className="size-4" fill={isSaved ? "currentColor" : "none"} />
          <span className="hidden sm:inline">{isSaved ? "Saved" : "Save"}</span>
        </button>

        {/* Share Button */}
        <button
          onClick={handleShare}
          className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300 text-sm font-semibold transition-all cursor-pointer"
          title="Share this job"
        >
          {copied ? (
            <>
              <Check className="size-4 text-emerald-600" />
              <span className="hidden sm:inline text-emerald-600">Copied</span>
            </>
          ) : (
            <>
              <Share2 className="size-4 text-gray-500" />
              <span className="hidden sm:inline">Share</span>
            </>
          )}
        </button>

        {/* Report Button */}
        {job._id && (
          <button
            onClick={() => setIsReportModalOpen(true)}
            className="flex items-center gap-1.5 p-2.5 rounded-lg border border-gray-200 bg-white text-gray-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50/50 transition-all cursor-pointer"
            title="Report inaccurate info"
          >
            <Flag className="size-4" />
          </button>
        )}

        {/* Apply Button */}
        {isExpired ? (
          <div className="px-5 py-2.5 bg-gray-100 text-gray-500 border border-gray-200 font-bold rounded-lg text-sm flex items-center gap-2 cursor-not-allowed">
            <Clock className="size-4" />
            <span>Application Closed</span>
          </div>
        ) : (
          <button
            onClick={onApplyClick}
            disabled={!job.url}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-emerald-700 text-white font-bold rounded-lg text-sm transition-all shadow-sm hover:shadow-md cursor-pointer ml-auto sm:ml-0 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>Apply</span>
            <ExternalLink className="size-4" />
          </button>
        )}
      </div>

      {isReportModalOpen && job._id && (
        <ReportJobModal
          jobId={job._id}
          onClose={() => setIsReportModalOpen(false)}
        />
      )}
    </>
  );
}
