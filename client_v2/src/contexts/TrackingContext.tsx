"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import UnauthTrackerModal from "@/components/UnauthTrackerModal";
import { getUserInfo } from "@/lib/auth";
import { fetchWithAuth } from "@/lib/apiClient";
import { toast } from "sonner";
import { handleApplyClick as fallbackApplyClick } from "@/shared/handleJobClick";

interface TrackingContextProps {
  handleApply: (jobData: { url: string; _id?: string }) => void;
}

const TrackingContext = createContext<TrackingContextProps | undefined>(undefined);

export function TrackingProvider({ children }: { children: ReactNode }) {
  const [showUnauthModal, setShowUnauthModal] = useState(false);
  const [pendingJobData, setPendingJobData] = useState<{ url: string; _id?: string } | null>(null);

  const handleApply = ({ url, _id }: { url: string; _id?: string }) => {
    const userInfo = getUserInfo();

    if (!userInfo) {
      setPendingJobData({ url, _id });
      setShowUnauthModal(true);
      return;
    }

    // User is logged in. 
    // Add to tracker as PENDING_CONFIRMATION in background.
    if (_id) {
      fetchWithAuth(`/users/${userInfo.userId}/tracked-jobs`, {
        method: "POST",
        body: JSON.stringify({ jobId: _id, status: "PENDING_CONFIRMATION" }),
      })
      .then(async (res) => {
        const data = await res.json();
        if (data.status === 1) {
          toast.success("Job added to your tracker!");
        } else if (data.message && data.message.includes("already")) {
          toast.info("This job is already in your tracker.");
        } else {
          toast.error(data.message || "Failed to add to tracker");
        }
      })
      .catch((err) => {
        console.error("Failed to add to tracker", err);
        toast.error("Failed to add to tracker due to a network error.");
      });
    }

    // Proceed to open URL immediately to avoid popup blocker
    fallbackApplyClick({ url, _id });
  };

  const proceedUnauth = () => {
    if (pendingJobData) {
      fallbackApplyClick(pendingJobData as any);
    }
    setShowUnauthModal(false);
    setPendingJobData(null);
  };

  const cancelUnauth = () => {
    setShowUnauthModal(false);
    setPendingJobData(null);
  };

  return (
    <TrackingContext.Provider value={{ handleApply }}>
      {children}
      {showUnauthModal && (
        <UnauthTrackerModal 
          onClose={cancelUnauth}
          onProceedAnyway={proceedUnauth}
        />
      )}
    </TrackingContext.Provider>
  );
}

export function useTracking() {
  const context = useContext(TrackingContext);
  if (context === undefined) {
    throw new Error("useTracking must be used within a TrackingProvider");
  }
  return context;
}
