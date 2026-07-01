"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/api";
import { Company } from "@/components/CompanyCard";
import CompanyLogo from "@/components/CompanyLogo";
import JobRow from "@/components/JobRow";
import { Loader2, Globe, Building2, Briefcase, ArrowLeft } from "lucide-react";

export default function CompanyProfilePage() {
  const params = useParams();
  const router = useRouter();
  const companyId = params.id as string;

  const [company, setCompany] = useState<Company | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  
  const [activeTab, setActiveTab] = useState<"active" | "expired">("active");
  const [jobs, setJobs] = useState<any[]>([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const handleTabChange = (tab: "active" | "expired") => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  // Fetch company profile
  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoadingProfile(true);
      try {
        const res = await fetch(`${API_BASE_URL}/companies/${companyId}`);
        const data = await res.json();
        if (data.status === 1 && data.data) {
          setCompany(data.data);
        }
      } catch (err) {
        console.error("Failed to fetch company profile", err);
      } finally {
        setIsLoadingProfile(false);
      }
    };
    fetchProfile();
  }, [companyId]);

  // Fetch jobs when tab or page changes
  useEffect(() => {
    const fetchJobs = async () => {
      setIsLoadingJobs(true);
      try {
        const res = await fetch(`${API_BASE_URL}/jobs?companyId=${companyId}&status=${activeTab}&limit=10&page=${currentPage}`);
        const data = await res.json();
        if (data.status === 1) {
          setJobs(data.data || []);
          setTotalPages(data.totalPages || 1);
        } else {
          setJobs([]);
          setTotalPages(1);
        }
      } catch (err) {
        console.error("Failed to fetch jobs", err);
        setJobs([]);
        setTotalPages(1);
      } finally {
        setIsLoadingJobs(false);
      }
    };
    fetchJobs();
  }, [companyId, activeTab, currentPage]);

  const fallbackColor = `hsl(${company?.name ? company.name.length * 15 % 360 : 0}, 50%, 40%)`;

  const getPages = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20 pt-8">
      <div className="container mx-auto px-4 max-w-5xl">
        
        {/* Back Button */}
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to companies
        </button>

        {/* Company Header */}
        {isLoadingProfile ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm flex items-center justify-center min-h-[200px]">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm mb-8">
            <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
              <CompanyLogo 
                logo={company?.logo}
                companyName={company?.name || "Company"}
                className="w-28 h-28 shrink-0 bg-white shadow-sm border border-gray-100 rounded-2xl"
                fallbackClassName="text-white text-4xl font-bold border-0 rounded-2xl"
                fallbackStyle={{ background: `linear-gradient(135deg, ${fallbackColor}, hsl(${company?.name ? company.name.length * 15 % 360 : 0}, 60%, 50%))` }}
                imageClassName="object-contain p-3"
              />
              
              <div className="flex-1">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">{company?.name || "Loading..."}</h1>
                  
                  {company?.active_jobs_count !== undefined && (
                    <div className="border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm font-mono uppercase text-gray-700 rounded-md">
                      {company.active_jobs_count} ACTIVE OPENINGS
                    </div>
                  )}
                </div>
                
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6">
                  {company?.category && (
                    <div className="flex items-center gap-1.5">
                      <Building2 className="w-4 h-4" />
                      <span className="font-mono uppercase">{company.category}</span>
                    </div>
                  )}
                  {company?.website && (
                    <a 
                      href={company.website} 
                      target="_blank" 
                      rel="noreferrer"
                      className="flex items-center gap-1.5 hover:text-primary transition-colors font-medium text-primary"
                    >
                      <Globe className="w-4 h-4" />
                      <span>{company.website.replace(/^https?:\/\//, '')}</span>
                    </a>
                  )}
                </div>

                {company?.tech_stack && company.tech_stack.length > 0 && (
                  <div>
                    <h3 className="text-xs font-mono font-bold text-gray-900 uppercase tracking-widest mb-3">TECH STACK</h3>
                    <div className="flex flex-wrap gap-2">
                      {company.tech_stack.map(tech => (
                        <span key={tech} className="border border-gray-200 px-2.5 py-1 text-xs font-mono text-gray-600 bg-white rounded-sm shadow-sm">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tabbed Interface */}
        <div className="flex items-center gap-4 border-b border-gray-200 mb-6">
          <button
            onClick={() => handleTabChange("active")}
            className={`pb-3 px-1 text-sm font-semibold transition-colors border-b-2 ${
              activeTab === "active" 
                ? "border-primary text-primary" 
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Active Jobs
          </button>
          <button
            onClick={() => handleTabChange("expired")}
            className={`pb-3 px-1 text-sm font-semibold transition-colors border-b-2 ${
              activeTab === "expired" 
                ? "border-primary text-primary" 
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Expired Jobs
          </button>
        </div>

        {/* Jobs List */}
        {isLoadingJobs ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
            <p className="text-gray-500 font-medium">Loading {activeTab} jobs...</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-8 h-8 text-gray-300" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-2">
              No {activeTab} jobs found
            </h4>
            <p className="text-gray-500">
              There are currently no {activeTab} opportunities available at {company?.name || "this company"}.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {jobs.map(job => (
              <div key={job._id} className={activeTab === 'expired' ? 'opacity-70 grayscale' : ''}>
                <JobRow 
                  _id={job._id}
                  title={job.title}
                  company={job.company}
                  location={job.location}
                  experience_level={job.experience_level}
                  salary={job.salary}
                  salary_min={job.salary_min}
                  salary_max={job.salary_max}
                  vacancy={job.vacancy}
                  experience={job.experience}
                  deadline={job.deadline}
                  first_seen={job.first_seen}
                  skills={job.skills}
                  url={job.url}
                  isExpired={activeTab === 'expired'}
                  onViewDetails={() => window.open(`/jobs?q=${encodeURIComponent(job.title)}&company=${encodeURIComponent(job.company)}`, "_blank")}
                />
              </div>
            ))}
            
            {/* Pagination */}
            {!isLoadingJobs && totalPages > 1 && (
              <div className="mt-8 flex justify-center items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage <= 1}
                  className="size-10 flex items-center justify-center border border-gray-200 rounded-md hover:border-gray-300 hover:bg-gray-50 transition-colors text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  &larr;
                </button>
                
                {getPages().map(p => (
                  <button 
                    key={p}
                    onClick={() => setCurrentPage(p)}
                    className={`size-10 flex items-center justify-center border rounded-md transition-colors font-medium cursor-pointer ${
                      p === currentPage 
                        ? 'bg-primary border-primary text-white' 
                        : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {p}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage >= totalPages}
                  className="size-10 flex items-center justify-center border border-gray-200 rounded-md hover:border-gray-300 hover:bg-gray-50 transition-colors text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  &rarr;
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
