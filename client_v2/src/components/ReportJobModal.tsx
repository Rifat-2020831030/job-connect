import React, { useState } from "react";
import { X } from "lucide-react";

interface ReportJobModalProps {
  jobId: string;
  onClose: () => void;
}

export default function ReportJobModal({ jobId, onClose }: ReportJobModalProps) {
  const [issueField, setIssueField] = useState("title");
  const [suggestedInfo, setSuggestedInfo] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/jobs/${jobId}/report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          issue_field: issueField,
          suggested_info: suggestedInfo,
        }),
      });

      let data;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        throw new Error(`Unexpected response: ${response.status} ${response.statusText}`);
      }

      if (!response.ok) {
        throw new Error(data?.message || "Failed to submit report");
      }

      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="bg-white rounded-lg w-full max-w-md shadow-xl overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">Report an Issue</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {success ? (
          <div className="p-8 text-center text-green-600 font-medium">
            Report submitted successfully! Thank you.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-4">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md border border-red-100">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label htmlFor="issueField" className="text-sm font-medium text-gray-700">
                What is the issue with this job?
              </label>
              <select
                id="issueField"
                value={issueField}
                onChange={(e) => setIssueField(e.target.value)}
                className="w-full p-2.5 border border-gray-200 rounded-md bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="title">Incorrect Title</option>
                <option value="salary">Incorrect Salary</option>
                <option value="experience">Incorrect Experience</option>
                <option value="deadline">Incorrect Deadline</option>
                <option value="link">Broken/Incorrect Link</option>
                <option value="vacancy">Incorrect Vacancy</option>
                <option value="category">Incorrect Category</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="suggestedInfo" className="text-sm font-medium text-gray-700">
                Suggest correction (Optional)
              </label>
              <textarea
                id="suggestedInfo"
                value={suggestedInfo}
                onChange={(e) => setSuggestedInfo(e.target.value)}
                placeholder="Please provide the correct information..."
                rows={4}
                maxLength={1000}
                className="w-full p-2.5 border border-gray-200 rounded-md bg-gray-50 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 text-sm font-medium text-white bg-primary hover:bg-emerald-700 rounded-md transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Submitting..." : "Submit Report"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

