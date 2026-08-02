import SectionHeader from "@/components/SectionHeader";

export default function Loading() {
  return (
    <div className="flex flex-col w-full">
      {/* Skeleton Hero Section */}
      <section className="w-full bg-slate-50 border-b border-gray-100 py-24 md:py-32 relative overflow-hidden flex flex-col items-center justify-center">
        <div className="flex flex-col items-center max-w-4xl mx-auto px-6 z-10 text-center gap-6">
          <div className="h-10 w-3/4 md:w-1/2 bg-gray-200 animate-pulse rounded-md"></div>
          <div className="h-6 w-full md:w-2/3 bg-gray-200 animate-pulse rounded-md mt-4"></div>
          <div className="flex gap-4 mt-8">
            <div className="h-12 w-40 bg-gray-200 animate-pulse rounded-lg"></div>
            <div className="h-12 w-40 bg-gray-200 animate-pulse rounded-lg"></div>
          </div>
        </div>
      </section>

      <main className="flex flex-col w-full max-w-7xl mx-auto px-6 md:px-12 py-16 gap-24 relative">
        {/* Skeleton Featured Opportunities */}
        <section className="flex flex-col w-full">
          <SectionHeader
            title="Featured Opportunities"
            subtitle="Direct paths to elite roles. No gatekeepers, just code."
            viewAllLink="/jobs"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-64 bg-gray-100 animate-pulse rounded-xl border border-gray-200 p-6 flex flex-col"
              >
                <div className="h-6 w-1/2 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 w-1/3 bg-gray-200 rounded mb-6"></div>
                <div className="h-16 w-full bg-gray-200 rounded mb-auto"></div>
                <div className="flex justify-between mt-6">
                  <div className="h-8 w-24 bg-gray-200 rounded-full"></div>
                  <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Skeleton Core Engineering */}
        <section className="flex flex-col w-full">
          <SectionHeader
            title="Core Engineering"
            subtitle="High-traffic systems and frontend excellence."
            viewAllLink="/jobs?category=web,devops,mobile,security,ai/ml"
          />
          <div className="flex flex-col gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-24 bg-gray-100 animate-pulse rounded-lg border border-gray-200 flex items-center p-6 gap-4"
              >
                <div className="h-12 w-12 bg-gray-200 rounded-lg"></div>
                <div className="flex flex-col gap-2 flex-grow">
                  <div className="h-5 w-1/3 bg-gray-200 rounded"></div>
                  <div className="h-4 w-1/4 bg-gray-200 rounded"></div>
                </div>
                <div className="h-8 w-24 bg-gray-200 rounded-full hidden md:block"></div>
              </div>
            ))}
          </div>
        </section>

        {/* Skeleton Leadership */}
        <section className="flex flex-col w-full">
          <SectionHeader
            title="Leadership & Management"
            subtitle="Guide teams to success and drive product vision."
            viewAllLink="/jobs?category=PM"
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-64 bg-gray-100 animate-pulse rounded-xl border border-gray-200 p-6 flex flex-col"
              >
                <div className="h-6 w-1/2 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 w-1/3 bg-gray-200 rounded mb-6"></div>
                <div className="flex justify-between mt-auto">
                  <div className="h-8 w-24 bg-gray-200 rounded-full"></div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
