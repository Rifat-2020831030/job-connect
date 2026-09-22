"use client";

import React, { useEffect, useState } from "react";
import { X, Save, Trash, Loader2 } from "lucide-react";
import { TrackedJob } from "./TrackerTable";
import { formatDate } from "@/lib/utils";

interface TrackerNotesModalProps {
  job: TrackedJob;
  onClose: () => void;
  onUpdateNotes: (id: string, notes: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export default function TrackerNotesModal({ 
  job, 
  onClose, 
  onUpdateNotes,
  onDelete
}: TrackerNotesModalProps) {
  const [notes, setNotes] = useState(job.notes || "");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const handleSaveNotes = async () => {
    setIsSaving(true);
    try {
      await onUpdateNotes(job._id, notes);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to remove this job from your tracker?")) return;
    setIsDeleting(true);
    try {
      await onDelete(job._id);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-[#131b2e]/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      <div className="relative bg-white w-full max-w-lg max-h-[90vh] rounded-lg shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <h2 className="text-base font-bold text-foreground truncate mr-4">
            {job.jobDetails?.title}
          </h2>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-md transition-colors text-gray-500 cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 custom-scrollbar">
          
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-mono font-bold tracking-wider text-gray-500 uppercase">
              Current Status
            </h3>
            <div className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded text-sm font-semibold inline-flex w-max">
              {job.status.replace("_", " ")}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-mono font-bold tracking-wider text-gray-500 uppercase">
              Timeline
            </h3>
            <div className="flex flex-col gap-4 mt-2">
              {job.history?.map((h, i) => (
                <div key={`${h.state}-${h.timestamp}`} className="flex gap-4 relative">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-emerald-50 z-10" />
                    {i !== job.history.length - 1 && (
                      <div className="w-0.5 h-full bg-gray-200 absolute top-3 left-1.5 -ml-[1px]" />
                    )}
                  </div>
                  <div className="flex flex-col pb-2 -mt-1.5">
                    <span className="text-sm font-semibold text-gray-800">
                      {h.state.replace("_", " ")}
                    </span>
                    <span className="text-xs text-gray-500 font-mono">
                      {formatDate(h.timestamp)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-mono font-bold tracking-wider text-gray-500 uppercase">
              Personal Notes
            </h3>
            <textarea
              className="w-full border border-gray-300 rounded p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-y min-h-[100px]"
              placeholder="Add notes about your application, interview dates, or tasks..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <button
              onClick={handleSaveNotes}
              disabled={isSaving || notes === job.notes}
              className="mt-2 flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded text-sm font-bold self-start transition-colors cursor-pointer disabled:cursor-not-allowed"
            >
              {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
              {isSaving ? "Saving..." : "Save Notes"}
            </button>
          </div>

        </div>

        <div className="bg-[#f2f3ff] px-6 py-4 border-t border-[#bbcabf33] shrink-0 flex justify-between">
           <button 
             onClick={handleDelete}
             disabled={isDeleting}
             className="text-red-600 hover:text-red-700 text-sm font-semibold flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
           >
             {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash className="w-4 h-4" />}
             {isDeleting ? "Removing..." : "Remove from Tracker"}
           </button>
        </div>
      </div>
    </div>
  );
}
