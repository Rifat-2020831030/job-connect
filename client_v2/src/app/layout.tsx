import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import UtmTracker from "@/components/UtmTracker";
import RootJsonLd from "@/components/seo/JsonLd";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/react";
import { SavedJobsProvider } from "@/lib/SavedJobsContext";
import { TrackingProvider } from "@/contexts/TrackingContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

const baseUrl =
  process.env.NEXT_PUBLIC_APP_URL || "https://chakrilagbe.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "ChakriLagbe | AI powered job board | Tech Jobs in BD",
    template: "%s | chakrilagbe",
  },
  description:
    "Explore and get notified about verified tech jobs in Bangladesh under one platform.",
  keywords: [
    "tech jobs in bangladesh",
    "software engineer jobs dhaka",
    "chakri lagbe",
    "it jobs bangladesh",
    "frontend developer jobs",
    "backend developer jobs",
    "full stack developer",
    "devops engineer bangladesh",
    "ai ml jobs dhaka",
    "junior software engineer jobs",
    "junior developer jobs bangladesh",
  ],
  authors: [{ name: "ChakriLagbe", url: baseUrl }],
  creator: "ChakriLagbe",
  publisher: "ChakriLagbe",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "./",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: baseUrl,
    siteName: "ChakriLagbe",
    title: "ChakriLagbe | AI powered job board | Tech Jobs in BD",
    description:
      "Explore and get notified about verified tech jobs in Bangladesh under one platform.",
  },
  twitter: {
    card: "summary_large_image",
    title: "ChakriLagbe | AI powered job board | Tech Jobs in BD",
    description:
      "Explore and get notified about verified tech jobs in Bangladesh under one platform.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "IT8neFOSAcU25m1x0vK8_kpUm-3oUDY9uTBRSZx_Qqo",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <RootJsonLd baseUrl={baseUrl} />
      </head>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased font-sans bg-gray-50 text-gray-900 flex flex-col min-h-screen`}
      >
        <SavedJobsProvider>
          <TrackingProvider>
            <UtmTracker />
            <Toaster position="top-center" richColors />
            <Navbar />
            {children}
            <Analytics />
          </TrackingProvider>
        </SavedJobsProvider>
      </body>
    </html>
  );
}
