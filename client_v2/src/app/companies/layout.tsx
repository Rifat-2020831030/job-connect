import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tech Companies Hiring in Bangladesh",
  description:
    "Explore top software companies, startups, and tech employers actively hiring developers, engineers, and digital talent in Bangladesh.",
  alternates: {
    canonical: "/companies",
  },
  openGraph: {
    title: "Tech Companies Hiring in Bangladesh | Chakrilagbe",
    description:
      "Explore top software companies, startups, and tech employers actively hiring developers, engineers, and digital talent in Bangladesh.",
    url: "/companies",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tech Companies Hiring in Bangladesh | Chakrilagbe",
    description:
      "Explore top software companies, startups, and tech employers actively hiring developers, engineers, and digital talent in Bangladesh.",
  },
};

export default function CompaniesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
