import React from 'react';
import Image from 'next/image';

export interface FeaturedJobCardProps {
  title: string;
  companyName: string;
  location: string;
  level: string;
  salary: string;
  vacancy?: string;
  experience?: string;
  deadline?: string;
  logoUrl?: string;
  url?: string;
}

export default function FeaturedJobCard({
  title,
  companyName,
  location,
  level,
  salary,
  vacancy = "Not Specified",
  experience = "Not Specified",
  deadline,
  logoUrl,
  url = "#"
}: FeaturedJobCardProps) {
  return (
    <div className="card flex flex-col justify-between w-full col-span-1 md:col-span-2">
      <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between w-full">
        <div className="flex items-start md:items-center gap-6">
          <div className="relative size-14 logo-box text-2xl overflow-hidden">
            {logoUrl ? <Image src={logoUrl} alt={`${companyName} logo`} fill unoptimized className="object-contain p-2 text-[10px] leading-tight text-center text-gray-400 break-words flex items-center justify-center" /> : "🚀"}
          </div>
          
          <div className="flex flex-col gap-1">
            <h3 className="text-xl md:text-2xl font-bold text-foreground">{title}</h3>
            <p className="text-meta">
              {companyName} • {location}
            </p>
            <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-500 font-mono">
              <div><span className="font-semibold text-gray-700">Exp:</span> {experience}</div>
              <div><span className="font-semibold text-gray-700">Vacancies:</span> {vacancy}</div>
              {deadline && <div><span className="font-semibold text-gray-700">Deadline:</span> {deadline}</div>}
            </div>
          </div>
        </div>
        
        <div className="flex flex-col items-start md:items-end gap-2 w-full md:w-auto mt-4 md:mt-0 shrink-0">
          <span className="text-meta">{level}</span>
          <span className="text-lg md:text-xl font-bold text-foreground">{salary}</span>
          <a href={url} className="w-full md:w-auto px-8 py-2.5 btn-primary mt-2">
            Apply
          </a>
        </div>
      </div>
    </div>
  );
}
