"use client";

import React, { useState } from "react";
import { API_BASE_URL } from "@/lib/api";
import CategoryCard from "@/components/CategoryCard";
import HeroSection from "@/components/HeroSection";
import JobCard from "@/components/JobCard";
import EngineeringJobRow from "@/components/JobRow";
import SectionHeader from "@/components/SectionHeader";
import JobDetailsModal, { JobDetail } from "@/components/JobDetailsModal";
import { toast } from "sonner";

import { Briefcase, MapPin, Search, Monitor, Cpu, BarChart, Cloud, Smartphone, Shield, PenTool, LayoutList, Sparkles, Building2 } from "lucide-react";

// Maps backend category identifiers to icons
const categoryIconMap: Record<string, React.ReactNode> = {
  "web": <Monitor className="w-6 h-6" />,
  "ai/ml": <Cpu className="w-6 h-6" />,
  "data science": <BarChart className="w-6 h-6" />,
  "devops": <Cloud className="w-6 h-6" />,
  "mobile": <Smartphone className="w-6 h-6" />,
  "security": <Shield className="w-6 h-6" />,
  "design": <PenTool className="w-6 h-6" />,
  "PM": <LayoutList className="w-6 h-6" />,
  "other": <Sparkles className="w-6 h-6" />,
};

interface HomeClientProps {
  featuredJobs: any[];
  engineeringJobs: any[];
  leadershipJobs: any[];
  categories: any[];
  siteStats: any;
}

export default function HomeClient({
  featuredJobs,
  engineeringJobs,
  leadershipJobs,
  categories,
  siteStats,
}: HomeClientProps) {
  const [selectedJob, setSelectedJob] = useState<JobDetail | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  const handleViewDetails = async (jobId: string, fallbackJob: any) => {
    if (!jobId) {
      setSelectedJob(fallbackJob);
      return;
    }
    
    setIsLoadingDetails(true);
    try {
      const res = await fetch(`${API_BASE_URL}/jobs/${jobId}`);
      const data = await res.json();
      
      if (res.ok && data.status === 1) {
        setSelectedJob(data.data);
      } else {
        toast.error("Failed to load job details. Showing cached data.");
        setSelectedJob(fallbackJob); // Fallback if API fails
      }
    } catch (err) {
      toast.error("Failed to fetch job details. Check your connection.");
      setSelectedJob(fallbackJob);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  return (
    <div className="flex flex-col w-full">
      <HeroSection siteStats={siteStats} />

      <main className="flex flex-col w-full max-w-7xl mx-auto px-6 md:px-12 py-16 gap-24 relative">
        {/* Loading Overlay for details fetch */}
        {isLoadingDetails && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
            <div className="bg-white p-4 rounded-lg shadow-lg flex items-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent"></div>
              <span className="font-mono text-sm text-gray-700">Loading details...</span>
            </div>
          </div>
        )}

        {/* Featured Opportunities Section */}
        <section className="flex flex-col w-full">
          <SectionHeader
            title="Featured Opportunities"
            subtitle="Direct paths to elite roles. No gatekeepers, just code."
            viewAllLink="/jobs"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredJobs.map((job, index) => (
              <JobCard 
                key={job._id || index} 
                {...job} 
                onViewDetails={() => handleViewDetails(job._id, job)} 
              />
            ))}
            {featuredJobs.length === 0 && (
              <p className="text-gray-500 col-span-full">No featured jobs available right now.</p>
            )}
          </div>
        </section>

        {/* Core Engineering Section (Linear Style Minimalist Table Rows) */}
        <section className="flex flex-col w-full">
          <SectionHeader
            title="Core Engineering"
            subtitle="High-traffic systems and frontend excellence."
            viewAllLink="/jobs?category=web,devops,mobile,security,ai/ml"
          />
          <div className="flex flex-col gap-3">
            {engineeringJobs.map((job, index) => (
              <EngineeringJobRow 
                key={job._id || index} 
                {...job} 
                onViewDetails={() => handleViewDetails(job._id, job)} 
              />
            ))}
            {engineeringJobs.length === 0 && (
              <p className="text-gray-500">No engineering jobs available right now.</p>
            )}
          </div>
        </section>

        {/* Leadership & Management Section */}
        <section className="flex flex-col w-full">
          <SectionHeader
            title="Leadership & Management"
            subtitle="Guide teams to success and drive product vision."
            viewAllLink="/jobs?category=PM"
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {leadershipJobs.map((job, index) => (
              <JobCard 
                key={job._id || index} 
                {...job} 
                onViewDetails={() => handleViewDetails(job._id, job)} 
              />
            ))}
            {leadershipJobs.length === 0 && (
              <p className="text-gray-500 col-span-full">No leadership jobs available right now.</p>
            )}
          </div>
        </section>

        {/* Explore by Category Section */}
        <section className="flex flex-col w-full">
          <SectionHeader
            title="Explore by Category"
            subtitle="Find roles that match your specific expertise."
            viewAllLink="/jobs"
          />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <CategoryCard 
                key={category.category || index} 
                title={category.label}
                icon={categoryIconMap[category.category] || <Building2 className="w-6 h-6" />}
                count={category.count}
                href={`/jobs?category=${encodeURIComponent(category.category)}`}
              />
            ))}
            {categories.length === 0 && (
              <p className="text-gray-500 col-span-full">No categories available.</p>
            )}
          </div>
        </section>
      </main>

      {/* Render Modal if a job is selected */}
      {selectedJob && (
        <JobDetailsModal 
          job={selectedJob} 
          onClose={() => setSelectedJob(null)} 
        />
      )}
    </div>
  );
}
