"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { getUserInfo } from "@/lib/auth";
import { fetchWithAuth } from "@/lib/apiClient";
import JobRow from "@/components/JobRow";
import JobDetailsModal, { JobDetail } from "@/components/JobDetailsModal";
import { BookmarkMinus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { API_BASE_URL } from "@/lib/api";

function SavedJobsContent() {
  const router = useRouter();
  const [savedJobs, setSavedJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<JobDetail | null>(null);

  useEffect(() => {
    const fetchJobs = async () => {
      const userInfo = getUserInfo();
      if (!userInfo?.userId) {
        toast.error("Please login to view your saved jobs.");
        router.push("/login");
        return;
      }

      try {
        const res = await fetchWithAuth(`/users/${userInfo.userId}/saved-jobs`);
        const data = await res.json();
        
        if (res.ok && data.status === 1) {
          setSavedJobs(data.data);
        } else {
          toast.error("Failed to load saved jobs.");
        }
      } catch (error) {
        toast.error("An error occurred while loading saved jobs.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const handleViewDetails = async (jobId: string, fallbackJob: any) => {
    if (!jobId) {
      setSelectedJob(fallbackJob);
      return;
    }
    
    try {
      const res = await fetch(`${API_BASE_URL}/jobs/${jobId}`);
      const data = await res.json();
      
      if (res.ok && data.status === 1) {
        setSelectedJob(data.data);
      } else {
        setSelectedJob(fallbackJob);
      }
    } catch (err) {
      setSelectedJob(fallbackJob);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col py-12 px-6">
      <div className="w-full max-w-5xl mx-auto flex flex-col gap-8">
        
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-[11px] font-mono font-bold tracking-widest uppercase">
            <span className="text-gray-500 font-normal">PROFILE</span>
            <span className="text-gray-400">/</span>
            <span className="text-primary">SAVED JOBS</span>
          </div>
          <div className="flex flex-col gap-3">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">Your Saved Jobs</h1>
            <p className="text-lg text-gray-500 max-w-2xl">
              Keep track of your favorite roles and apply when you're ready.
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 bg-white border border-gray-200 rounded-lg">
            <Loader2 className="animate-spin h-8 w-8 text-primary" />
            <span className="text-gray-500 font-medium">Loading your saved jobs...</span>
          </div>
        ) : savedJobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 bg-white border border-gray-200 rounded-lg text-center px-4">
            <div className="size-16 bg-gray-50 rounded-full flex items-center justify-center mb-2">
              <BookmarkMinus className="size-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-foreground">No saved jobs yet</h3>
            <p className="text-gray-500 max-w-md">
              When you see a job you like, click the bookmark icon to save it here for later.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {/* The JobRow component internally connects to SavedJobsContext to read isSaved and toggle it */}
            {savedJobs.map((job) => (
              <JobRow
                key={job._id}
                _id={job._id}
                title={job.title}
                company={job.company}
                location={job.location}
                experience_level={job.experience_level}
                salary={job.salary}
                salary_min={job.salary_min}
                salary_max={job.salary_max}
                skills={job.skills || job.tags || []}
                first_seen={job.first_seen}
                logo={job.logoUrl || job.logo}
                url={job.url}
                experience={job.experience}
                vacancy={job.vacancy}
                deadline={job.deadline}
                onViewDetails={() => handleViewDetails(job._id, job)}
              />
            ))}
          </div>
        )}
      </div>

      {selectedJob && (
        <JobDetailsModal 
          job={selectedJob} 
          onClose={() => setSelectedJob(null)} 
        />
      )}
    </div>
  );
}

export default function SavedJobsPage() {
  return (
    <div className="w-full">
      <Suspense fallback={<div className="min-h-screen flex flex-col py-16 items-center">Loading...</div>}>
        <SavedJobsContent />
      </Suspense>
    </div>
  );
}
