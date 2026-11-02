import CompanyLogo from "@/components/CompanyLogo";
import JobActions from "@/components/JobActions";
import {
  formatExp,
  formatRelativeTime,
  formatSalary,
  formatVacancy,
} from "@/lib/utils";
import { JobDetail } from "@/types/job";
import {
  ArrowLeft,
  Banknote,
  Briefcase,
  Calendar,
  Check,
  Clock,
  GraduationCap,
  Layers,
  MapPin,
  Star,
  Users,
} from "lucide-react";
import Link from "next/link";

interface VariationProps {
  job: JobDetail;
  hasDeadline: boolean;
  displayDeadline: string;
  isExpired: boolean;
  isUrgent: boolean;
  daysLeft: number | null;
  similarJobs?: JobDetail[];
}

export default function JobDetailsView({
  job,
  hasDeadline,
  displayDeadline,
  isExpired,
  isUrgent,
  daysLeft,
  similarJobs = [],
}: VariationProps) {
  const companyName = job.company?.trim() || "Company";
  const jobTitle = job.title?.trim() || "Untitled Position";
  const jobLocation =
    job.location && !/^not\s*specified$/i.test(job.location.trim())
      ? job.location.trim()
      : "Location Unknown";
  const jobType =
    job.job_type && !/^not\s*specified$/i.test(job.job_type.trim())
      ? job.job_type.trim()
      : "Job Type Unspecified";
  const jobCategory = job.category?.trim() || "General";

  // Structured salary & experience data
  const salaryObj =
    typeof job.salary === "object" && job.salary !== null ? job.salary : null;
  const expObj =
    typeof job.experience === "object" && job.experience !== null
      ? job.experience
      : null;

  const displaySalary = formatSalary(
    job.salary,
    job.salary_min,
    job.salary_max
  );
  const displayExp = formatExp(job.experience);

  // Freshers allowed detection
  const isFreshersAllowed = Boolean(
    expObj?.is_freshers_allowed ||
      (typeof job.experience === "string" && /fresher/i.test(job.experience)) ||
      (expObj?.text_form && /fresher/i.test(expObj.text_form))
  );

  const displayVacancy = formatVacancy(job.vacancy);
  const postedTime = job.first_seen
    ? formatRelativeTime(job.first_seen)
    : "Recently";

  // Structured requirements
  const reqObj = job.requirements || null;
  const educationList = reqObj?.education || [];
  const requiredList = reqObj?.required || [];
  const preferredList = reqObj?.preferred || [];
  const responsibilities = job.responsibilities || [];
  const benefits = job.benefits || [];
  const skills = job.skills || [];

  return (
    <div className="w-full pb-28 sm:pb-32">
      {/* Expiry Banner */}
      {hasDeadline && isExpired ? (
        <div className="w-full bg-rose-50 border-b border-rose-200 py-3 px-4 text-rose-800 text-xs sm:text-sm font-medium text-center">
          <strong>Application Closed:</strong> This position expired on{" "}
          {displayDeadline}. Applications are no longer accepted.
        </div>
      ) : hasDeadline && isUrgent ? (
        <div className="w-full bg-amber-50 border-b border-amber-200 py-2.5 px-4 text-amber-900 text-xs sm:text-sm font-medium text-center flex items-center justify-center gap-2">
          <Clock className="size-4 text-amber-600 shrink-0" />
          <span>
            <strong>Closing Soon:</strong> Only {daysLeft}{" "}
            {daysLeft === 1 ? "day" : "days"} left to apply. Deadline:{" "}
            {displayDeadline}.
          </span>
        </div>
      ) : null}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 sm:pt-10">
        {/* Title Section (Starts directly from Title, no top company section) */}
        <header className="mb-8 sm:mb-10">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight break-words">
            {jobTitle}
          </h1>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3.5 text-xs sm:text-sm text-gray-600">
            {isExpired && (
              <span className="px-2.5 py-0.5 text-[11px] font-bold font-mono uppercase bg-gray-100 text-gray-600 rounded-full">
                Expired
              </span>
            )}
            <div className="flex items-center gap-1.5">
              <MapPin className="size-4 text-gray-400" />
              <span>{jobLocation}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Briefcase className="size-4 text-gray-400" />
              <span>{jobType}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="size-4 text-gray-400" />
              <span>Posted {postedTime}</span>
            </div>
            {isFreshersAllowed && (
              <span className="px-2.5 py-0.5 text-[11px] font-bold font-mono uppercase text-black border border-black bg-white rounded-full inline-flex items-center gap-1.5">
                <Check className="size-3 text-blue-600 stroke-[2.5]" />
                <span>Freshers Allowed</span>
              </span>
            )}
          </div>
        </header>

        {/* 2-Column Split Layout (Sidebar first on mobile, column 2 on desktop) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start mb-16">
          {/* Main Body (Desktop Left 2/3, Mobile 2nd Order) */}
          <div className="order-2 lg:order-1 lg:col-span-2 flex flex-col gap-8 min-w-0">
            {/* Role Introduction (No Icon Beside Heading) */}
            {job.intro ? (
              <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8">
                <h2 className="text-lg font-bold text-foreground mb-3">
                  About the Role
                </h2>
                <p className="text-base text-gray-700 leading-relaxed whitespace-pre-line">
                  {job.intro}
                </p>
              </div>
            ) : (
              job.description && (
                <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8">
                  <h2 className="text-lg font-bold text-foreground mb-3">
                    Role Overview
                  </h2>
                  <div className="text-base text-gray-700 leading-relaxed whitespace-pre-line">
                    {job.description}
                  </div>
                </div>
              )
            )}

            {/* Key Responsibilities */}
            {responsibilities.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8">
                <h2 className="text-lg font-bold text-foreground mb-4">
                  Key Responsibilities
                </h2>
                <ul className="flex flex-col gap-3">
                  {responsibilities.map((item, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-3 text-sm sm:text-base text-gray-700"
                    >
                      <span className="size-5 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="size-3 stroke-[3]" />
                      </span>
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Structured Requirements Matrix */}
            {(educationList.length > 0 ||
              requiredList.length > 0 ||
              preferredList.length > 0) && (
              <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 flex flex-col gap-6">
                <h2 className="text-lg font-bold text-foreground">
                  Qualifications & Requirements
                </h2>

                {/* Education */}
                {educationList.length > 0 && (
                  <div className="p-4 bg-blue-50/60 border border-blue-100 rounded-xl">
                    <div className="flex items-center gap-2 text-xs font-bold font-mono uppercase text-blue-900 tracking-wider mb-2">
                      <GraduationCap className="size-4 text-blue-600" />
                      <span>Educational Background</span>
                    </div>
                    <ul className="flex flex-col gap-1.5">
                      {educationList.map((edu, idx) => (
                        <li
                          key={idx}
                          className="text-sm text-blue-950 font-medium"
                        >
                          • {edu}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Mandatory / Required */}
                {requiredList.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-gray-900 mb-3 flex items-center gap-2">
                      <span className="size-2 rounded-full bg-emerald-600"></span>
                      <span>Required Skills & Experience</span>
                    </h3>
                    <ul className="flex flex-col gap-2.5">
                      {requiredList.map((req, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2.5 text-sm sm:text-base text-gray-700"
                        >
                          <span className="text-emerald-600 font-bold mt-0.5">
                            •
                          </span>
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Preferred / Nice-to-have */}
                {preferredList.length > 0 && (
                  <div className="pt-4 border-t border-gray-100">
                    <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-gray-700 mb-3 flex items-center gap-2">
                      <Star className="size-4 text-amber-500 fill-amber-500" />
                      <span>Preferred / Bonus Qualifications</span>
                    </h3>
                    <ul className="flex flex-col gap-2.5">
                      {preferredList.map((pref, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2.5 text-sm sm:text-base text-gray-600"
                        >
                          <span className="text-amber-500 font-bold mt-0.5">
                            •
                          </span>
                          <span>{pref}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Skills & Primary Tech Tags */}
            {skills.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8">
                <h2 className="text-lg font-bold text-foreground mb-4">
                  Technologies & Tooling
                </h2>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 text-xs sm:text-sm font-mono border border-gray-200 bg-gray-50 text-gray-800 uppercase tracking-wide rounded-lg"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Benefits & Perks */}
            {benefits.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8">
                <h2 className="text-lg font-bold text-foreground mb-4">
                  Compensation & Benefits
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {benefits.map((benefit, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 bg-gray-50/70 border border-gray-100 rounded-xl flex items-start gap-3"
                    >
                      <Check className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700 leading-snug">
                        {benefit}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Ready to Apply Card */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xs">
              <div>
                <h3 className="text-xl font-bold text-foreground">
                  Ready to apply?
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {hasDeadline
                    ? `Applications close on ${displayDeadline}.`
                    : "Direct application through official company portal."}
                </p>
              </div>
              <JobActions job={job} isExpired={isExpired} variant="header" />
            </div>
          </div>

          {/* Sticky Sidebar (Desktop Right 1/3, Mobile 1st Order directly after title) */}
          <div className="order-1 lg:order-2 lg:col-span-1 flex flex-col gap-6 lg:sticky lg:top-24">
            {/* Job Overview Card */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-2xs">
              <h3 className="text-base font-bold text-foreground mb-5 pb-3 border-b border-gray-100">
                Job Overview
              </h3>

              <div className="flex flex-col gap-4 text-sm">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-gray-500 flex items-center gap-1.5">
                    <Banknote className="size-4 text-gray-400" />
                    <span>Salary</span>
                  </span>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">
                      {displaySalary}
                    </div>
                    {salaryObj?.is_negotiable && (
                      <span className="text-[10px] uppercase font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        Negotiable
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-start justify-between gap-2">
                  <span className="text-gray-500 flex items-center gap-1.5">
                    <Briefcase className="size-4 text-gray-400" />
                    <span>Experience</span>
                  </span>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">
                      {displayExp}
                    </div>
                  </div>
                </div>

                <div className="flex items-start justify-between gap-2">
                  <span className="text-gray-500 flex items-center gap-1.5">
                    <Users className="size-4 text-gray-400" />
                    <span>Vacancy</span>
                  </span>
                  <span className="font-semibold text-gray-900">
                    {displayVacancy}
                  </span>
                </div>

                <div className="flex items-start justify-between gap-2">
                  <span className="text-gray-500 flex items-center gap-1.5">
                    <Calendar className="size-4 text-gray-400" />
                    <span>Deadline</span>
                  </span>
                  <span className="font-semibold text-gray-900">
                    {displayDeadline}
                  </span>
                </div>

                <div className="flex items-start justify-between gap-2">
                  <span className="text-gray-500 flex items-center gap-1.5">
                    <Layers className="size-4 text-gray-400" />
                    <span>Category</span>
                  </span>
                  <span className="font-mono text-xs uppercase font-semibold text-gray-900">
                    {jobCategory}
                  </span>
                </div>
              </div>
            </div>

            {/* Company Profile Card (No Industry) */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-2xs">
              <div className="flex items-center gap-3.5 mb-4">
                <CompanyLogo
                  logo={job.logo || job.logoUrl}
                  companyName={companyName}
                  className="size-12 border border-gray-200 rounded-xl bg-white shrink-0"
                  fallbackClassName="bg-primary/10 text-primary font-bold text-lg rounded-xl"
                />
                <div className="min-w-0">
                  <h4 className="font-bold text-foreground text-base truncate">
                    {companyName}
                  </h4>
                  <span className="text-xs text-emerald-700 font-mono font-medium">
                    Official Hiring Channel
                  </span>
                </div>
              </div>

              <Link
                href={`/jobs?company=${encodeURIComponent(companyName)}`}
                className="text-xs font-semibold text-primary hover:text-emerald-700 flex items-center justify-between p-2.5 rounded-lg hover:bg-primary/5 transition-colors"
              >
                <span>View all jobs at {companyName}</span>
                <ArrowLeft className="size-3.5 rotate-180" />
              </Link>
            </div>
          </div>
        </div>

        {/* Similar Jobs Section with Black Hovering Effect */}
        {similarJobs && similarJobs.length > 0 && (
          <div className="border-t border-gray-200/80 pt-10 sm:pt-12 mb-12">
            <div className="flex items-end justify-between gap-4 mb-6">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-foreground">
                  Similar Opportunities
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  Explore related open positions in{" "}
                  <span className="font-semibold text-gray-700 capitalize">
                    {jobCategory}
                  </span>
                </p>
              </div>
              <Link
                href={`/jobs?category=${encodeURIComponent(jobCategory)}`}
                className="text-xs sm:text-sm font-semibold text-gray-900 hover:text-black inline-flex items-center gap-1 transition-colors shrink-0"
              >
                <span>View all {jobCategory}</span>
                <ArrowLeft className="size-3.5 rotate-180" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {similarJobs.map((simJob, idx) => {
                const simComp = simJob.company?.trim() || "Company";
                const simTitle = simJob.title?.trim() || "Job Opening";
                const simLoc =
                  simJob.location && !/^not\s*specified$/i.test(simJob.location.trim())
                    ? simJob.location.trim()
                    : "Location Unknown";
                const simSalary = formatSalary(
                  simJob.salary,
                  simJob.salary_min,
                  simJob.salary_max
                );
                const simExp = formatExp(simJob.experience);
                const simSkills = simJob.skills?.slice(0, 3) || [];

                return (
                  <Link
                    key={simJob._id || idx}
                    href={`/jobs/${simJob._id}`}
                    className="group bg-white border border-gray-200 hover:border-black rounded-2xl p-5 shadow-xs hover:shadow-xl hover:shadow-black/10 transition-all duration-200 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start gap-3 mb-3">
                        <CompanyLogo
                          logo={simJob.logo || simJob.logoUrl}
                          companyName={simComp}
                          className="size-11 border border-gray-200 rounded-xl bg-white shadow-2xs shrink-0"
                          fallbackClassName="bg-primary/10 text-primary font-bold text-sm rounded-xl"
                          imageClassName="object-contain p-1.5"
                        />
                        <div className="min-w-0">
                          <span className="text-xs font-mono font-bold text-emerald-700 uppercase tracking-wide truncate block">
                            {simComp}
                          </span>
                          <h4 className="text-sm sm:text-base font-bold text-foreground group-hover:text-black transition-colors line-clamp-1 mt-0.5">
                            {simTitle}
                          </h4>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mb-3">
                        <span className="flex items-center gap-1">
                          <MapPin className="size-3 text-gray-400" />
                          <span className="truncate max-w-[120px]">
                            {simLoc}
                          </span>
                        </span>
                        <span>•</span>
                        <span>{simExp}</span>
                      </div>

                      {simSkills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {simSkills.map((sk, sIdx) => (
                            <span
                              key={sIdx}
                              className="px-2 py-0.5 text-[11px] font-mono border border-gray-100 bg-gray-50 text-gray-600 rounded"
                            >
                              {sk}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                      <span className="font-semibold text-gray-900">
                        {simSalary}
                      </span>
                      <span className="font-semibold text-gray-900 group-hover:text-black group-hover:translate-x-0.5 transition-all inline-flex items-center gap-0.5">
                        View Opening →
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Floating Bottom Dock (Visible on Mobile & Desktop) */}
      <aside
        aria-label="Quick application dock"
        className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 w-[94%] sm:w-[90%] max-w-2xl"
      >
        <div className="bg-gray-900/95 text-white backdrop-blur-md px-3.5 py-2.5 sm:px-5 sm:py-3.5 rounded-2xl shadow-2xl border border-white/10 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[10px] sm:text-xs text-gray-400 font-mono uppercase truncate">
              {companyName}
            </div>
            <div className="text-xs sm:text-sm font-bold text-white truncate">
              {jobTitle}
            </div>
          </div>
          <div className="shrink-0 flex items-center gap-2 sm:gap-3">
            <span className="hidden md:inline font-mono text-xs text-emerald-400 font-bold">
              {displaySalary}
            </span>
            <JobActions job={job} isExpired={isExpired} variant="compact" />
          </div>
        </div>
      </aside>
    </div>
  );
}
