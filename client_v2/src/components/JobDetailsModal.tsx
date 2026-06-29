"use client";

import React, { useEffect } from 'react';
import { X, MapPin, DollarSign } from 'lucide-react';

export type JobDetail = {
  title: string;
  company: string;
  location: string;
  salary?: string;
  level?: string;
  postedAt?: string;
  tags?: string[];
  description?: string;
  vacancy?: string;
  experience?: string;
  deadline?: string;
  logoUrl?: string;
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
            </div>
            
            {/* Additional Crucial Meta */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-2 pt-4 border-t border-gray-50">
              {job.experience && (
                <div className="flex flex-col">
                  <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-0.5">Experience</span>
                  <span className="text-sm font-semibold text-gray-700">{job.experience}</span>
                </div>
              )}
              {job.vacancy && (
                <div className="flex flex-col">
                  <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-0.5">Vacancy</span>
                  <span className="text-sm font-semibold text-gray-700">{job.vacancy}</span>
                </div>
              )}
              {job.deadline && (
                <div className="flex flex-col">
                  <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-0.5">Deadline</span>
                  <span className="text-sm font-semibold text-gray-700">{job.deadline}</span>
                </div>
              )}
              {job.level && (
                <div className="flex flex-col">
                  <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-0.5">Level</span>
                  <span className="text-sm font-semibold text-gray-700">{job.level}</span>
                </div>
              )}
            </div>
          </div>

          {/* Technical Challenges / Description */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-mono font-bold tracking-wider text-foreground uppercase">
              Technical Challenges
            </h3>
            <div className="text-sm text-gray-600 leading-relaxed space-y-4">
              {job.description ? (
                <p>{job.description}</p>
              ) : (
                <p>We are building a next-generation platform. You will be responsible for optimizing complex systems, reducing tail latency in high-throughput environments, and ensuring 99.999% availability.</p>
              )}
            </div>
          </div>

          {/* Requirements */}
          {job.tags && job.tags.length > 0 && (
            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-mono font-bold tracking-wider text-foreground uppercase">
                Requirements
              </h3>
              <ul className="flex flex-col gap-2">
                {job.tags.map((tag, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-gray-600 leading-relaxed">
                    <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2"></span>
                    <span>Proficiency and deep understanding of <strong>{tag}</strong> in a production environment.</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#f2f3ff] px-6 py-5 border-t border-[#bbcabf33] shrink-0">
          <button 
            className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3.5 rounded-md transition-colors cursor-pointer text-lg tracking-wide shadow-sm"
            onClick={() => {
              console.log(`Applying for job: ${job.title}`);
              alert("Application flow triggered for " + job.title);
            }}
          >
            Apply Now
          </button>
        </div>

      </div>
    </div>
  );
}
