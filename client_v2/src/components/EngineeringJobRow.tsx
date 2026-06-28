import React from 'react';

export interface EngineeringJobRowProps {
  title: string;
  company: string;
  location: string;
  level: string;
  salary: string;
  tags: string[];
  postedAt: string;
  logoUrl?: string;
  url?: string;
}

export default function EngineeringJobRow({
  title,
  company,
  location,
  level,
  salary,
  tags,
  postedAt,
  logoUrl,
  url = "#"
}: EngineeringJobRowProps) {
  return (
    <a 
      href={url}
      className="group card card-hover p-4 md:px-6 md:py-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
    >
      <div className="flex items-center gap-4 min-w-0">
        <div className="size-10 logo-box text-lg">
          {logoUrl ? <img src={logoUrl} alt={`${company} logo`} className="w-full h-full object-contain p-1.5" /> : "⚡"}
        </div>
        <div className="min-w-0 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
          <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors truncate">
            {title}
          </h3>
          <span className="hidden sm:inline text-gray-300">•</span>
          <span className="text-meta truncate">
            {company}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap md:flex-nowrap items-center gap-3 md:gap-6 text-xs font-mono text-gray-500 shrink-0">
        <div className="flex items-center gap-1.5">
          {tags.slice(0, 3).map((tag, i) => (
            <span key={i} className="tag-solid">
              {tag}
            </span>
          ))}
        </div>

        <span className="hidden lg:inline text-gray-300">|</span>
        <span className="text-gray-600 font-medium">{location}</span>

        <span className="hidden lg:inline text-gray-300">|</span>
        <span className="font-bold text-foreground">{salary}</span>

        <span className="hidden sm:inline text-gray-400 text-[11px]">{postedAt}</span>

        <div className="size-8 rounded-full bg-gray-50 group-hover:bg-primary group-hover:text-white text-gray-400 flex items-center justify-center transition-colors ml-auto md:ml-0">
          <svg className="size-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </a>
  );
}
