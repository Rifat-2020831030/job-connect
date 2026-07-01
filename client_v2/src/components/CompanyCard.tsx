import { ExternalLink } from "lucide-react";
import CompanyLogo from "./CompanyLogo";

export interface Company {
  _id: string;
  logo: string;
  name: string;
  category: string;
  website: string;
  tech_stack: string[];
  active_jobs_count: number;
}

interface CompanyCardProps {
  company: Company;
  onClick: (company: Company) => void;
}

export default function CompanyCard({ company, onClick }: CompanyCardProps) {
  const fallbackColor = `hsl(${(company.name.length * 15) % 360}, 10%, 90%)`;

  // Determine tech stack to show (max 3, plus a remainder tag)
  const maxTags = 3;
  const visibleTech = company.tech_stack
    ? company.tech_stack.slice(0, maxTags)
    : [];
  const remainingTech = company.tech_stack
    ? company.tech_stack.length - maxTags
    : 0;

  return (
    <div
      onClick={() => onClick(company)}
      className="bg-white p-5 border border-gray-300 shadow-sm hover:border-gray-400 hover:shadow-md transition-all cursor-pointer flex flex-col h-full rounded-sm"
    >
      {/* Top Row: Logo & Open Jobs */}
      <div className="flex justify-between items-start mb-6">
        <CompanyLogo
          logo={company.logo}
          companyName={company.name}
          className="w-14 h-14 bg-gray-50 border border-gray-200 flex-shrink-0 rounded-sm"
          fallbackClassName="text-gray-400 text-2xl font-bold border-0"
          fallbackStyle={{ backgroundColor: fallbackColor }}
          imageClassName="object-contain p-2"
        />

        <div className="border border-gray-300 px-2 py-1 text-xs font-mono font-extrabold uppercase text-gray-700 tracking-wide rounded-sm flex-shrink-0">
          {company.active_jobs_count}{" "}
          {company.active_jobs_count === 1 ? "OPEN JOB" : "OPEN JOBS"}
        </div>
      </div>

      {/* Middle: Info */}
      <div className="flex-grow">
        <h3
          className="font-bold text-gray-900 text-xl mb-1 truncate w-full"
          title={company.name}
        >
          {company.name}
        </h3>

        <p className="text-xs font-mono uppercase text-gray-500 tracking-wider mb-3 truncate">
          {company.category || "GENERAL"}
        </p>

        {company.website && (
          <a
            href={company.website}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline transition-colors truncate max-w-full"
          >
            <span className="truncate">
              {company.website.replace(/^https?:\/\//, "")}
            </span>
            <ExternalLink className="w-3 h-3 flex-shrink-0" />
          </a>
        )}
      </div>

      <hr className="border-gray-200 my-4" />

      {/* Bottom: Tech Stack */}
      <div className="mt-auto">
        <span className="text-xs font-mono font-bold text-gray-900 uppercase tracking-widest block mb-2">
          TECH STACK
        </span>

        <div className="flex flex-wrap gap-2">
          {visibleTech.length > 0 ? (
            <>
              {visibleTech.map((tech, i) => (
                <div
                  key={i}
                  className="border border-gray-300 px-2 py-1 text-xs font-mono text-gray-700 bg-white rounded-sm"
                >
                  {tech}
                </div>
              ))}
              {remainingTech > 0 && (
                <div className="border border-gray-300 px-2 py-1 text-xs font-mono text-gray-500 bg-gray-50 rounded-sm">
                  +{remainingTech}
                </div>
              )}
            </>
          ) : (
            <div className="text-xs font-mono text-gray-400 italic">
              Not specified
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
