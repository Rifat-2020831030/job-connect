"use client";

import React, { useEffect } from 'react';
import { X, MapPin, DollarSign } from 'lucide-react';
import { formatDate } from '../lib/utils';

export type JobDetail = {
  _id?: string;
  title: string;
  company: string;
  location: string;
  salary?: string;
  level?: string;
  postedAt?: string;
  skills?: string[];
  description?: string;
  vacancy?: string;
  experience?: string;
  deadline?: string;
  logoUrl?: string;
  benefits?: string[];
  industry?: string;
  job_type?: string;
  category?: string;
  url?: string;
};

interface JobDetailsModalProps {
  job: JobDetail;
  onClose: () => void;
}

export default function JobDetailsModal({ job, onClose }: JobDetailsModalProps) {
  // Prevent body scrolling when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);
  
  const displayExp = (!job.experience || job.experience === "-1") ? "Not Mentioned" : job.experience;
  const displayVacancy = (!job.vacancy || job.vacancy === "-1") ? "Not Mentioned" : job.vacancy;
  const displayDeadline = formatDate(job.deadline);

  const handleApplyClick = async () => {
    if (job._id) {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3010/api";
        await fetch(`${apiUrl}/stat/jobs/clicks?jobID=${job._id}`);
      } catch (error) {
        console.error("Failed to register job click stat", error);
      }
    }
    if (job.url) {
      window.open(job.url, "_blank", "noopener,noreferrer");
    } else {
      alert("No application URL provided for this job.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[#131b2e]/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="relative bg-white w-full max-w-2xl max-h-[90vh] rounded-lg shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <h2 className="text-base font-medium text-foreground">Job Details</h2>
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-md transition-colors text-gray-500 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-8 custom-scrollbar">
          
          {/* Job Meta Info */}
          <div className="flex flex-col gap-3">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">
              {job.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-4">
              <span className="font-mono text-emerald-700 font-bold uppercase tracking-wider text-sm">
                {job.company}
              </span>
              
              <div className="flex items-center gap-1.5 text-sm text-gray-600 font-medium">
                <MapPin className="w-4 h-4" />
                {job.location}
              </div>

              {job.salary && (
                <div className="flex items-center gap-1 text-sm text-purple-700 font-medium bg-purple-50 px-2 py-0.5 rounded-md">
                  <DollarSign className="w-3.5 h-3.5" />
                  {job.salary}
                </div>
              )}
              {job.job_type && (
                <div className="flex items-center gap-1 text-sm text-blue-700 font-medium bg-blue-50 px-2 py-0.5 rounded-md">
                  {job.job_type}
                </div>
              )}
            </div>
            
            {/* Additional Crucial Meta */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-4 mt-2 pt-4 border-t border-gray-50">
              <div className="flex flex-col">
                <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-0.5">Experience</span>
                <span className="text-sm font-semibold text-gray-700">{displayExp}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-0.5">Vacancy</span>
                <span className="text-sm font-semibold text-gray-700">{displayVacancy}</span>
              </div>
              {displayDeadline && (
                <div className="flex flex-col">
                  <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-0.5">Deadline</span>
                  <span className="text-sm font-semibold text-gray-700">{displayDeadline}</span>
                </div>
              )}
              {job.level && (
                <div className="flex flex-col">
                  <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-0.5">Level</span>
                  <span className="text-sm font-semibold text-gray-700">{job.level}</span>
                </div>
              )}
              {job.industry && (
                <div className="flex flex-col">
                  <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-0.5">Industry</span>
                  <span className="text-sm font-semibold text-gray-700">{job.industry}</span>
                </div>
              )}
              {job.category && (
                <div className="flex flex-col">
                  <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-0.5">Category</span>
                  <span className="text-sm font-semibold text-gray-700">{job.category}</span>
                </div>
              )}
            </div>
          </div>


          
          {/* Benefits */}
          {job.benefits && job.benefits.length > 0 && (
            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-mono font-bold tracking-wider text-foreground uppercase">
                Benefits & Perks
              </h3>
              <ul className="flex flex-col gap-2">
                {job.benefits.map((benefit, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-gray-600 leading-relaxed">
                    <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-primary mt-2"></span>
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Requirements / Skills */}
          {job.skills && job.skills.length > 0 && (
            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-mono font-bold tracking-wider text-foreground uppercase">
                Skills & Requirements
              </h3>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill, idx) => (
                  <span key={idx} className="px-3 py-1.5 text-xs font-mono border border-gray-200 bg-gray-50 text-gray-700 uppercase tracking-wide rounded-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#f2f3ff] px-6 py-5 border-t border-[#bbcabf33] shrink-0">
          <button 
            className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3.5 rounded-md transition-colors cursor-pointer text-lg tracking-wide shadow-sm"
            onClick={handleApplyClick}
          >
            Apply Now
          </button>
        </div>

      </div>
    </div>
  );
}
