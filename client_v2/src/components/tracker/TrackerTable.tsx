"use client";

import { formatDate } from "@/lib/utils";
import { ChevronDown, Loader2 } from "lucide-react";
import { useState } from "react";
import { JobDetail } from "../JobDetailsModal";

export type TrackedJob = {
  _id: string;
  userId: string;
  jobId: string;
  status:
    | "PENDING_CONFIRMATION"
    | "APPLIED"
    | "INTERVIEWING"
    | "OFFER"
    | "REJECTED"
    | "EXPIRED";
  notes?: string;
  history: Array<{ state: string; timestamp: string }>;
  updatedAt: string;
  createdAt: string;
  jobDetails: JobDetail;
};

interface TrackerTableProps {
  jobs: TrackedJob[];
  onUpdateStatus: (id: string, newStatus: string) => Promise<void>;
  onOpenNotes: (job: TrackedJob) => void;
  onDelete: (id: string) => Promise<void>;
}

const STATUS_OPTIONS = [
  { value: "PENDING_CONFIRMATION", label: "Pending" },
  { value: "APPLIED", label: "Applied" },
  { value: "INTERVIEWING", label: "Interviewing" },
  { value: "OFFER", label: "Offer" },
  { value: "REJECTED", label: "Rejected" },
  { value: "EXPIRED", label: "Expired" },
];

// Helper to determine status severity/index
// NOTE: This must be kept in sync with STATUS_ORDER in server/src/controller/tracker-controller.js
const STATUS_ORDER: Record<string, number> = {
  PENDING_CONFIRMATION: 0,
  APPLIED: 1,
  INTERVIEWING: 2,
  OFFER: 3,
  REJECTED: 4,
  EXPIRED: 4,
};

export default function TrackerTable({
  jobs,
  onUpdateStatus,
  onOpenNotes,
  onDelete,
}: TrackerTableProps) {
  const [loadingRows, setLoadingRows] = useState<Record<string, boolean>>({});
  const [confirmBackwardData, setConfirmBackwardData] = useState<{
    job: TrackedJob;
    newStatus: string;
  } | null>(null);

  const handleStatusChange = async (job: TrackedJob, newStatus: string) => {
    if (job.status === newStatus) return;

    const oldOrder = STATUS_ORDER[job.status] ?? -1;
    const newOrder = STATUS_ORDER[newStatus] ?? -1;

    // Backward movement confirmation
    if (newOrder < oldOrder) {
      setConfirmBackwardData({ job, newStatus });
      return;
    }

    await performStatusUpdate(job, newStatus);
  };

  const performStatusUpdate = async (job: TrackedJob, newStatus: string) => {
    setLoadingRows((prev) => ({ ...prev, [job._id]: true }));
    try {
      await onUpdateStatus(job._id, newStatus);
    } finally {
      setLoadingRows((prev) => ({ ...prev, [job._id]: false }));
    }
  };

  return (
    <div className="w-full overflow-x-auto bg-white rounded-lg shadow-sm border border-gray-200">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-50 text-left text-xs font-mono uppercase tracking-wider text-gray-500 border-b-1">
            <th className="px-6 py-4 font-semibold">Job Title</th>
            <th className="px-6 py-4 font-semibold">Company Name</th>
            <th className="px-6 py-4 font-semibold">Status</th>
            <th className="px-6 py-4 font-semibold">Applied Date</th>
            <th className="px-6 py-4 font-semibold">Deadline</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {jobs.length === 0 && (
            <tr>
              <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                No tracked jobs found. Start applying!
              </td>
            </tr>
          )}
          {jobs.map((job) => {
            const isLoading = loadingRows[job._id];
            const isPending = job.status === "PENDING_CONFIRMATION";

            return (
              <tr
                key={job._id}
                onClick={() => {
                  if (isLoading) return;
                  onOpenNotes(job);
                }}
                className={`hover:bg-gray-50 transition-colors group cursor-pointer ${
                  isPending ? "bg-orange-50/30" : ""
                } ${isLoading ? "opacity-50 pointer-events-none" : ""}`}
              >
                <td className="px-6 py-4">
                  <a
                    href={job.jobDetails?.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-emerald-700 hover:underline line-clamp-1"
                    title={job.jobDetails?.title}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {job.jobDetails?.title || "Unknown Title"}
                  </a>
                  {job.notes && (
                    <span className="inline-block mt-1 bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                      Notes
                    </span>
                  )}
                </td>

                <td className="px-6 py-4">
                  <span className="font-semibold text-gray-900">
                    {job.jobDetails?.company || "Unknown"}
                  </span>
                </td>

                <td
                  className="px-6 py-4 relative"
                  onClick={(e) => e.stopPropagation()}
                >
                  {isPending ? (
                    <div className="flex items-center gap-2">
                      <select
                        disabled
                        className="w-full sm:w-auto px-3 py-1.5 bg-orange-50 border border-orange-200 rounded-lg text-xs font-semibold text-orange-700 appearance-none pr-8 opacity-70 cursor-not-allowed"
                      >
                        <option>PENDING</option>
                      </select>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusChange(job, "APPLIED");
                        }}
                        disabled={isLoading}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
                      >
                        Confirm
                      </button>
                    </div>
                  ) : (
                    <div className="relative inline-block w-full max-w-[140px]">
                      <select
                        value={job.status}
                        onChange={(e) =>
                          handleStatusChange(job, e.target.value)
                        }
                        disabled={isLoading}
                        className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer appearance-none pr-8 disabled:opacity-50"
                      >
                        {STATUS_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                      {isLoading && (
                        <div className="absolute -right-5 top-1/2 -translate-y-1/2">
                          <Loader2 className="w-3 h-3 animate-spin text-gray-400" />
                        </div>
                      )}
                    </div>
                  )}
                </td>

                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-600">
                      {formatDate(job.createdAt)}
                    </span>
                    <span className="text-[11px] text-gray-400 font-mono mt-0.5">
                      {new Date(job.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </td>

                <td className="px-6 py-4">
                  <span className="text-sm text-gray-600">
                    {job.jobDetails?.deadline
                      ? formatDate(job.jobDetails.deadline)
                      : "N/A"}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {confirmBackwardData && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-[#131b2e]/40 backdrop-blur-sm"
            onClick={() => setConfirmBackwardData(null)}
          />
          <div className="relative bg-white w-full max-w-sm rounded-lg shadow-xl p-6 flex flex-col gap-4 animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-bold text-gray-900">
              Confirm Status Change
            </h3>
            <p className="text-sm text-gray-600">
              Moving status backward (from{" "}
              <span className="font-semibold">
                {confirmBackwardData.job.status}
              </span>{" "}
              to{" "}
              <span className="font-semibold">
                {confirmBackwardData.newStatus}
              </span>
              ) will remove all newer history. Are you sure?
            </p>
            <div className="flex justify-end gap-3 mt-2">
              <button
                onClick={() => setConfirmBackwardData(null)}
                className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  performStatusUpdate(
                    confirmBackwardData.job,
                    confirmBackwardData.newStatus
                  );
                  setConfirmBackwardData(null);
                }}
                className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
