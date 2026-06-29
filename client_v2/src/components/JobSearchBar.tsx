"use client";

import React, { useState, useEffect } from 'react';
import { Search, MapPin, X } from 'lucide-react';

interface JobSearchBarProps {
  initialQuery?: string;
  initialLocation?: string;
  onSearch: (query: string, location: string) => void;
}

export default function JobSearchBar({ initialQuery = "", initialLocation = "", onSearch }: JobSearchBarProps) {
  const [query, setQuery] = useState(initialQuery);
  const [location, setLocation] = useState(initialLocation);

  // Sync state if URL changes externally
  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    setLocation(initialLocation);
  }, [initialLocation]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query, location);
  };

  return (
    <form 
      onSubmit={handleSearch}
      className="w-full flex flex-row items-center border border-gray-300 rounded-full bg-white shadow-sm hover:shadow transition-shadow overflow-hidden p-1 sm:p-1.5 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary"
    >
      <div className="flex-1 flex items-center px-2 sm:px-4 py-1.5 sm:py-3 min-w-0 relative">
        <Search className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mr-2 sm:mr-3 shrink-0" />
        <input 
          type="text" 
          placeholder="Job title..." 
          className="w-full outline-none bg-transparent text-foreground placeholder:text-gray-400 text-xs sm:text-base font-medium truncate pr-6 sm:pr-8"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {query && (
          <button 
            type="button"
            onClick={() => setQuery("")}
            className="absolute right-2 sm:right-4 p-1 text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        )}
      </div>
      
      <div className="w-px h-6 sm:h-8 bg-gray-200 shrink-0"></div>
      
      <div className="flex-1 flex items-center px-2 sm:px-4 py-1.5 sm:py-3 min-w-0 relative">
        <MapPin className="hidden sm:block w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mr-2 sm:mr-3 shrink-0" />
        <input 
          type="text" 
          placeholder="Location..." 
          className="w-full outline-none bg-transparent text-foreground placeholder:text-gray-400 text-xs sm:text-base font-medium truncate pr-6 sm:pr-8"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        {location && (
          <button 
            type="button"
            onClick={() => setLocation("")}
            className="absolute right-2 sm:right-4 p-1 text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        )}
      </div>
      
      <button 
        type="submit" 
        className="bg-primary hover:bg-emerald-700 text-white font-bold py-2 sm:py-3 px-4 sm:px-8 rounded-full transition-colors cursor-pointer shrink-0 text-xs sm:text-base ml-1 sm:ml-0"
      >
        Search
      </button>
    </form>
  );
}
