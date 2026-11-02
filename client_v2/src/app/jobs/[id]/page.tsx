import React, { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Loader2 } from "lucide-react";

import Footer from "@/components/Footer";
import JobDetailsView from "@/components/job-details/JobDetailsView";
import { fetchJobById, fetchSimilarJobs } from "@/lib/api";
import { formatDate, formatExp } from "@/lib/utils";

interface JobPageProps {
  params: Promise<{ id: string }>;
}

export const dynamicParams = true;

// Pre-generate static params (empty array so pages are generated on demand via ISR)
export async function generateStaticParams() {
  return [];
}

// Job details revalidation every 1 hour (ISR)
export const revalidate = 3600;

export async function generateMetadata({
  params,
}: JobPageProps): Promise<Metadata> {
  const { id } = await params;
  if (!id) {
    return {
      title: "Job Not Found | ChakriLagbe",
    };
  }

  const job = await fetchJobById(id);

  if (!job) {
    return {
      title: "Job Not Found | ChakriLagbe",
    };
  }

  const companyName = job.company?.trim() || "Company";
  const jobTitle = job.title?.trim() || "Job Opening";
  const jobLocation = job.location?.trim() || "Bangladesh";
  const hasDeadline = Boolean(job.deadline && String(job.deadline).trim());
  const effectiveDeadline = hasDeadline ? job.expires_at || job.deadline : null;
  const deadlineStr = effectiveDeadline ? formatDate(effectiveDeadline) : null;

  const title = `${jobTitle} at ${companyName}`;
  const description = `${companyName} is hiring for ${jobTitle} in ${jobLocation}. Experience: ${formatExp(
    job.experience
  )}.${deadlineStr ? ` Deadline: ${deadlineStr}.` : ""} Apply on ChakriLagbe.`;

  return {
    title: `${title} | ChakriLagbe`,
    description,
    openGraph: {
      title: `${title} | ChakriLagbe`,
      description,
      type: "website",
      images: job.logo || job.logoUrl ? [{ url: job.logo || job.logoUrl }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ChakriLagbe`,
      description,
    },
  };
}

export default async function JobDetailPage({ params }: JobPageProps) {
  const { id } = await params;

  if (!id) {
    notFound();
  }

  const job = await fetchJobById(id);

  if (!job) {
    notFound();
  }

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

  // Expiration and deadline calculation
  const now = new Date();
  const hasDeadline = Boolean(job.deadline && String(job.deadline).trim());
  const effectiveDeadlineDate = hasDeadline
    ? job.expires_at || job.deadline
    : null;
  const expiryDate = effectiveDeadlineDate
    ? new Date(effectiveDeadlineDate)
    : null;
  const isValidExpiry = expiryDate ? !isNaN(expiryDate.getTime()) : false;

  const isExpired =
    hasDeadline && isValidExpiry && expiryDate
      ? expiryDate.getTime() < now.getTime()
      : false;
  const daysLeft =
    hasDeadline && isValidExpiry && expiryDate
      ? Math.ceil(
          (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        )
      : null;
  const isUrgent =
    hasDeadline && daysLeft !== null && daysLeft > 0 && daysLeft <= 3;
  const displayDeadline =
    hasDeadline && effectiveDeadlineDate
      ? formatDate(effectiveDeadlineDate)
      : "No Deadline Set";

  // Fetch similar jobs
  const similarJobs = await fetchSimilarJobs(job.category, job._id, 3);

  // Structured Data (JSON-LD) for Google Jobs SEO
  const salaryObj =
    typeof job.salary === "object" && job.salary !== null ? job.salary : null;
  const salaryMin = salaryObj?.min ?? job.salary_min;
  const salaryMax = salaryObj?.max ?? job.salary_max ?? salaryMin;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: jobTitle,
    description: job.intro || job.description || `${jobTitle} at ${companyName}`,
    datePosted: job.first_seen || new Date().toISOString(),
    validThrough:
      hasDeadline && isValidExpiry && expiryDate
        ? expiryDate.toISOString()
        : undefined,
    employmentType: jobType === "Remote" ? "FULL_TIME" : "FULL_TIME",
    hiringOrganization: {
      "@type": "Organization",
      name: companyName,
      logo: job.logo || job.logoUrl || undefined,
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: jobLocation,
        addressCountry: "BD",
      },
    },
    baseSalary: salaryMin
      ? {
          "@type": "MonetaryAmount",
          currency: salaryObj?.currency || "BDT",
          value: {
            "@type": "QuantitativeValue",
            minValue: salaryMin,
            maxValue: salaryMax,
            unitText: salaryObj?.period
              ? salaryObj.period.toUpperCase()
              : "MONTH",
          },
        }
      : undefined,
  };

  return (
    <>
      {/* Google Jobs Structured Data Script */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-gray-50/70 flex flex-col w-full">
        <Suspense
          fallback={
            <div className="w-full py-20 flex items-center justify-center">
              <Loader2 className="size-8 text-primary animate-spin" />
            </div>
          }
        >
          <JobDetailsView
            job={job}
            hasDeadline={hasDeadline}
            displayDeadline={displayDeadline}
            isExpired={isExpired}
            isUrgent={isUrgent}
            daysLeft={daysLeft}
            similarJobs={similarJobs}
          />
        </Suspense>

        <Footer />
      </div>
    </>
  );
}
