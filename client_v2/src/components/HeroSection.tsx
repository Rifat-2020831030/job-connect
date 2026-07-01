import SubscribeForm from "./SubscribeForm";

interface SiteStats {
  newRolesAdded: number;
  totalJobs: number;
  totalCompanies: number;
  subscribersCount: number;
}

export default function HeroSection({ siteStats }: { siteStats: SiteStats }) {
  // Use default values if siteStats is not available
  const newRoles = siteStats?.newRolesAdded || 0;
  const activeJobs = siteStats?.totalJobs || 0;
  const companies = siteStats?.totalCompanies || 0;
  const subscribers = siteStats?.subscribersCount || 0;

  return (
    <section className="flex flex-col items-center justify-center pt-24 pb-16 px-6 md:px-12 w-full max-w-7xl mx-auto">
      <div className="bg-primary/10 border border-primary/30 flex gap-2 items-center px-4 py-1.5 rounded-full mb-8">
        <div className="size-2 bg-primary rounded-full animate-pulse"></div>
        <span className="font-mono text-primary text-xs md:text-sm font-semibold tracking-wider uppercase">
          {newRoles.toLocaleString()} NEW ROLES ADDED THIS WEEK
        </span>
      </div>

      <h1 className="text-4xl md:text-6xl font-bold text-foreground text-center tracking-tight mb-6 max-w-4xl">
        Find Your Next <span className="text-primary italic">Destination.</span>
      </h1>

      <p className="text-lg md:text-xl text-gray-600 text-center max-w-2xl mb-10 leading-relaxed">
        A one-stop platform to get all the latest job updates from leading
        companies and startups.
      </p>

      <div className="flex flex-col w-full max-w-md gap-4 mb-12 relative z-10">
        <SubscribeForm />
        <p className="text-sm text-gray-500 text-center">
          Receive job updates the same day they're posted. No spam, ever.
        </p>
      </div>

      {/* Stats Section */}
      <div className="flex items-center justify-center gap-8 md:gap-16 pt-8 border-t border-gray-200 w-full max-w-2xl">
        <div className="flex flex-col items-center gap-1">
          <span className="text-2xl md:text-3xl font-bold text-foreground">
            {activeJobs.toLocaleString()}+
          </span>
          <span className="text-meta text-center">Total Jobs</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-2xl md:text-3xl font-bold text-foreground">
            {companies.toLocaleString()}+
          </span>
          <span className="text-meta text-center">Companies</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-2xl md:text-3xl font-bold text-foreground">
            {subscribers.toLocaleString()}+
          </span>
          <span className="text-meta text-center">Subscribers</span>
        </div>
      </div>
    </section>
  );
}
