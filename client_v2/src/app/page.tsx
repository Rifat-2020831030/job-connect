import CategoryCard from "@/components/CategoryCard";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import JobCard from "@/components/JobCard";
import EngineeringJobRow from "@/components/JobRow";
import SectionHeader from "@/components/SectionHeader";

export default function Home() {
  const featuredJobs = [
    {
      title: "Senior Backend Engineer",
      company: "ByteScale",
      location: "Remote (US)",
      level: "SENIOR (L5)",
      description: "Direct paths to elite roles. No gatekeepers, just code.",
      salary: "$160k - $220k",
      vacancy: "2",
      experience: "5+ years",
      deadline: "Oct 15, 2026",
      postedAt: "2D AGO",
      tags: ["C++", "Rust", "Distributed Systems"],
    },
    {
      title: "Data Scientist, ML",
      company: "DataCorp",
      location: "San Francisco, CA",
      level: "SENIOR (L5)",
      description: "Direct paths to elite roles. No gatekeepers, just code.",
      salary: "$150k - $200k",
      vacancy: "1",
      experience: "3+ years",
      postedAt: "5H AGO",
      tags: ["Python", "PyTorch", "Machine Learning"],
    },
    {
      title: "Frontend Architect",
      company: "UI Dynamics",
      location: "Remote",
      level: "STAFF (L6)",
      description: "Direct paths to elite roles. No gatekeepers, just code.",
      salary: "$180k - $240k",
      vacancy: "1",
      experience: "8+ years",
      deadline: "Oct 20, 2026",
      postedAt: "1D AGO",
      tags: ["React", "TypeScript", "WebGL"],
    },
  ];

  const engineeringJobs = [
    {
      title: "Staff Cloud Engineer",
      company: "Sigma Cloud",
      location: "San Francisco, CA",
      level: "STAFF (L6)",
      salary: "$190k - $250k",
      postedAt: "TODAY",
      tags: ["Go", "Kubernetes", "AWS"],
    },
    {
      title: "Senior Frontend Developer",
      company: "Prisma Design",
      location: "Remote",
      level: "SENIOR (L5)",
      salary: "$155k - $185k",
      postedAt: "1D AGO",
      tags: ["React", "Next.js", "TypeScript"],
    },
    {
      title: "Site Reliability Engineer",
      company: "CloudZero",
      location: "Remote",
      level: "SENIOR (L4)",
      salary: "$140k - $170k",
      postedAt: "3D AGO",
      tags: ["Terraform", "Python", "Linux"],
    },
    {
      title: "Distributed Systems Architect",
      company: "HyperScale",
      location: "New York, NY",
      level: "PRINCIPAL",
      salary: "$220k - $280k",
      postedAt: "4D AGO",
      tags: ["Rust", "gRPC", "Kafka"],
    },
  ];

  const leadershipJobs = [
    {
      title: "Engineering Manager",
      company: "Streamflow",
      location: "Remote (EU)",
      level: "MANAGER (L5)",
      description: "Leading platform teams.",
      salary: "$170k - $210k",
      vacancy: "1",
      experience: "5+ years",
      postedAt: "3D AGO",
      tags: ["Management", "Agile", "System Design"],
    },
    {
      title: "Staff Product Manager",
      company: "Vertex Fintech",
      location: "Hybrid / NY",
      level: "STAFF",
      description: "Driving fintech product initiatives.",
      salary: "$190k - $230k",
      vacancy: "1",
      experience: "7+ years",
      postedAt: "1W AGO",
      tags: ["Product", "Fintech", "Strategy"],
    },
    {
      title: "Senior Data Analyst",
      company: "Metascale",
      location: "San Francisco",
      level: "SENIOR",
      description: "Data-driven insights and analytics.",
      salary: "$140k - $180k",
      vacancy: "2",
      experience: "4+ years",
      postedAt: "2D AGO",
      tags: ["SQL", "Tableau", "Analytics"],
    },
  ];

  const categories = [
    { title: "Frontend", icon: "💻", count: 432 },
    { title: "Backend", icon: "⚙️", count: 512 },
    { title: "Data Science", icon: "📊", count: 284 },
    { title: "DevOps", icon: "☁️", count: 198 },
    { title: "Product Management", icon: "📱", count: 145 },
    { title: "Design", icon: "🎨", count: 215 },
    { title: "Mobile", icon: "📱", count: 189 },
    { title: "Security", icon: "🔒", count: 76 },
  ];

  return (
    <div className="flex flex-col w-full">
      <HeroSection />

      <main className="flex flex-col w-full max-w-7xl mx-auto px-6 md:px-12 py-16 gap-24">
        {/* Featured Opportunities Section */}
        <section className="flex flex-col w-full">
          <SectionHeader
            title="Featured Opportunities"
            subtitle="Direct paths to elite roles. No gatekeepers, just code."
            viewAllLink="/jobs"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredJobs.map((job, index) => (
              <JobCard key={index} {...job} />
            ))}
          </div>
        </section>

        {/* Core Engineering Section (Linear Style Minimalist Table Rows) */}
        <section className="flex flex-col w-full">
          <SectionHeader
            title="Core Engineering"
            subtitle="High-traffic systems and frontend excellence."
            viewAllLink="/jobs/engineering"
          />
          <div className="flex flex-col gap-3">
            {engineeringJobs.map((job, index) => (
              <EngineeringJobRow key={index} {...job} />
            ))}
          </div>
        </section>

        {/* Leadership & Management Section */}
        <section className="flex flex-col w-full">
          <SectionHeader
            title="Leadership & Management"
            subtitle="Guide teams to success and drive product vision."
            viewAllLink="/jobs/leadership"
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {leadershipJobs.map((job, index) => (
              <JobCard key={index} {...job} />
            ))}
          </div>
        </section>

        {/* Explore by Category Section */}
        <section className="flex flex-col w-full">
          <SectionHeader
            title="Explore by Category"
            subtitle="Find roles that match your specific expertise."
            viewAllLink="/categories"
          />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <CategoryCard key={index} {...category} />
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
