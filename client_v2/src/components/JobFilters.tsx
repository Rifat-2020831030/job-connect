"use client";

import React, { useState, useEffect } from 'react';
import { Loader2, Search, X } from 'lucide-react';

export interface FilterOption {
  value: string;
  count: number;
}

export interface FilterOptions {
  categories: FilterOption[];
  experienceLevels: FilterOption[];
  jobTypes: FilterOption[];
  topCompanies: FilterOption[];
}

export interface ActiveFilters {
  categories: string[];
  experienceLevels: string[];
  jobTypes: string[];
  companies: string[];
}

interface JobFiltersProps {
  options: FilterOptions;
  activeFilters: ActiveFilters;
  onApplyFilters: (filters: ActiveFilters) => void;
  onClearFilters: () => void;
  className?: string;
  isApplying?: boolean;
}

export default function JobFilters({
  options,
  activeFilters,
  onApplyFilters,
  onClearFilters,
  className,
  isApplying = false
}: JobFiltersProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>(activeFilters.categories);
  const [selectedExp, setSelectedExp] = useState<string[]>(activeFilters.experienceLevels);
  const [selectedTypes, setSelectedTypes] = useState<string[]>(activeFilters.jobTypes);
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>(activeFilters.companies);
  const [companySearch, setCompanySearch] = useState("");

  // Sync state if props change (e.g. user hits back button or clear filters from parent)
  useEffect(() => {
    setSelectedCategories(activeFilters.categories);
    setSelectedExp(activeFilters.experienceLevels);
    setSelectedTypes(activeFilters.jobTypes);
    setSelectedCompanies(activeFilters.companies);
  }, [activeFilters]);

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const toggleExp = (level: string) => {
    setSelectedExp(prev => 
      prev.includes(level) ? prev.filter(l => l !== level) : [...prev, level]
    );
  };

  const toggleType = (type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const toggleCompany = (comp: string) => {
    setSelectedCompanies(prev => 
      prev.includes(comp) ? prev.filter(c => c !== comp) : [...prev, comp]
    );
  };

  const filteredCompanies = options.topCompanies.filter(c => 
    c.value.toLowerCase().includes(companySearch.toLowerCase())
  );

  const activeFilterCount =
    selectedCategories.length +
    selectedExp.length +
    selectedTypes.length +
    selectedCompanies.length;

  const handleApply = () => {
    onApplyFilters({
      categories: selectedCategories,
      experienceLevels: selectedExp,
      jobTypes: selectedTypes,
      companies: selectedCompanies
    });
  };

  const handleClear = () => {
    setCompanySearch("");
    onClearFilters();
  };

  return (
    <div className={`flex flex-col w-full h-full bg-white border border-gray-200 overflow-hidden ${className || ""}`}>
      {/* Desktop Header */}
      <div className="hidden lg:flex items-center justify-between px-5 py-3.5 border-b border-gray-200 bg-white shrink-0">
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm text-foreground tracking-tight">Filters</span>
          {activeFilterCount > 0 && (
            <span className="size-5 rounded-full bg-primary/10 text-primary text-[10px] font-mono font-bold flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </div>
        {activeFilterCount > 0 && (
          <button
            onClick={handleClear}
            disabled={isApplying}
            className="text-xs font-mono text-gray-500 hover:text-primary transition-colors cursor-pointer underline underline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:no-underline"
          >
            Reset
          </button>
        )}
      </div>

      {/* Scrollable Filter Content Body */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-5 md:p-6 flex flex-col gap-8">
        {/* Categories */}
      {options.categories.length > 0 && (
        <div className="flex flex-col gap-4">
          <h3 className="text-xs font-mono font-medium tracking-[1.2px] text-gray-500 uppercase">
            Categories
          </h3>
          <div className="flex flex-wrap gap-2">
            {options.categories.map(cat => {
              const isSelected = selectedCategories.includes(cat.value);
              return (
                <button
                  key={cat.value}
                  onClick={() => toggleCategory(cat.value)}
                  className={`px-3 py-1.5 text-xs font-mono border transition-colors cursor-pointer uppercase ${
                    isSelected 
                      ? "bg-primary border-primary text-white font-bold" 
                      : "bg-white border-gray-200 text-gray-600 hover:border-gray-900 hover:text-gray-900"
                  }`}
                >
                  {cat.value}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Experience Level */}
      {options.experienceLevels.length > 0 && (
        <div className="flex flex-col gap-4">
          <h3 className="text-xs font-mono font-medium tracking-[1.2px] text-gray-500 uppercase">
            Experience
          </h3>
          <div className="flex flex-col gap-3">
            {options.experienceLevels.map(level => (
              <label key={level.value} className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center shrink-0">
                  <input 
                    type="checkbox" 
                    checked={selectedExp.includes(level.value)}
                    onChange={() => toggleExp(level.value)}
                    className="peer appearance-none size-4 border border-gray-300 checked:bg-primary checked:border-primary transition-colors cursor-pointer"
                  />
                  <svg className="absolute size-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11.6666 3.5L5.24992 9.91667L2.33325 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-600 group-hover:text-primary transition-colors flex-1">{level.value}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Job Type */}
      {options.jobTypes.length > 0 && (
        <div className="flex flex-col gap-4">
          <h3 className="text-xs font-mono font-medium tracking-[1.2px] text-gray-500 uppercase">
            Job Type
          </h3>
          <div className="flex flex-col gap-3">
            {options.jobTypes.map(type => (
              <label key={type.value} className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center shrink-0">
                  <input 
                    type="checkbox" 
                    checked={selectedTypes.includes(type.value)}
                    onChange={() => toggleType(type.value)}
                    className="peer appearance-none size-4 border border-gray-300 checked:bg-primary checked:border-primary transition-colors cursor-pointer"
                  />
                  <svg className="absolute size-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11.6666 3.5L5.24992 9.91667L2.33325 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-600 group-hover:text-primary transition-colors flex-1">{type.value}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Companies */}
      {options.topCompanies.length > 0 && (
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
              className="w-full pl-9 pr-9 py-2.5 bg-gray-50 border border-gray-200 text-sm font-medium outline-none focus:border-primary focus:bg-white transition-colors placeholder:text-gray-400"
              value={companySearch}
              onChange={e => setCompanySearch(e.target.value)}
            />
            {companySearch && (
              <button 
                type="button"
                onClick={() => setCompanySearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer p-0.5"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Company List with gradient mask for overflow */}
          <div className="relative mt-2">
            <div className="flex flex-col gap-3 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar pb-6">
              {filteredCompanies.map(company => (
                <label key={company.value} className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center shrink-0">
                    <input 
                      type="checkbox" 
                      checked={selectedCompanies.includes(company.value)}
                      onChange={() => toggleCompany(company.value)}
                      className="peer appearance-none size-4 border border-gray-300 checked:bg-primary checked:border-primary transition-colors cursor-pointer"
                    />
                    <svg className="absolute size-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M11.6666 3.5L5.24992 9.91667L2.33325 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-600 group-hover:text-primary transition-colors truncate flex-1">{company.value}</span>
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
      )}
      </div>

      {/* Pinned Action Buttons Footer */}
      <div className="shrink-0 p-4 border-t border-gray-200 bg-white flex flex-col gap-2.5 z-10 shadow-[0_-4px_12px_rgba(0,0,0,0.03)]">
        <button 
          onClick={handleApply}
          disabled={isApplying}
          className="w-full py-2.5 sm:py-3 text-xs sm:text-sm font-bold bg-primary text-white border border-primary uppercase tracking-wider hover:bg-emerald-700 transition-colors cursor-pointer rounded-xs disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isApplying ? (
            <>
              <Loader2 className="size-3.5 animate-spin" />
              Applying...
            </>
          ) : (
            "Apply Filters"
          )}
        </button>
        <button 
          className="w-full py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-gray-500 border border-gray-300 uppercase tracking-wider hover:bg-gray-50 hover:text-gray-900 transition-colors cursor-pointer rounded-xs disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleClear}
          disabled={isApplying}
        >
          Clear All
        </button>
      </div>

    </div>
  );
}
