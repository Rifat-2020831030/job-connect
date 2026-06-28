"use client";

import JobFilters from "@/components/JobFilters";
import JobRow from "@/components/JobRow";
import JobSearchBar from "@/components/JobSearchBar";
import { Filter, X } from "lucide-react";
import { useState } from "react";

const DUMMY_JOBS = [
  {
    id: 1,
    title: "Senior Distributed Systems Engineer",
    company: "CyberSync",
    location: "New York, NY",
    level: "Senior",
    salary: "$180k – $240k",
    tags: ["Go", "Kubernetes", "gRPC", "Redis", "AWS", "Docker"],
    postedAt: "2 hours ago",
    experience: "5+ years",
    vacancy: "2",
    deadline: "Oct 15, 2026",
    logoUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/GitHub_Invertocat_Logo.svg/180px-GitHub_Invertocat_Logo.svg.png",
  },
  {
    id: 2,
    title: "Principal React Architect",
    company: "Vertex Cloud",
    location: "San Francisco, CA",
    level: "Principal",
    salary: "$210k – $300k",
    tags: ["React", "TypeScript", "Next.js", "Tailwind", "GraphQL"],
    postedAt: "5 hours ago",
    experience: "8+ years",
    vacancy: "1",
    logoUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/230px-React-icon.svg.png",
  },
  {
    id: 3,
    title: "Machine Learning Engineer, Core AI",
    company: "CloudStream AI",
    location: "Remote",
    level: "Mid-Level",
    salary: "$150k – $200k",
    tags: ["Python", "PyTorch", "AWS", "CUDA", "TensorFlow"],
    postedAt: "1 day ago",
    experience: "3+ years",
    deadline: "Nov 1, 2026",
    logoUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/PyTorch_logo_icon.svg/210px-PyTorch_logo_icon.svg.png",
  },
  {
    id: 4,
    title: "DevOps / SRE Lead",
    company: "Nexus Systems",
    location: "Austin, TX (Hybrid)",
    level: "Lead",
    salary: "$160k – $210k",
    tags: ["Terraform", "AWS", "Docker", "CI/CD", "Linux"],
    postedAt: "2 days ago",
    experience: "6+ years",
    vacancy: "3",
  },
  {
    id: 5,
    title: "Frontend Developer (UI/UX Focus)",
    company: "DataFlow",
    location: "Remote",
    level: "Junior",
    salary: "$90k – $120k",
    tags: ["Vue.js", "CSS", "Figma", "JavaScript"],
    postedAt: "3 days ago",
    experience: "1+ years",
    logoUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Vue.js_Logo_2.svg/180px-Vue.js_Logo_2.svg.png",
  },
];

export default function JobsPage() {
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header / Search Section */}
      <section className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 py-8 md:py-12 flex flex-col items-center">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground tracking-tight text-center mb-3 md:mb-4">
            Find your next opportunity
          </h1>
          <p className="text-sm md:text-base text-gray-600 text-center mb-6 md:mb-8 max-w-2xl px-4">
            Browse thousands of active jobs from top tech companies.
          </p>
          <div className="w-full max-w-4xl">
            <JobSearchBar />
          </div>
          <div className="mt-6 flex items-center justify-between w-full max-w-4xl text-xs md:text-sm px-2">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2 md:h-2.5 md:w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 md:h-2.5 md:w-2.5 bg-emerald-500"></span>
              </span>
              <span className="font-mono font-medium text-emerald-700 uppercase tracking-wide text-[10px] md:text-xs">
                1,248 Real-time jobs active
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 py-6 md:py-8">
        {/* Mobile Filter Toggle */}
        <div className="lg:hidden mb-4 flex justify-end">
          <button
            onClick={() => setShowMobileFilters(true)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-bold text-foreground hover:bg-gray-50 transition-colors"
          >
            <Filter className="size-4" />
            Filters
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 md:gap-8 relative">
          {/* Mobile Overlay Backdrop */}
          {showMobileFilters && (
            <div
              className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity"
              onClick={() => setShowMobileFilters(false)}
            />
          )}

          {/* Sidebar Filters */}
          <aside
            className={`fixed inset-y-0 left-0 z-50 w-[75vw] sm:w-80 bg-white transform transition-transform duration-300 ease-in-out lg:relative lg:transform-none lg:w-72 shrink-0 ${
              showMobileFilters
                ? "translate-x-0"
                : "-translate-x-full lg:translate-x-0"
            } overflow-y-auto lg:overflow-visible shadow-2xl lg:shadow-none`}
          >
            <div className="p-4 lg:p-0 min-h-screen lg:min-h-0 lg:sticky lg:top-24 z-10 lg:z-auto">
              <div className="flex items-center justify-between lg:hidden mb-4 pb-4 border-b border-gray-100">
                <span className="font-bold text-lg">Filters</span>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="p-2 cursor-pointer hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="size-5" />
                </button>
              </div>
              <JobFilters />
            </div>
          </aside>

          {/* Job Listings */}
          <main className="flex-1 flex flex-col min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
              <h2 className="text-lg md:text-xl font-bold text-foreground">
                Showing Results
              </h2>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="font-mono">Sort by:</span>
                <select className="border-none bg-transparent font-bold text-primary cursor-pointer outline-none hover:text-emerald-700">
                  <option>Most Recent</option>
                  <option>Most Relevant</option>
                  <option>Highest Salary</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              {DUMMY_JOBS.map((job) => (
                <JobRow
                  key={job.id}
                  title={job.title}
                  company={job.company}
                  location={job.location}
                  level={job.level}
                  salary={job.salary}
                  tags={job.tags}
                  postedAt={job.postedAt}
                  logoUrl={job.logoUrl}
                  url={`/jobs/${job.id}`}
                  experience={job.experience}
                  vacancy={job.vacancy}
                  deadline={job.deadline}
                />
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-8 md:mt-12 flex justify-center items-center gap-1 md:gap-2">
              <button
                className="size-8 md:size-10 flex items-center justify-center border border-gray-200 rounded-md hover:border-gray-300 hover:bg-gray-50 transition-colors text-gray-400 cursor-not-allowed"
                disabled
              >
                &larr;
              </button>
              <button className="size-8 md:size-10 flex items-center justify-center border border-primary bg-primary/10 text-primary font-bold rounded-md cursor-default">
                1
              </button>
              <button className="size-8 md:size-10 flex items-center justify-center border border-gray-200 rounded-md hover:border-gray-300 hover:bg-gray-50 transition-colors text-foreground font-medium cursor-pointer">
                2
              </button>
              <button className="size-8 md:size-10 flex items-center justify-center border border-gray-200 rounded-md hover:border-gray-300 hover:bg-gray-50 transition-colors text-foreground font-medium cursor-pointer hidden sm:flex">
                3
              </button>
              <span className="px-1 md:px-2 text-gray-400">...</span>
              <button className="size-8 md:size-10 flex items-center justify-center border border-gray-200 rounded-md hover:border-gray-300 hover:bg-gray-50 transition-colors text-foreground font-medium cursor-pointer">
                8
              </button>
              <button className="size-8 md:size-10 flex items-center justify-center border border-gray-200 rounded-md hover:border-gray-300 hover:bg-gray-50 transition-colors text-gray-600 cursor-pointer">
                &rarr;
              </button>
            </div>
          </main>
        </div>
      </section>
    </div>
  );
}
