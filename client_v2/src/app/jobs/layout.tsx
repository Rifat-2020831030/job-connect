import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Browse tech jobs in bd",
  description:
    "Search and apply for active software engineering, developer, AI/ML, DevOps, and tech jobs across top companies in Bangladesh.",
  alternates: {
    canonical: "/jobs",
  },
  openGraph: {
    title: "Browse tech jobs in bd | Chakrilagbe",
    description:
      "Search and apply for active software engineering, developer, AI/ML, DevOps, and tech jobs across top companies in Bangladesh.",
    url: "/jobs",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Browse tech jobs in bd | Chakrilagbe",
    description:
      "Search and apply for active software engineering, developer, AI/ML, DevOps, and tech jobs across top companies in Bangladesh.",
  },
};

export default function JobsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
