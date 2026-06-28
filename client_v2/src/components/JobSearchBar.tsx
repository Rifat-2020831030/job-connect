"use client";

import React, { useState } from 'react';
import { Search, MapPin } from 'lucide-react';

export default function JobSearchBar() {
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search logic will go here
    console.log("Searching for:", query, "in", location);
  };

  return (
    <form 
      onSubmit={handleSearch}
      className="w-full flex flex-row items-center border border-gray-300 rounded-full bg-white shadow-sm hover:shadow transition-shadow overflow-hidden p-1 sm:p-1.5 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary"
    >
      <div className="flex-1 flex items-center px-2 sm:px-4 py-1.5 sm:py-3 min-w-0">
        <Search className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mr-2 sm:mr-3 shrink-0" />
        <input 
          type="text" 
          placeholder="Job title..." 
          className="w-full outline-none bg-transparent text-foreground placeholder:text-gray-400 text-xs sm:text-base font-medium truncate"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      
      <div className="w-px h-6 sm:h-8 bg-gray-200 shrink-0"></div>
      
      <div className="flex-1 flex items-center px-2 sm:px-4 py-1.5 sm:py-3 min-w-0">
        <MapPin className="hidden sm:block w-4 h-4 sm:w-5 sm:h-5 text-gray-400 mr-2 sm:mr-3 shrink-0" />
        <input 
          type="text" 
          placeholder="Location..." 
          className="w-full outline-none bg-transparent text-foreground placeholder:text-gray-400 text-xs sm:text-base font-medium truncate"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
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
