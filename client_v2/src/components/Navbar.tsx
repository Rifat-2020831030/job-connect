import React from 'react';
import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="w-full border-b border-gray-200 bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 md:px-12 h-16 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-foreground tracking-tight">
          ChakriLagbe
        </Link>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
          <Link href="/jobs" className="hover:text-primary transition-colors">Find Jobs</Link>
          <Link href="/companies" className="hover:text-primary transition-colors">Companies</Link>
          <Link href="/about" className="hover:text-primary transition-colors">About Us</Link>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-primary transition-colors hidden sm:block">
            Sign In
          </Link>
          <Link href="/post-job" className="bg-foreground hover:bg-gray-800 text-white px-4 py-2 rounded text-sm font-bold transition-colors">
            Post a Job
          </Link>
        </div>
      </div>
    </nav>
  );
}
