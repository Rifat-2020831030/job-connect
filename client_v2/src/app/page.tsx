import Footer from "@/components/Footer";
import HomeClient from "@/components/HomeClient";
import { fetchCategories, fetchFeaturedJobs } from "@/lib/api";

export const revalidate = 3600;

export default async function Home() {
  const [featuredJobs, engineeringJobs, leadershipJobs, categories] = await Promise.all([
    fetchFeaturedJobs("featured"),
    fetchFeaturedJobs("engineering"),
    fetchFeaturedJobs("leadership"),
    fetchCategories(),
  ]);

  return (
    <div className="flex flex-col w-full">
      <HomeClient 
        featuredJobs={featuredJobs} 
        engineeringJobs={engineeringJobs} 
        leadershipJobs={leadershipJobs} 
        categories={categories} 
      />
      <Footer />
    </div>
  );
}
