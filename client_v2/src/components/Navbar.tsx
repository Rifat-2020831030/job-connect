"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getTokens, getUserInfo, clearTokens, UserInfo } from '../lib/auth';
import { User, LogOut, ChevronDown, Bookmark } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const { accessToken } = getTokens();
    if (accessToken) {
      setIsAuthenticated(true);
      setUser(getUserInfo());
    } else {
      setIsAuthenticated(false);
      setUser(null);
    }
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    clearTokens();
    setIsAuthenticated(false);
    setUser(null);
    setShowDropdown(false);
    window.location.href = "/";
  };

  const navLinks = [
    { name: "Find Jobs", href: "/jobs" },
    { name: "Companies", href: "/companies" },
    { name: "About Us", href: "/about" },
  ];

  return (
    <nav className="w-full border-b border-gray-200 bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 md:px-12 h-16 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-foreground tracking-tight">
          ChakriLagbe
        </Link>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || pathname?.startsWith(link.href + '/');
            return (
              <Link 
                key={link.name} 
                href={link.href} 
                className={`transition-colors ${isActive ? "text-primary" : "text-gray-600 hover:text-primary"}`}
              >
                {link.name}
              </Link>
            );
          })}
        </div>
        <div className="flex items-center gap-4">
          {!isAuthenticated ? (
            <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-primary transition-colors hidden sm:block">
              Sign In
            </Link>
          ) : (
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 hover:bg-gray-50 px-2 py-1.5 rounded-md transition-colors"
              >
                <div className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                  {user?.email?.charAt(0).toUpperCase() || <User size={16} />}
                </div>
                <ChevronDown size={14} className="text-gray-500" />
              </button>
              
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-md shadow-lg py-1 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium truncate">{user?.email || "User"}</p>
                  </div>
                  <Link 
                    href="/saved-jobs" 
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => setShowDropdown(false)}
                  >
                    <Bookmark size={14} />
                    Saved Jobs
                  </Link>
                  <Link 
                    href="/preferences" 
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => setShowDropdown(false)}
                  >
                    <User size={14} />
                    Preferences
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left cursor-pointer"
                  >
                    <LogOut size={14} />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          )}
          <Link href="/post-job" className="bg-foreground hover:bg-gray-800 text-white px-4 py-2 rounded text-sm font-bold transition-colors">
            Post a Job
          </Link>
        </div>
      </div>
    </nav>
  );
}
