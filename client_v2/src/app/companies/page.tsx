"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { API_BASE_URL } from '@/lib/api';
import { Search, Building2, Loader2 } from 'lucide-react';
import CompanyCard, { Company } from '@/components/CompanyCard';
import { useRouter } from 'next/navigation';

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  
  const [totalLoaded, setTotalLoaded] = useState(0);
  const router = useRouter();

  // Debounce search query
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
  
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchCompanies = async (cursor: string | null = null, search: string = "") => {
    try {
      const url = new URL(`${API_BASE_URL}/companies`);
      url.searchParams.append("limit", "10");
      if (cursor) url.searchParams.append("cursor", cursor);
      if (search) url.searchParams.append("search", search);

      const res = await fetch(url.toString());
      const data = await res.json();
      
      return data;
    } catch (error) {
      console.error("Failed to fetch companies:", error);
      return null;
    }
  };

  // Initial load & Search load
  useEffect(() => {
    const loadInitial = async () => {
      setIsLoading(true);
      const data = await fetchCompanies(null, debouncedSearch);
      if (data && data.status === 1) {
        setCompanies(data.data || []);
        setNextCursor(data.nextCursor || null);
        setTotalLoaded((data.data || []).length);
      } else {
        setCompanies([]);
        setNextCursor(null);
        setTotalLoaded(0);
      }
      setIsLoading(false);
    };
    
    loadInitial();
  }, [debouncedSearch]);

  const loadMoreCompanies = async () => {
    if (isFetchingMore || !nextCursor) return;
    
    setIsFetchingMore(true);
    const data = await fetchCompanies(nextCursor, debouncedSearch);
    if (data && data.status === 1) {
      setCompanies(prev => [...prev, ...(data.data || [])]);
      setNextCursor(data.nextCursor || null);
      setTotalLoaded(prev => prev + (data.data || []).length);
    }
    setIsFetchingMore(false);
  };

  // Intersection Observer for infinite scroll
  const observer = useRef<IntersectionObserver | null>(null);
  const lastCompanyElementRef = useCallback((node: HTMLDivElement | null) => {
    if (isLoading || isFetchingMore) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && nextCursor) {
        loadMoreCompanies();
      }
    });
    
    if (node) observer.current.observe(node);
  }, [isLoading, isFetchingMore, nextCursor, debouncedSearch]);

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      {/* Hero Section */}
      <section className="bg-white border-b border-gray-100 relative overflow-hidden pt-12 pb-16">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />
        
        <div className="container mx-auto px-4 max-w-7xl relative z-10">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Building2 className="w-4 h-4" />
              <span>Explore Employers</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900">
              Top Tech Companies
            </h1>
            
            <p className="text-lg text-gray-500">
              Discover leading companies, explore their culture, and find your next big career move.
            </p>

            {/* Search Bar */}
            <div className="pt-4 max-w-xl mx-auto relative">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
                  <Search className="w-5 h-5" />
                </div>
                <input 
                  type="text"
                  placeholder="Search companies by name or category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all text-gray-900 shadow-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Grid Section */}
      <section className="container mx-auto px-4 max-w-7xl pt-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            Companies
            <span className="text-sm font-normal text-gray-500 bg-gray-200 px-2.5 py-0.5 rounded-full">
              {totalLoaded}
            </span>
          </h2>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
            <p className="text-gray-500 font-medium text-lg">Loading companies...</p>
          </div>
        ) : companies.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No companies found</h3>
            <p className="text-gray-500 max-w-sm mx-auto">We couldn't find any companies matching your search. Try a different keyword.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {companies.map((company, index) => {
              if (index === companies.length - 1) {
                return (
                  <div ref={lastCompanyElementRef} key={company._id}>
                    <CompanyCard 
                      company={company}
                      onClick={(c) => router.push(`/companies/${c._id}`)}
                    />
                  </div>
                );
              } else {
                return (
                  <CompanyCard 
                    key={company._id}
                    company={company}
                    onClick={(c) => router.push(`/companies/${c._id}`)}
                  />
                );
              }
            })}
          </div>
        )}
        
        {/* Loading more state */}
        {isFetchingMore && (
          <div className="w-full flex justify-center py-8 mt-4">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        )}
      </section>
    </div>
  );
}
