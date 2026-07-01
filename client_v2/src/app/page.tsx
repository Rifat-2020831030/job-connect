import Footer from "@/components/Footer";
import HomeClient from "@/components/HomeClient";
import { fetchCategories, fetchFeaturedJobs, fetchSiteStats } from "@/lib/api";

export const revalidate = 3600;

export default async function Home() {
  const [featuredJobs, engineeringJobs, leadershipJobs, categories, siteStats] = await Promise.all([
    fetchFeaturedJobs("featured"),
    fetchFeaturedJobs("engineering"),
    fetchFeaturedJobs("leadership"),
    fetchCategories(),
    fetchSiteStats(),
  ]);

  return (
    <div className="flex flex-col w-full">
      <HomeClient 
        featuredJobs={featuredJobs} 
        engineeringJobs={engineeringJobs} 
        leadershipJobs={leadershipJobs} 
        categories={categories} 
        siteStats={siteStats}
      />
      <Footer />
    </div>
  );
}
