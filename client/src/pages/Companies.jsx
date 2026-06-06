import React, { useState, useMemo, useEffect } from 'react';
import {
  Briefcase,
  Building2,
  Calendar,
  Globe,
  MapPin,
  TrendingUp,
  Users,
  Search,
  Filter,
  SortAsc,
  Grid,
  List,
} from "lucide-react";
import CompanyCard from "../components/CompanyCard";
import axios from "axios";
import Loader from '../utils/Loader';

// Main Companies component
const Companies = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState('grid');
  const [companies, setCompanies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null); // Added error state

  useEffect(() => {
    const fetchCompanies = async () => {
      setIsLoading(true);
      setError(null); // Reset error state
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/companies`
        );
        if (response.status === 200) {
          setCompanies(response.data.data || []); // Fallback to empty array
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      } catch (error) {
        console.error("Error fetching companies:", error);
        setError(error.message || "Failed to fetch companies");
        setCompanies([]);
      } finally {
        setIsLoading(false); 
      }
    };
    
    fetchCompanies();
  }, []);

  // Get unique categories
  const categories = useMemo(() => {
    if (!companies || companies.length === 0) return ['All'];
    const cats = [...new Set(companies.map(company => company.category).filter(Boolean))]; // Filter out undefined/null
    return ['All', ...cats];
  }, [companies]);

  // Filter and sort companies
  const filteredAndSortedCompanies = useMemo(() => {
    if (!companies || companies.length === 0) return [];
    
    let filtered = companies.filter(company => {
      // Safe string operations with fallbacks
      const name = company.name || '';
      const description = company.description || '';
      
      const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || company.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    // Sort companies
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.name || '').localeCompare(b.name || '');
        case 'jobs':
          return (b.current_open_jobs || 0) - (a.current_open_jobs || 0);
        case 'established': {
          const dateA = a.establishment_date ? new Date(a.establishment_date) : new Date(0);
          const dateB = b.establishment_date ? new Date(b.establishment_date) : new Date(0);
          return dateB - dateA;
        }
        default:
          return 0;
      }
    });

    return filtered;
  }, [searchTerm, selectedCategory, sortBy, companies]); // Added companies dependency

  // Calculate total open jobs safely
  const totalOpenJobs = useMemo(() => {
    return companies.reduce((sum, company) => sum + (company.current_open_jobs || 0), 0);
  }, [companies]);

  return (
    <div className="min-h-screen bg-green-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-8">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Tech Companies
              </h1>
              <p className="text-xl text-gray-600">
                Discover leading technology companies and their current job opportunities
              </p>
            </div>

            {/* Search and Filters - Only show when not loading */}
            {!isLoading && (
              <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                {/* Search Bar */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search companies..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {/* Filters */}
                <div className="flex gap-4 items-center">
                  {/* Category Filter */}
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-500" />
                    <select
                      className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                      {categories.map(category => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Sort */}
                  <div className="flex items-center gap-2">
                    <SortAsc className="w-4 h-4 text-gray-500" />
                    <select
                      className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      <option value="name">Name</option>
                      <option value="jobs">Open Jobs</option>
                      <option value="established">Established</option>
                    </select>
                  </div>

                  {/* View Mode Toggle */}
                  <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                    <button
                      className={`p-2 ${viewMode === 'grid' ? 'bg-purple-100 text-purple-600' : 'bg-white text-gray-400'}`}
                      onClick={() => setViewMode('grid')}
                    >
                      <Grid className="w-4 h-4" />
                    </button>
                    <button
                      className={`p-2 ${viewMode === 'list' ? 'bg-purple-100 text-purple-600' : 'bg-white text-gray-400'}`}
                      onClick={() => setViewMode('list')}
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>


      {!isLoading && !error && (
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>
                Showing {filteredAndSortedCompanies.length} of {companies.length} companies
              </span>
              <div className="flex items-center gap-6">
                <span className="flex items-center gap-1">
                  <Briefcase className="w-4 h-4" />
                  {totalOpenJobs} total open jobs
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Companies Grid/List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <Loader />
        ) : error ? (
          <div className="text-center py-12">
            <Building2 className="w-16 h-16 text-red-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">Error Loading Companies</h3>
            <p className="text-gray-500">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Try Again
            </button>
          </div>
        ) : filteredAndSortedCompanies.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No companies found</h3>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className={
            viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
              : "space-y-4"
          }>
            {filteredAndSortedCompanies.map((company) => (
              <CompanyCard key={company._id} company={company} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Companies;