"use client";

import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "@/lib/api";
import { useVisitorTracker } from "@/lib/useVisitorTracker";
import CategoryCard from "@/components/CategoryCard";
import HeroSection from "@/components/HeroSection";
import JobCard from "@/components/JobCard";
import EngineeringJobRow from "@/components/JobRow";
import SectionHeader from "@/components/SectionHeader";
import JobDetailsModal, { JobDetail } from "@/components/JobDetailsModal";

import {
  Monitor,
  Cpu,
  BarChart,
  Cloud,
  Smartphone,
  Shield,
  PenTool,
  LayoutList,
  Sparkles,
  Building2,
} from "lucide-react";

// Maps backend category identifiers to icons
const categoryIconMap: Record<string, React.ReactNode> = {
  web: <Monitor className="w-6 h-6" />,
  "ai/ml": <Cpu className="w-6 h-6" />,
  "data science": <BarChart className="w-6 h-6" />,
  devops: <Cloud className="w-6 h-6" />,
  mobile: <Smartphone className="w-6 h-6" />,
  security: <Shield className="w-6 h-6" />,
  design: <PenTool className="w-6 h-6" />,
  PM: <LayoutList className="w-6 h-6" />,
  other: <Sparkles className="w-6 h-6" />,
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
  const [currentSiteStats, setCurrentSiteStats] = useState(siteStats);

  // Initialize unique visitor tracking
  useVisitorTracker();

  // Fetch real-time site stats on client side
  useEffect(() => {
    const fetchRealTimeStats = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/stat`, {
          cache: "no-store", // Ensure we get fresh data
        });
        const data = await res.json();
        if (res.ok && data.status === 1 && data.data) {
          setCurrentSiteStats(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch real-time site stats", error);
      }
    };

    fetchRealTimeStats();
  }, []);

  return (
    <div className="flex flex-col w-full">
      <HeroSection siteStats={currentSiteStats} />

      <main className="flex flex-col w-full max-w-7xl mx-auto px-6 md:px-12 py-16 gap-24 relative">
        {/* Latest Jobs Section */}
        <section className="flex flex-col w-full">
          <SectionHeader title="Latest Jobs" viewAllLink="/jobs" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredJobs.map((job, index) => (
              <JobCard
                key={job._id || index}
                {...job}
              />
            ))}
            {featuredJobs.length === 0 && (
              <p className="text-gray-500 col-span-full">
                No latest jobs available right now.
              </p>
            )}
          </div>
        </section>

        {/* Core Engineering Section (Linear Style Minimalist Table Rows) */}
        <section className="flex flex-col w-full">
          <SectionHeader
            title="Core Engineering"
            viewAllLink="/jobs?category=web,devops,mobile,security,ai/ml"
          />
          <div className="flex flex-col gap-3">
            {engineeringJobs.map((job, index) => (
              <EngineeringJobRow
                key={job._id || index}
                {...job}
              />
            ))}
            {engineeringJobs.length === 0 && (
              <p className="text-gray-500">
                No engineering jobs available right now.
              </p>
            )}
          </div>
        </section>

        {/* Leadership & Management Section */}
        <section className="flex flex-col w-full">
          <SectionHeader
            title="Leadership & Management"
            viewAllLink="/jobs?category=PM"
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {leadershipJobs.map((job, index) => (
              <JobCard
                key={job._id || index}
                {...job}
              />
            ))}
            {leadershipJobs.length === 0 && (
              <p className="text-gray-500 col-span-full">
                No leadership jobs available right now.
              </p>
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
            {categories.map((category: any, index: number) => (
              <CategoryCard
                key={category.category || index}
                title={category.label}
                icon={
                  categoryIconMap[category.category] || (
                    <Building2 className="w-6 h-6" />
                  )
                }
                count={category.count}
                href={`/jobs?category=${encodeURIComponent(category.category)}`}
              />
            ))}
          </div>
        </section>
      </main>

      {/* Details modal is kept in code, but UI navigates directly to full details page */}
      {/* {selectedJob && (
        <JobDetailsModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
        />
      )} */}
    </div>
  );
}
