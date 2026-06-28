"use client";

import React, { useState } from 'react';
import { Search } from 'lucide-react';

const CATEGORIES = ["Web", "AI/ML", "Data Science", "DevOps", "PM", "Design", "Mobile", "Security", "Other"];
const EXPERIENCE_LEVELS = ["Senior (5+ years)", "Mid-Level (2-5 years)", "Junior (0-2 years)"];
const JOB_TYPES = ["Full-time", "Contract", "Remote Only"];
const COMPANIES = ["Nexus Systems", "CloudStream AI", "Vertex Cloud", "CyberSync", "DataFlow"];

export default function JobFilters() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [companySearch, setCompanySearch] = useState("");

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const filteredCompanies = COMPANIES.filter(c => c.toLowerCase().includes(companySearch.toLowerCase()));

  return (
    <div className="flex flex-col gap-8 w-full border border-gray-200 bg-white p-5 md:p-6">
      
      {/* Categories */}
      <div className="flex flex-col gap-4">
        <h3 className="text-xs font-mono font-medium tracking-[1.2px] text-gray-500 uppercase">
          Categories
        </h3>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(cat => {
            const isSelected = selectedCategories.includes(cat);
            return (
              <button
                key={cat}
                onClick={() => toggleCategory(cat)}
                className={`px-3 py-1.5 text-xs font-mono border transition-colors cursor-pointer uppercase ${
                  isSelected 
                    ? "bg-primary border-primary text-white font-bold" 
                    : "bg-white border-gray-200 text-gray-600 hover:border-gray-900 hover:text-gray-900"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Experience Level */}
      <div className="flex flex-col gap-4">
        <h3 className="text-xs font-mono font-medium tracking-[1.2px] text-gray-500 uppercase">
          Experience
        </h3>
        <div className="flex flex-col gap-3">
          {EXPERIENCE_LEVELS.map(level => (
            <label key={level} className="flex items-center gap-3 cursor-pointer group">
              <div className="relative flex items-center justify-center shrink-0">
                <input 
                  type="checkbox" 
                  className="peer appearance-none size-4 border border-gray-300 checked:bg-primary checked:border-primary transition-colors cursor-pointer"
                />
                <svg className="absolute size-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11.6666 3.5L5.24992 9.91667L2.33325 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-600 group-hover:text-primary transition-colors">{level}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Job Type */}
      <div className="flex flex-col gap-4">
        <h3 className="text-xs font-mono font-medium tracking-[1.2px] text-gray-500 uppercase">
          Job Type
        </h3>
        <div className="flex flex-col gap-3">
          {JOB_TYPES.map(type => (
            <label key={type} className="flex items-center gap-3 cursor-pointer group">
              <div className="relative flex items-center justify-center shrink-0">
                <input 
                  type="checkbox" 
                  className="peer appearance-none size-4 border border-gray-300 checked:bg-primary checked:border-primary transition-colors cursor-pointer"
                />
                <svg className="absolute size-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11.6666 3.5L5.24992 9.91667L2.33325 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-600 group-hover:text-primary transition-colors">{type}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Companies */}
      <div className="flex flex-col gap-4">
        <h3 className="text-xs font-mono font-medium tracking-[1.2px] text-gray-500 uppercase">
          Companies
        </h3>
        
        {/* Company Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search companies..."
            className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 text-sm font-medium outline-none focus:border-primary focus:bg-white transition-colors placeholder:text-gray-400"
            value={companySearch}
            onChange={e => setCompanySearch(e.target.value)}
          />
        </div>

        {/* Company List with gradient mask for overflow */}
        <div className="relative mt-2">
          <div className="flex flex-col gap-3 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar pb-6">
            {filteredCompanies.map(company => (
              <label key={company} className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center shrink-0">
                  <input 
                    type="checkbox" 
                    className="peer appearance-none size-4 border border-gray-300 checked:bg-primary checked:border-primary transition-colors cursor-pointer"
                  />
                  <svg className="absolute size-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11.6666 3.5L5.24992 9.91667L2.33325 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-600 group-hover:text-primary transition-colors truncate">{company}</span>
              </label>
            ))}
            {filteredCompanies.length === 0 && (
              <span className="text-sm text-gray-500 italic">No companies found.</span>
            )}
          </div>
          {filteredCompanies.length > 6 && (
             <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
          )}
        </div>
      </div>
      
      {/* Divider */}
      <div className="w-full h-px bg-gray-100"></div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3">
        <button className="w-full py-3 text-xs sm:text-sm font-bold bg-primary text-white border border-primary uppercase tracking-wider hover:bg-emerald-700 transition-colors cursor-pointer">
          Apply Filters
        </button>
        <button 
          className="w-full py-3 text-xs sm:text-sm font-bold text-gray-500 border border-gray-300 uppercase tracking-wider hover:bg-gray-50 hover:text-gray-900 transition-colors cursor-pointer"
          onClick={() => {
            setSelectedCategories([]);
            setCompanySearch("");
          }}
        >
          Clear All
        </button>
      </div>

    </div>
  );
}
