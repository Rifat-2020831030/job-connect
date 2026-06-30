"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getUserInfo } from "@/lib/auth";
import { fetchWithAuth } from "@/lib/apiClient";
import { toast } from "sonner";

function AlertPreferencesContent() {
  const router = useRouter();
  const [categories, setCategories] = useState(["web", "devops"]);
  const [workModel, setWorkModel] = useState(["Remote", "Hybrid"]);
  const [frequency, setFrequency] = useState("Morning");

  const toggleCategory = (cat: string) => {
    setCategories((prev) => 
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const toggleWorkModel = (model: string) => {
    setWorkModel((prev) => 
      prev.includes(model) ? prev.filter((m) => m !== model) : [...prev, model]
    );
  };

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadPreferences = async () => {
      const userInfo = getUserInfo();
      if (!userInfo?.userId) return;

      try {
        const res = await fetchWithAuth(`/users/${userInfo.userId}/preferences`);
        const data = await res.json();
        if (res.ok && data.status === 1 && data.data) {
          const pref = data.data;
          if (pref.categories) setCategories(pref.categories);
          if (pref.workModel) setWorkModel(pref.workModel);
          if (pref.alertTiming) setFrequency(pref.alertTiming);
        }
      } catch (err) {
        console.error("Failed to load preferences", err);
      }
    };
    loadPreferences();
  }, []);

  const handleSave = async () => {
    const userInfo = getUserInfo();
    if (!userInfo?.userId) {
      toast.error("You must be logged in to save preferences.");
      return;
    }
    
    setIsLoading(true);
    try {
      const res = await fetchWithAuth(`/users/${userInfo.userId}/preferences`, {
        method: "POST",
        body: JSON.stringify({
          categories,
          workModel,
          alertTiming: frequency
        })
      });
      const data = await res.json();
      
      if (res.ok && data.status === 1) {
        toast.success("Preferences saved successfully!");
        const params = new URLSearchParams();
        if (categories.length) params.set("categories", categories.join(","));
        if (workModel.length) params.set("model", workModel.join(","));
        if (frequency) params.set("frequency", frequency);
        router.push("/all-set?" + params.toString());
      } else {
        toast.error("Failed to save preferences.");
      }
    } catch (err) {
      toast.error("An error occurred while saving.");
    } finally {
      setIsLoading(false);
    }
  };

  const ALL_CATEGORIES = [
    { id: "web", label: "Web" },
    { id: "ai/ml", label: "AI/ML" },
    { id: "data science", label: "Data Science" },
    { id: "devops", label: "DevOps" },
    { id: "PM", label: "PM" },
    { id: "design", label: "Design" },
    { id: "mobile", label: "Mobile" },
    { id: "security", label: "Security" },
    { id: "other", label: "Other" }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col items-center py-16 px-6">
      <div className="w-full max-w-[896px] flex flex-col gap-8">
        
        {/* Breadcrumbs & Header */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-[11px] font-mono font-bold tracking-widest uppercase">
            <span className="text-gray-500 font-normal">JOBS</span>
            <span className="text-gray-400">/</span>
            <span className="text-primary">ALERT PREFERENCES</span>
          </div>
          <div className="flex flex-col gap-3">
            <h1 className="text-4xl font-bold tracking-tight text-foreground">Customize your alerts</h1>
            <p className="text-lg text-gray-500 max-w-2xl">
              Configure your high-performance alert stream. We only notify you when a role matches your technical precision and delivery requirements.
            </p>
          </div>
        </div>

        {/* Preferences Card */}
        <div className="card w-full flex flex-col border-[#e2e8f0] p-0 overflow-hidden shadow-sm">
          
          <div className="flex flex-col gap-10 p-8 md:p-10">
            
            {/* Section 1: Job Categories */}
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-3">
                <span className="text-xl">💼</span>
                <h2 className="text-xl font-bold text-foreground">Job Categories</h2>
              </div>
              
              <div className="flex flex-wrap gap-3">
                {ALL_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => toggleCategory(cat.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium cursor-pointer transition-colors border ${
                      categories.includes(cat.id) 
                        ? "bg-primary/10 border-primary text-primary" 
                        : "bg-white border-gray-300 text-gray-600 hover:border-gray-400"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              
              {/* Section 2: Work Model */}
              <div className="flex flex-col gap-6">
                <div className="flex items-center gap-3">
                  <span className="text-xl">🏢</span>
                  <h2 className="text-xl font-bold text-foreground">Work Model</h2>
                </div>

                <div className="flex flex-col gap-3">
                  {[
                    { id: "Onsite", icon: "🏙️", desc: "Standard office attendance" },
                    { id: "Remote", icon: "🏠", desc: "Work from anywhere" },
                    { id: "Hybrid", icon: "🔄", desc: "Flexible office/home split" }
                  ].map((model) => (
                    <div 
                      key={model.id}
                      onClick={() => toggleWorkModel(model.id)}
                      className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-colors ${
                        workModel.includes(model.id)
                          ? "bg-primary/5 border-primary"
                          : "bg-white border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="size-10 bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center text-lg">
                          {model.icon}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-foreground text-sm">{model.id}</span>
                          <span className="text-xs text-gray-500">{model.desc}</span>
                        </div>
                      </div>
                      <div className={`size-5 rounded flex items-center justify-center ${
                        workModel.includes(model.id) ? "bg-primary text-white" : "border border-gray-300 bg-white"
                      }`}>
                        {workModel.includes(model.id) && (
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 3: Delivery Frequency */}
              <div className="flex flex-col gap-6">
                <div className="flex items-center gap-3">
                  <span className="text-xl">⚡</span>
                  <h2 className="text-xl font-bold text-foreground">Frequency</h2>
                </div>

                <div className="flex flex-col gap-3">
                  {[
                    { id: "Morning", desc: "Start your day with updates (8 AM)" },
                    { id: "Evening", desc: "Wrap up the workday (3 PM)" },
                    { id: "Night", desc: "Review before bed (10 PM)" }
                  ].map((freq) => (
                    <div 
                      key={freq.id}
                      onClick={() => setFrequency(freq.id)}
                      className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-colors ${
                        frequency === freq.id
                          ? "bg-primary/5 border-primary"
                          : "bg-white border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center justify-center size-4 rounded-full border-2 border-gray-300">
                        {frequency === freq.id && <div className="size-2 rounded-full bg-primary" />}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-foreground text-sm">{freq.id}</span>
                        <span className="text-xs text-gray-500">{freq.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            </div>

          </div>

          {/* Action Footer */}
          <div className="bg-gray-50 border-t border-gray-200 p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3 text-gray-500 font-mono text-[11px] uppercase tracking-wide">
              <span>🔒</span>
              <span>Preferences Encrypted & Synced to Profile</span>
            </div>
            
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Link href="/" className="flex-1 sm:flex-none text-center px-8 py-3 rounded-lg border border-gray-300 font-bold text-gray-600 hover:bg-gray-100 transition-colors text-sm">
                Cancel
              </Link>
              <button onClick={handleSave} disabled={isLoading} className="flex-1 sm:flex-none btn-primary px-8 py-3 text-sm shadow-md shadow-primary/20 disabled:opacity-50">
                {isLoading ? "Saving..." : "Save Preferences"}
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

export default function AlertPreferencesPage() {
  return (
    <div className="w-full">
      <Suspense fallback={<div className="min-h-screen flex flex-col py-16 items-center">Loading...</div>}>
        <AlertPreferencesContent />
      </Suspense>
    </div>
  );
}
