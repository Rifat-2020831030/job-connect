import React from 'react';
import { Bookmark, Clock, Users, Briefcase } from 'lucide-react';

export interface JobRowProps {
  title: string;
  company: string;
  location: string;
  level: string;
  salary: string;
  tags: string[];
  postedAt: string;
  logoUrl?: string;
  url?: string;
  experience?: string;
  vacancy?: string;
  deadline?: string;
  description?: string;
  onViewDetails?: () => void;
}

export default function JobRow({
  title,
  company,
  location,
  level,
  salary,
  tags,
  postedAt,
  logoUrl,
  url = "#",
  experience,
  vacancy,
  deadline,
  description,
  onViewDetails
}: JobRowProps) {
  // Define mapping logic if level doesn't explicitly match the sidebar
  let mappedLevel = level;
  if (level.toUpperCase().includes('SENIOR')) mappedLevel = 'Senior (5+ years)';
  else if (level.toUpperCase().includes('MID')) mappedLevel = 'Mid-Level (2-5 years)';
  else if (level.toUpperCase().includes('JUNIOR')) mappedLevel = 'Junior (0-2 years)';

  return (
    <div className="group border border-gray-200 bg-white p-5 md:p-6 flex flex-col gap-5 hover:border-gray-300 transition-colors w-full">
      
      {/* Top Section: Logo & Title (Left) + Seniority & Bookmark (Right) */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        
        {/* Left: Logo + Title/Company */}
        <div className="flex items-start gap-4 min-w-0">
          <div className="size-12 border border-gray-200 p-2 flex items-center justify-center shrink-0">
            {logoUrl ? (
              <img src={logoUrl} alt={`${company} logo`} className="w-full h-full object-contain" />
            ) : (
              <div className="w-full h-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                {company.charAt(0)}
              </div>
            )}
          </div>
          
          <div className="flex flex-col min-w-0">
            {onViewDetails ? (
              <button onClick={onViewDetails} className="inline-block hover:text-primary transition-colors text-left cursor-pointer">
                <h3 className="text-lg md:text-xl font-bold text-foreground break-words whitespace-normal">{title}</h3>
              </button>
            ) : (
              <a href={url} className="inline-block hover:text-primary transition-colors">
                <h3 className="text-lg md:text-xl font-bold text-foreground break-words whitespace-normal">{title}</h3>
              </a>
            )}
            <div className="text-[11px] sm:text-xs font-mono text-gray-500 uppercase tracking-widest flex flex-wrap items-center gap-x-2 gap-y-1 mt-1">
              <span className="truncate max-w-[120px] sm:max-w-none">{company}</span>
              <span className="text-gray-300">•</span>
              <span className="truncate max-w-[120px] sm:max-w-none">{location}</span>
            </div>
            
            {/* Crucial Info (Experience, Vacancy, Deadline) */}
            <div className="flex flex-wrap items-center gap-3 md:gap-5 mt-3">
              {experience && (
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Briefcase className="size-3.5" />
                  <span>{experience}</span>
                </div>
              )}
              {vacancy && (
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Users className="size-3.5" />
                  <span>{vacancy} Vacancies</span>
                </div>
              )}
              {deadline && (
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Clock className="size-3.5" />
                  <span>Deadline: {deadline}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Seniority & Bookmark */}
        <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto shrink-0 mt-2 sm:mt-0 border-t border-gray-100 sm:border-0 pt-3 sm:pt-0">
          <span className="font-mono text-[11px] uppercase tracking-wider text-gray-400">
            {mappedLevel}
          </span>
          <button className="text-gray-400 hover:text-primary transition-colors cursor-pointer" aria-label="Save Job">
            <Bookmark className="size-5" />
          </button>
        </div>

      </div>

      {/* Divider */}
      <div className="w-full h-px bg-gray-100 my-1 hidden sm:block"></div>

      {/* Bottom Row: Salary, Tags, Posted Time, Buttons */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 min-w-0">
          <span className="text-lg md:text-xl font-bold text-foreground shrink-0">{salary}</span>
          <div className="flex flex-wrap gap-2 items-center">
            {tags.slice(0, 3).map(tag => (
              <span key={tag} className="px-2.5 py-1 text-[11px] font-mono border border-gray-200 text-gray-600 uppercase truncate max-w-[120px]">
                {tag}
              </span>
            ))}
            {tags.length > 3 && (
              <span className="px-2.5 py-1 text-[11px] font-mono border border-transparent text-gray-400 uppercase">
                +{tags.length - 3} more
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4 lg:gap-6 shrink-0 border-t border-gray-100 sm:border-0 pt-4 sm:pt-0">
           <div className="flex flex-col sm:items-end text-left sm:text-right">
             <span className="text-[10px] text-gray-400 font-mono uppercase tracking-widest mb-0.5">Posted</span>
             <span className="text-[11px] font-mono text-gray-600 uppercase tracking-widest">{postedAt}</span>
           </div>
           
           <div className="flex gap-3 mt-2 sm:mt-0 w-full sm:w-auto">
             {onViewDetails ? (
               <button 
                 onClick={onViewDetails}
                 className="flex-1 sm:flex-none text-center px-4 md:px-6 py-2 text-xs md:text-sm font-bold text-primary border border-primary uppercase tracking-wider hover:bg-primary/5 transition-colors whitespace-nowrap cursor-pointer"
               >
                 Details
               </button>
             ) : (
               <a 
                 href={url}
                 className="flex-1 sm:flex-none text-center px-4 md:px-6 py-2 text-xs md:text-sm font-bold text-primary border border-primary uppercase tracking-wider hover:bg-primary/5 transition-colors whitespace-nowrap"
               >
                 Details
               </a>
             )}
             <a 
               href={url}
               className="flex-1 sm:flex-none text-center px-4 md:px-6 py-2 text-xs md:text-sm font-bold bg-primary text-white border border-primary uppercase tracking-wider hover:bg-emerald-700 transition-colors whitespace-nowrap"
             >
               Apply Now
             </a>
           </div>
        </div>

      </div>
    </div>
  );
}
