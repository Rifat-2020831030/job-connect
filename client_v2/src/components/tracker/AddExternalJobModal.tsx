"use client";

import React, { useState, useEffect } from "react";
import { X, Loader2, Edit2 } from "lucide-react";
import { toast } from "sonner";
import { fetchWithAuth } from "@/lib/apiClient";
import { getUserInfo } from "@/lib/auth";
import SelectDropdown from "@/components/SelectDropdown";
import { RemoveScroll } from "react-remove-scroll";

interface AddExternalJobModalProps {
  onClose: () => void;
  onJobAdded: () => void;
}

export default function AddExternalJobModal({ onClose, onJobAdded }: AddExternalJobModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  
  // Step 1: URL
  const [url, setUrl] = useState("");
  const [isLookingUp, setIsLookingUp] = useState(false);
  
  // Step 2: Details
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [deadline, setDeadline] = useState("");
  const [applicationTime, setApplicationTime] = useState("");
  const [cvLink, setCvLink] = useState("");
  const [platform, setPlatform] = useState("");
  
  // Locking states
  const [lockedFields, setLockedFields] = useState({
    title: false,
    company: false,
    deadline: false,
  });
  const [originallyLocked, setOriginallyLocked] = useState({
    title: false,
    company: false,
    deadline: false,
  });

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    setApplicationTime(now.toISOString().slice(0, 16));
  }, []);

  const handleNext = async () => {
    if (!url || !url.startsWith("http")) {
      toast.error("Please enter a valid URL starting with http:// or https://");
      return;
    }

    const userInfo = getUserInfo();
    if (!userInfo) return;

    setIsLookingUp(true);
    try {
      const res = await fetchWithAuth(`/users/${userInfo.userId}/external-lookup?url=${encodeURIComponent(url)}`);
      const data = await res.json();
      
      if (data.status === 1 && data.data) {
        if (data.type === "INTERNAL") {
          // Instant track internal
          const addRes = await fetchWithAuth(`/users/${userInfo.userId}/tracked-jobs`, {
            method: "POST",
            body: JSON.stringify({
              type: "INTERNAL",
              jobId: data.data._id
            })
          });
          const addData = await addRes.json();
          if (addData.status === 1) {
            toast.success("The job exist in the platform and tracked");
            onJobAdded();
            onClose();
            return; // completely bypass step 2
          } else if (addData.message && addData.message.includes("already")) {
             toast.info("This job is already in your tracker.");
             onClose();
             return;
          }
        } else {
          // External job found
          setTitle(data.data.title || "");
          setCompany(data.data.company || "");
          if (data.data.deadline) {
            setDeadline(data.data.deadline.split("T")[0]);
          }
          setPlatform((data.data.platform && data.data.platform !== "Unknown") ? data.data.platform : "");
          
          const locks = {
            title: !!data.data.title,
            company: !!data.data.company,
            deadline: !!data.data.deadline,
          };
          setLockedFields(locks);
          setOriginallyLocked(locks);
          toast.success("Job details found and auto-filled!");
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLookingUp(false);
      setStep(2); // this will run unless we hit the 'return' in the INTERNAL block
    }
  };

  const handleSave = async () => {
    if (!title || !company || !platform) {
      toast.error("Title, Company, and Platform are required");
      return;
    }

    const userInfo = getUserInfo();
    if (!userInfo) return;

    setIsSaving(true);
    try {
      const res = await fetchWithAuth(`/users/${userInfo.userId}/tracked-jobs`, {
        method: "POST",
        body: JSON.stringify({
          type: "EXTERNAL",
          url,
          title,
          company,
          deadline: deadline || undefined,
          applicationTime: new Date(applicationTime).toISOString(),
          cvLink: cvLink || undefined,
          platform: platform || undefined
        })
      });
      const data = await res.json();
      if (data.status === 1) {
        toast.success("External job tracked successfully!");
        onJobAdded();
        onClose();
      } else {
        toast.error(data.message || "Failed to save job");
      }
    } catch (err) {
      toast.error("An error occurred while saving");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <RemoveScroll>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">
            {step === 1 ? "Add External Job" : "Job Details"}
          </h2>
          <button 
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Job URL *</label>
                <input 
                  type="url"
                  placeholder="https://company.com/careers/123"
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                />
                <div className="mt-3 space-y-2">
                  <p className="text-xs text-gray-500">
                    Paste the link to the job posting. We&apos;ll check if someone else has already tracked it to auto-fill the details for you!
                  </p>
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs text-blue-800 leading-relaxed">
                    <strong className="block font-semibold mb-2">Link Guidelines:</strong>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>For jobs posted on social platforms (e.g. Facebook, Twitter), try to find and paste the original company career page link.</li>
                      <li>For LinkedIn, use the &quot;Share&quot; menu to copy the direct job link.</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={handleNext}
                disabled={isLookingUp || !url}
                className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLookingUp && <Loader2 className="w-4 h-4 animate-spin" />}
                {isLookingUp ? "Looking up..." : "Next"}
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Job Title *</label>
                <div className="relative flex items-center">
                  <div className="w-full">
                    <input 
                      type="text"
                      className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-50 disabled:text-gray-500 pr-10"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      disabled={lockedFields.title}
                      onBlur={() => {
                        if (originallyLocked.title) {
                          setLockedFields(p => ({ ...p, title: true }));
                        }
                      }}
                    />
                  </div>
                  {lockedFields.title && (
                    <button 
                      onClick={() => setLockedFields(p => ({ ...p, title: false }))}
                      className="absolute right-2 p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded cursor-pointer z-10"
                      title="Unlock field to edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Company */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Company Name *</label>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-50 disabled:text-gray-500 pr-10"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      disabled={lockedFields.company}
                      onBlur={() => {
                        if (originallyLocked.company) {
                          setLockedFields(p => ({ ...p, company: true }));
                        }
                      }}
                    />
                    {lockedFields.company && (
                      <button
                        onClick={() => setLockedFields(p => ({ ...p, company: false }))}
                        className="absolute right-2 p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded cursor-pointer z-10"
                        title="Unlock field to edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
                {/* Platform */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Platform *</label>
                  <SelectDropdown
                    value={platform}
                    onChange={setPlatform}
                    options={[
                      { value: "LinkedIn", label: "LinkedIn" },
                      { value: "Facebook", label: "Facebook" },
                      { value: "Twitter", label: "Twitter" },
                      { value: "Reddit", label: "Reddit" },
                      { value: "Job Board", label: "Job Board" },
                      { value: "Other", label: "Other" },
                    ]}
                    placeholder="Select Platform..."
                  />
                </div>
              </div>

              {/* Deadline & App Time Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Application Time</label>
                  <input 
                    type="datetime-local"
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    value={applicationTime}
                    onChange={(e) => setApplicationTime(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Deadline</label>
                  <div className="relative flex items-center">
                    <input 
                      type="date"
                      className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-50 disabled:text-gray-500 pr-10"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      disabled={lockedFields.deadline}
                      onBlur={() => {
                        if (originallyLocked.deadline) {
                          setLockedFields(p => ({ ...p, deadline: true }));
                        }
                      }}
                    />
                    {lockedFields.deadline && (
                      <button 
                        onClick={() => setLockedFields(p => ({ ...p, deadline: false }))}
                        className="absolute right-2 p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded cursor-pointer"
                        title="Unlock field to edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* CV Link */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">CV Link (Optional)</label>
                <input 
                  type="url"
                  placeholder="https://drive.google.com/..."
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  value={cvLink}
                  onChange={(e) => setCvLink(e.target.value)}
                />
              </div>

              <div className="pt-4 flex justify-between gap-3">
                <button 
                  onClick={() => setStep(1)}
                  className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                >
                  Back
                </button>
                <button 
                  onClick={handleSave}
                  disabled={isSaving || !title || !company || !platform}
                  className="flex-1 flex items-center justify-center gap-2 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isSaving ? "Saving..." : "Track Job"}
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
    </RemoveScroll>
  );
}
