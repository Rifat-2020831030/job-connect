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
      title: "Job Not Found",
    };
  }

  const job = await fetchJobById(id);

  if (!job) {
    return {
      title: "Job Not Found",
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
    title,
    description,
    alternates: {
      canonical: `/jobs/${id}`,
    },
    openGraph: {
      title: `${title} | Chakrilagbe`,
      description,
      type: "website",
      images: job.logo || job.logoUrl ? [{ url: job.logo || job.logoUrl }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | Chakrilagbe`,
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

  return (
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
  );
}
