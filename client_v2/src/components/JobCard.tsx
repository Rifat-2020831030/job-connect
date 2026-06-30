import React from 'react';
import { formatRelativeTime, formatSalary, formatDate } from '../lib/utils';
import Image from 'next/image';
import { useSavedJobs } from '../lib/SavedJobsContext';
import { Bookmark } from 'lucide-react';

export interface JobCardProps {
  _id?: string;
  title: string;
  company: string;
  location: string;
  experience_level: string;
  salary?: string;
  salary_min?: number;
  salary_max?: number;
  vacancy?: string | number;
  experience?: string;
  deadline?: string;
  first_seen: string;
  skills: string[];
  logo?: string;
  url?: string;
  onViewDetails?: () => void;
}

export default function JobCard({
  _id,
  title,
  company,
  location,
  experience_level = "Not Specified",
  salary,
  salary_min,
  salary_max,
  vacancy,
  experience,
  deadline,
  first_seen,
  skills = [],
  logo,
  url = "#",
  onViewDetails
}: JobCardProps) {
  const { isJobSaved, toggleSavedJob } = useSavedJobs();
  const isSaved = _id ? isJobSaved(_id) : false;
  
  const displaySalary = formatSalary(salary, salary_min, salary_max);
  const displayTime = formatRelativeTime(first_seen);
  
  const displayExp = (!experience || experience === "-1") ? "Not Mentioned" : experience;
  const displayVacancy = (!vacancy || vacancy === "-1") ? "Not Mentioned" : vacancy;
  const displayDeadline = formatDate(deadline);

  return (
    <div className="card flex flex-col justify-between h-full">
      <div>
        <div className="flex justify-between items-start mb-4">
          <div className="relative size-12 logo-box text-xl overflow-hidden">
            {logo ? <Image src={logo} alt={`${company} logo`} fill unoptimized className="object-contain p-2 text-[10px] leading-tight text-center text-gray-400 break-words flex items-center justify-center" /> : "🏢"}
          </div>
          <button 
            onClick={() => _id && toggleSavedJob(_id)}
            className={`${isSaved ? "text-primary" : "text-gray-400"} hover:text-primary transition-colors shrink-0`}
            aria-label={isSaved ? "Unsave Job" : "Save Job"}
          >
            <Bookmark className="size-5" fill={isSaved ? "currentColor" : "none"} />
          </button>
        </div>
        
        <div className="mb-4">
          <h3 className="text-xl font-bold text-foreground mb-1 line-clamp-1" title={title}>{title}</h3>
          <p className="text-meta !text-primary mb-2 line-clamp-1" title={`${company} • ${location}`}>
            {company} • {location}
          </p>
          <p className="text-meta tracking-widest mb-2 line-clamp-1">{experience_level}</p>
        </div>
        
        <div className="grid grid-cols-2 gap-y-1 mb-4 text-xs text-gray-500 font-mono">
          <div className="truncate"><span className="font-semibold text-gray-700">Exp:</span> {displayExp}</div>
          <div className="truncate"><span className="font-semibold text-gray-700">Vacancies:</span> {displayVacancy}</div>
          {displayDeadline && <div className="col-span-2 truncate"><span className="font-semibold text-gray-700">Deadline:</span> {displayDeadline}</div>}
        </div>
      </div>
      
      <div>
        <div className="flex items-center justify-between border-t border-gray-200 pt-4 mb-4">
          <div className="flex flex-col">
            <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-0.5">Salary</span>
            <span className="font-bold text-foreground truncate">{displaySalary}</span>
          </div>
          <div className="flex flex-col items-end text-right">
            <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-0.5">Posted</span>
            <span className="text-meta shrink-0">{displayTime}</span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {skills.map((tag, index) => (
            <span key={index} className="tag-outline">
              {tag}
            </span>
          ))}
        </div>
        
        {onViewDetails ? (
          <button 
            onClick={onViewDetails} 
            className="w-full py-2 btn-secondary cursor-pointer"
          >
            View Details
          </button>
        ) : (
          <a 
            href={url} 
            className="w-full py-2 btn-secondary block text-center"
          >
            View Details
          </a>
        )}
      </div>
    </div>
  );
}
