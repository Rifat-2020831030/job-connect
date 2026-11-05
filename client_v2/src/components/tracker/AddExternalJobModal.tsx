"use client";

import SelectDropdown from "@/components/SelectDropdown";
import { fetchWithAuth } from "@/lib/apiClient";
import { getUserInfo } from "@/lib/auth";
import { Edit2, Loader2, X } from "lucide-react";
import { useState } from "react";
import { RemoveScroll } from "react-remove-scroll";
import { toast } from "sonner";
import SuggestionInput from "./SuggestionInput";

interface AddExternalJobModalProps {
  onClose: () => void;
  onJobAdded: () => void;
}

export default function AddExternalJobModal({
  onClose,
  onJobAdded,
}: AddExternalJobModalProps) {
  const [step, setStep] = useState<1 | 2>(1);

  // Step 1: URL
  const [url, setUrl] = useState("");
  const [isLookingUp, setIsLookingUp] = useState(false);

  // Step 2: Details
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [deadline, setDeadline] = useState("");
  const [applicationTime, setApplicationTime] = useState(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  });
  const [cvLink, setCvLink] = useState("");
  const [platform, setPlatform] = useState("");
  const [notes, setNotes] = useState("");

  // Validation state
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    const trimmed = url.trim();
    if (!trimmed) {
      newErrors.url = "Job URL is required.";
    } else if (!/^https?:\/\/.+/i.test(trimmed)) {
      newErrors.url =
        "Please enter a valid URL starting with http:// or https://";
    }
    setErrors((prev) => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) {
      newErrors.title = "Job Title is required.";
    }
    if (!company.trim()) {
      newErrors.company = "Company Name is required.";
    }
    if (!platform.trim()) {
      newErrors.platform = "Please select a platform.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    if (field === "url") {
      validateStep1();
    } else if (field === "title") {
      setErrors((prev) => ({
        ...prev,
        title: title.trim() ? "" : "Job Title is required.",
      }));
    } else if (field === "company") {
      setErrors((prev) => ({
        ...prev,
        company: company.trim() ? "" : "Company Name is required.",
      }));
    } else if (field === "platform") {
      setErrors((prev) => ({
        ...prev,
        platform: platform.trim() ? "" : "Please select a platform.",
      }));
    }
  };

  const handleNext = async () => {
    setTouched((prev) => ({ ...prev, url: true }));
    if (!validateStep1()) {
      toast.error("Please enter a valid URL starting with http:// or https://");
      return;
    }

    const userInfo = getUserInfo();
    if (!userInfo) return;

    setIsLookingUp(true);
    try {
      const res = await fetchWithAuth(
        `/users/${userInfo.userId}/external-lookup?url=${encodeURIComponent(
          url.trim()
        )}`
      );
      const data = await res.json();

      if (data.status === 1 && data.data) {
        if (data.type === "INTERNAL") {
          // Instant track internal
          const addRes = await fetchWithAuth(
            `/users/${userInfo.userId}/tracked-jobs`,
            {
              method: "POST",
              body: JSON.stringify({
                type: "INTERNAL",
                jobId: data.data._id,
              }),
            }
          );
          const addData = await addRes.json();
          if (addData.status === 1) {
            toast.success("The job exists in the platform and is now tracked!");
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
          setPlatform(
            data.data.platform && data.data.platform !== "Unknown"
              ? data.data.platform
              : ""
          );

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
      setStep(2);
    }
  };

  const handleSave = async () => {
    setTouched({
      title: true,
      company: true,
      platform: true,
    });

    if (!validateStep2()) {
      toast.error("Please fill in all mandatory fields.");
      return;
    }

    const userInfo = getUserInfo();
    if (!userInfo) return;

    setIsSaving(true);
    try {
      const res = await fetchWithAuth(
        `/users/${userInfo.userId}/tracked-jobs`,
        {
          method: "POST",
          body: JSON.stringify({
            type: "EXTERNAL",
            url: url.trim(),
            title: title.trim(),
            company: company.trim(),
            deadline: deadline ? deadline : undefined,
            applicationTime: applicationTime
              ? new Date(applicationTime).toISOString()
              : undefined,
            cvLink: cvLink.trim() || undefined,
            platform: platform.trim() || undefined,
            notes: notes.trim() || undefined,
          }),
        }
      );
      const data = await res.json();
      if (data.status === 1) {
        toast.success("External job tracked successfully!");
        onJobAdded();
        onClose();
      } else {
        toast.error(data.message || "Failed to save job");
      }
    } catch {
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
          className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
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

          <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Job URL <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="url"
                    placeholder="https://company.com/careers/123"
                    className={`w-full rounded-lg p-3 text-sm focus:outline-none transition-all ${
                      touched.url && errors.url
                        ? "border border-red-500 bg-red-50/20 text-red-900 focus:ring-2 focus:ring-red-400"
                        : "border border-gray-300 focus:ring-2 focus:ring-emerald-500"
                    }`}
                    value={url}
                    onChange={(e) => {
                      setUrl(e.target.value);
                      if (errors.url) {
                        setErrors((prev) => ({ ...prev, url: "" }));
                      }
                    }}
                    onBlur={() => handleBlur("url")}
                    onKeyDown={(e) => e.key === "Enter" && handleNext()}
                  />
                  {touched.url && errors.url && (
                    <p className="mt-1.5 text-xs text-red-600 font-medium">
                      {errors.url}
                    </p>
                  )}
                  <div className="mt-3 space-y-2">
                    <p className="text-xs text-gray-500">
                      Paste the link to the job posting. We&apos;ll check if
                      someone else has already tracked it to auto-fill the
                      details for you!
                    </p>
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs text-blue-800 leading-relaxed">
                      <strong className="block font-semibold mb-2">
                        Link Guidelines:
                      </strong>
                      <ul className="list-disc pl-4 space-y-1">
                        <li>
                          For jobs posted on social platforms (e.g. Facebook,
                          Twitter), try to find and paste the original company
                          career page link.
                        </li>
                        <li>
                          For LinkedIn, use the &quot;Share&quot; menu to copy
                          the direct job link.
                        </li>
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
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Job Title <span className="text-red-500">*</span>
                  </label>
                  <SuggestionInput
                    field="title"
                    value={title}
                    onChange={(val) => {
                      setTitle(val);
                      if (errors.title) {
                        setErrors((prev) => ({ ...prev, title: "" }));
                      }
                    }}
                    onBlur={() => {
                      handleBlur("title");
                      if (originallyLocked.title) {
                        setLockedFields((p) => ({ ...p, title: true }));
                      }
                    }}
                    placeholder="e.g. Senior Software Engineer"
                    isLocked={lockedFields.title}
                    onUnlock={() =>
                      setLockedFields((p) => ({ ...p, title: false }))
                    }
                    error={touched.title ? errors.title : undefined}
                  />
                </div>

                {/* Company & Platform Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Company Name <span className="text-red-500">*</span>
                    </label>
                    <SuggestionInput
                      field="company"
                      value={company}
                      onChange={(val) => {
                        setCompany(val);
                        if (errors.company) {
                          setErrors((prev) => ({ ...prev, company: "" }));
                        }
                      }}
                      onBlur={() => {
                        handleBlur("company");
                        if (originallyLocked.company) {
                          setLockedFields((p) => ({ ...p, company: true }));
                        }
                      }}
                      placeholder="e.g. Google"
                      isLocked={lockedFields.company}
                      onUnlock={() =>
                        setLockedFields((p) => ({ ...p, company: false }))
                      }
                      error={touched.company ? errors.company : undefined}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Platform <span className="text-red-500">*</span>
                    </label>
                    <div
                      className={
                        touched.platform && errors.platform
                          ? "rounded-lg ring-2 ring-red-400"
                          : ""
                      }
                    >
                      <SelectDropdown
                        value={platform}
                        onChange={(val) => {
                          setPlatform(val);
                          if (errors.platform) {
                            setErrors((prev) => ({ ...prev, platform: "" }));
                          }
                        }}
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
                    {touched.platform && errors.platform && (
                      <p className="mt-1 text-xs text-red-600 font-medium">
                        {errors.platform}
                      </p>
                    )}
                  </div>
                </div>

                {/* Deadline & App Time Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Deadline{" "}
                      <span className="text-xs text-gray-400 font-normal">
                        (Optional)
                      </span>
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type="date"
                        className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-50 disabled:text-gray-500 pr-10"
                        value={deadline}
                        onChange={(e) => setDeadline(e.target.value)}
                        disabled={lockedFields.deadline}
                        onBlur={() => {
                          if (originallyLocked.deadline) {
                            setLockedFields((p) => ({ ...p, deadline: true }));
                          }
                        }}
                      />
                      {lockedFields.deadline && (
                        <button
                          type="button"
                          onClick={() =>
                            setLockedFields((p) => ({ ...p, deadline: false }))
                          }
                          className="absolute right-2 p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded cursor-pointer"
                          title="Unlock field to edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Application Time{" "}
                      <span className="text-xs text-gray-400 font-normal">
                        (Optional)
                      </span>
                    </label>
                    <input
                      type="datetime-local"
                      className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      value={applicationTime}
                      onChange={(e) => setApplicationTime(e.target.value)}
                    />
                  </div>
                </div>

                {/* CV Link */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    CV Link{" "}
                    <span className="text-xs text-gray-400 font-normal">
                      (Optional)
                    </span>
                  </label>
                  <input
                    type="url"
                    placeholder="https://drive.google.com/..."
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    value={cvLink}
                    onChange={(e) => setCvLink(e.target.value)}
                  />
                </div>

                {/* Initial Notes (Single Continuous Note flow) */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Notes{" "}
                    <span className="text-xs text-gray-400 font-normal">
                      (Optional)
                    </span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Record initial notes (e.g. referral contact, applied salary expectation, follow-up timeline)..."
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-y"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                <div className="pt-4 flex justify-between gap-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
