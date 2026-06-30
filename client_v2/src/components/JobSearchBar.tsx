"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, X } from 'lucide-react';
import { API_BASE_URL } from '@/lib/api';

interface JobSearchBarProps {
  initialQuery?: string;
  initialLocation?: string;
  onSearch: (query: string, location: string) => void;
}

export default function JobSearchBar({ initialQuery = "", initialLocation = "", onSearch }: JobSearchBarProps) {
  const [query, setQuery] = useState(initialQuery);
  const [location, setLocation] = useState(initialLocation);
  
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!location.trim() || location.length < 2) {
        setLocationSuggestions([]);
        return;
      }
      try {
        const res = await fetch(`${API_BASE_URL}/jobs/location-suggestions?q=${encodeURIComponent(location)}`);
        const data = await res.json();
        if (res.ok && data.status === 1) {
          setLocationSuggestions(data.data);
        }
      } catch (err) {
        // ignore
      }
    };
    
    const timeoutId = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [location]);

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
      className="w-full flex flex-row items-center border border-gray-300 rounded-full bg-white shadow-sm hover:shadow transition-shadow p-1 sm:p-1.5 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary relative"
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
          onChange={(e) => {
            setLocation(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => {
            if (locationSuggestions.length > 0) setShowSuggestions(true);
          }}
        />
        {location && (
          <button 
            type="button"
            onClick={() => {
              setLocation("");
              setLocationSuggestions([]);
              setShowSuggestions(false);
            }}
            className="absolute right-2 sm:right-4 p-1 text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        )}
        
        {/* Dropdown Suggestions */}
        {showSuggestions && locationSuggestions.length > 0 && (
          <div 
            ref={suggestionRef}
            className="absolute top-full left-0 mt-2 w-full bg-white border border-gray-200 rounded-md shadow-lg py-1 z-50 overflow-hidden"
          >
            {locationSuggestions.map((suggestion, idx) => (
              <div
                key={idx}
                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer flex items-center gap-2"
                onClick={() => {
                  setLocation(suggestion);
                  setShowSuggestions(false);
                }}
              >
                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                <span className="truncate">{suggestion}</span>
              </div>
            ))}
          </div>
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
