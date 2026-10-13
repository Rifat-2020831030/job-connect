"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  getTokens,
  getUserInfo,
  clearTokens,
  UserInfo,
  getIsSubscribed,
  setIsSubscribed,
} from "../lib/auth";
import { fetchWithAuth } from "../lib/apiClient";
import {
  User,
  LogOut,
  ChevronDown,
  Bookmark,
  Menu,
  X as XIcon,
  Bell,
  MailMinus,
  Activity,
  Star,
} from "lucide-react";

const GITHUB_REPO_URL = "https://github.com/Rifat-2020831030/chakri-lagbe";

function GithubIcon({ className = "size-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isSubscribed, setIsSubscribedState] = useState<boolean | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const { accessToken } = getTokens();
    if (accessToken) {
      setIsAuthenticated(true);
      const userInfo = getUserInfo();
      setUser(userInfo);

      if (userInfo?.userId) {
        const storedSub = getIsSubscribed();
        if (storedSub !== null) {
          setIsSubscribedState(storedSub);
        } else {
          // Fetch from server
          fetchWithAuth(`/users/${userInfo.userId}/preferences`)
            .then((res) => res.json())
            .then((data) => {
              if (data.status === 1 && data.data) {
                const subscribed = data.data.unsubscribe_at == null;
                setIsSubscribed(subscribed);
                setIsSubscribedState(subscribed);
              }
            })
            .catch((err) =>
              console.error("Failed to load subscription state", err)
            );
        }
      }
    } else {
      setIsAuthenticated(false);
      setUser(null);
      setIsSubscribedState(null);
    }
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
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
    setShowMobileMenu(false);
    window.location.href = "/";
  };

  const navLinks = [
    { name: "Find Jobs", href: "/jobs" },
    { name: "Companies", href: "/companies" },
    { name: "About Us", href: "/about" },
  ];

  return (
    <nav className="w-full border-b border-gray-200 bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 md:px-12 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="text-lg sm:text-xl md:text-2xl font-bold text-foreground tracking-tight"
        >
          ChakriLagbe
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          {navLinks.map((link) => {
            const isActive =
              pathname === link.href || pathname?.startsWith(link.href + "/");
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`transition-colors ${
                  isActive ? "text-primary" : "text-gray-600 hover:text-primary"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          <a
            href={GITHUB_REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 hover:text-gray-900 border border-gray-200 rounded-full transition-colors"
          >
            <GithubIcon className="size-4 text-gray-800" />
            <span>Give a</span>
            <Star size={14} className="fill-amber-400 text-amber-500" />
          </a>

          {!isAuthenticated ? (
            <Link
              href="/login"
              className="text-sm font-medium text-gray-600 hover:text-primary transition-colors cursor-pointer"
            >
              Sign In
            </Link>
          ) : (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 hover:bg-gray-50 px-2 py-1.5 rounded-md transition-colors cursor-pointer"
              >
                <div className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                  {user?.email?.charAt(0).toUpperCase() || <User size={16} />}
                </div>
                <ChevronDown size={14} className="text-gray-500" />
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-md shadow-lg py-1 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium truncate">
                      {user?.email || "User"}
                    </p>
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
                    href="/tracker"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => setShowDropdown(false)}
                  >
                    <Activity size={14} />
                    Tracker
                  </Link>
                  <Link
                    href="/preferences"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => setShowDropdown(false)}
                  >
                    <User size={14} />
                    Preferences
                  </Link>
                  {isSubscribed === false && (
                    <Link
                      href="/preferences"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setShowDropdown(false)}
                    >
                      <Bell size={14} />
                      Subscribe
                    </Link>
                  )}
                  {isSubscribed === true && (
                    <Link
                      href={`/unsubscribe?id=${user?.userId}`}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setShowDropdown(false)}
                    >
                      <MailMinus size={14} />
                      Unsubscribe
                    </Link>
                  )}
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
        </div>

        {/* Mobile Header Actions */}
        <div className="md:hidden flex items-center gap-2">
          <a
            href={GITHUB_REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="cursor-pointer inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-full transition-colors"
          >
            <GithubIcon className="size-3.5 text-gray-800" />
            <span>Give a</span>
            <Star size={12} className="fill-amber-400 text-amber-500" />
          </a>

          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="p-2 -mr-2 text-gray-600 hover:text-foreground transition-colors cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {showMobileMenu ? <XIcon size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay & Panel */}
      <div
        className={`md:hidden fixed top-16 inset-x-0 bottom-0 z-40 transition-opacity duration-300 ${
          showMobileMenu
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/20 backdrop-blur-sm"
          onClick={() => setShowMobileMenu(false)}
        />

        {/* Sliding Panel */}
        <div
          className={`absolute inset-y-0 right-0 w-72 bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${
            showMobileMenu ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            <div className="flex flex-col space-y-2">
              {navLinks.map((link) => {
                const isActive =
                  pathname === link.href ||
                  pathname?.startsWith(link.href + "/");
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setShowMobileMenu(false)}
                    className={`block px-3 py-2.5 text-base font-medium rounded-md transition-colors ${
                      isActive
                        ? "text-primary bg-primary/5"
                        : "text-gray-600 hover:text-primary hover:bg-gray-50"
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </div>

            <div className="pt-6 border-t border-gray-100 flex flex-col space-y-2">
              {!isAuthenticated ? (
                <Link
                  href="/login"
                  onClick={() => setShowMobileMenu(false)}
                  className="block px-3 py-2.5 text-base font-medium text-gray-600 hover:text-primary rounded-md hover:bg-gray-50 cursor-pointer"
                >
                  Sign In
                </Link>
              ) : (
                <>
                  <div className="px-3 py-2 mb-2 flex items-center gap-3 bg-gray-50 rounded-lg">
                    <div className="size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
                      {user?.email?.charAt(0).toUpperCase() || (
                        <User size={18} />
                      )}
                    </div>
                    <span className="text-sm font-medium truncate text-gray-800">
                      {user?.email || "User"}
                    </span>
                  </div>
                  <Link
                    href="/saved-jobs"
                    onClick={() => setShowMobileMenu(false)}
                    className="flex items-center gap-3 px-3 py-2.5 text-base font-medium text-gray-600 hover:text-primary rounded-md hover:bg-gray-50 cursor-pointer"
                  >
                    <Bookmark size={18} />
                    Saved Jobs
                  </Link>
                  <Link
                    href="/tracker"
                    onClick={() => setShowMobileMenu(false)}
                    className="flex items-center gap-3 px-3 py-2.5 text-base font-medium text-gray-600 hover:text-primary rounded-md hover:bg-gray-50 cursor-pointer"
                  >
                    <Activity size={18} />
                    Tracker
                  </Link>
                  <Link
                    href="/preferences"
                    onClick={() => setShowMobileMenu(false)}
                    className="flex items-center gap-3 px-3 py-2.5 text-base font-medium text-gray-600 hover:text-primary rounded-md hover:bg-gray-50 cursor-pointer"
                  >
                    <User size={18} />
                    Preferences
                  </Link>
                  {isSubscribed === false && (
                    <Link
                      href="/preferences"
                      onClick={() => setShowMobileMenu(false)}
                      className="flex items-center gap-3 px-3 py-2.5 text-base font-medium text-gray-600 hover:text-primary rounded-md hover:bg-gray-50 cursor-pointer"
                    >
                      <Bell size={18} />
                      Subscribe
                    </Link>
                  )}
                  {isSubscribed === true && (
                    <Link
                      href={`/unsubscribe?id=${user?.userId}`}
                      onClick={() => setShowMobileMenu(false)}
                      className="flex items-center gap-3 px-3 py-2.5 text-base font-medium text-gray-600 hover:text-primary rounded-md hover:bg-gray-50 cursor-pointer"
                    >
                      <MailMinus size={18} />
                      Unsubscribe
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-3 py-2.5 text-base font-medium text-red-600 hover:text-red-700 rounded-md hover:bg-red-50 w-full text-left cursor-pointer"
                  >
                    <LogOut size={18} />
                    Sign Out
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
