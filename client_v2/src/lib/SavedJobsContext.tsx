"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getUserInfo } from "./auth";
import { fetchWithAuth } from "./apiClient";
import { toast } from "sonner";

interface SavedJobsContextType {
  savedJobIds: Set<string>;
  isJobSaved: (jobId: string) => boolean;
  toggleSavedJob: (jobId: string) => Promise<void>;
  isLoading: boolean;
}

const SavedJobsContext = createContext<SavedJobsContextType | undefined>(undefined);

export function SavedJobsProvider({ children }: { children: ReactNode }) {
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSavedJobs = async () => {
      const userInfo = getUserInfo();
      if (!userInfo?.userId) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetchWithAuth(`/users/${userInfo.userId}/saved-jobs`);
        const data = await res.json();
        if (res.ok && data.status === 1 && Array.isArray(data.data)) {
          // The endpoint returns an array of job objects. Map to IDs.
          const ids = data.data.map((job: any) => job._id);
          setSavedJobIds(new Set(ids));
        }
      } catch (error) {
        console.error("Failed to load saved jobs", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSavedJobs();
  }, []);

  const isJobSaved = (jobId: string) => savedJobIds.has(jobId);

  const toggleSavedJob = async (jobId: string) => {
    const userInfo = getUserInfo();
    if (!userInfo?.userId) {
      toast.error("Please login to save jobs.");
      return;
    }

    const currentlySaved = isJobSaved(jobId);
    
    // Optimistic UI update
    setSavedJobIds((prev) => {
      const next = new Set(prev);
      if (currentlySaved) {
        next.delete(jobId);
      } else {
        next.add(jobId);
      }
      return next;
    });

    try {
      if (currentlySaved) {
        // DELETE request
        const res = await fetchWithAuth(`/users/${userInfo.userId}/saved-jobs/${jobId}`, {
          method: "DELETE",
        });
        if (!res.ok) throw new Error("Failed to remove saved job");
        toast.success("Job removed from saved list");
      } else {
        // POST request
        const res = await fetchWithAuth(`/users/${userInfo.userId}/saved-jobs`, {
          method: "POST",
          body: JSON.stringify({ jobId }),
        });
        if (!res.ok) throw new Error("Failed to save job");
        toast.success("Job saved successfully");
      }
    } catch (error) {
      // Revert on error
      setSavedJobIds((prev) => {
        const next = new Set(prev);
        if (currentlySaved) {
          next.add(jobId);
        } else {
          next.delete(jobId);
        }
        return next;
      });
      toast.error("An error occurred. Please try again.");
    }
  };

  return (
    <SavedJobsContext.Provider value={{ savedJobIds, isJobSaved, toggleSavedJob, isLoading }}>
      {children}
    </SavedJobsContext.Provider>
  );
}

export function useSavedJobs() {
  const context = useContext(SavedJobsContext);
  if (context === undefined) {
    throw new Error("useSavedJobs must be used within a SavedJobsProvider");
  }
  return context;
}
