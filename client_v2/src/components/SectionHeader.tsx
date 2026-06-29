import React from 'react';
import Link from 'next/link';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  viewAllLink?: string;
}

export default function SectionHeader({ title, subtitle, viewAllLink = '#' }: SectionHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between w-full mb-8 gap-4">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl md:text-3xl font-semibold text-foreground tracking-tight">{title}</h2>
        {subtitle && <p className="text-gray-600 text-base">{subtitle}</p>}
      </div>
      
      <Link href={viewAllLink} className="group flex items-center gap-2 text-primary font-mono font-semibold text-sm tracking-wider uppercase hover:text-emerald-600 transition-colors">
        <span>VIEW ALL JOBS</span>
        <svg className="size-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </Link>
    </div>
  );
}
