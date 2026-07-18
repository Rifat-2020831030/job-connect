import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About | ChakriLagbe",
  description: "The story behind ChakriLagbe",
};

export default function AboutPage() {
  return (
    <main className="flex-grow flex flex-col items-center justify-center py-16 px-6 sm:px-12 lg:px-24">
      <div className="max-w-3xl w-full space-y-8 bg-white/70 backdrop-blur-md p-8 sm:p-12 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100/50 relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl -ml-32 -mb-32 pointer-events-none"></div>

        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 relative z-10">
          Behind ChakriLagbe
        </h1>

        <div className="space-y-6 text-lg text-gray-600 leading-relaxed relative z-10">
          <p>
            We know firsthand how exhausting the job search can be. We&apos;ve
            been there—scouring endless job boards, hitting dead ends, and
            experiencing the frustrating inefficiencies that make the entire
            process feel like a full-time job in itself. For too long, finding a
            job has been a time-consuming and deeply unproductive cycle.
          </p>

          <p>
            One of the biggest hurdles? The constant, tedious need to tweak and
            modify your CV for every single application. Instead of spending
            your valuable time preparing for interviews or honing your skills,
            you&apos;re stuck in an endless loop of formatting documents and
            filling out repetitive forms.
          </p>

          <p className="font-medium text-gray-900">
            We realized the system was broken, and it needed a complete
            overhaul.
          </p>

          <p>
            That&apos;s why we built this platform. We set out to create the
            centralized solution we wished we had—a single, unified space that
            seamlessly handles everything from discovering the perfect role to
            submitting your application.
          </p>

          {/* <p>
            Our mission is to eliminate the friction from the job hunt. We want to empower you by taking the busywork out of the process, providing a smooth, intuitive workflow so you can focus on what truly matters: showcasing your potential and landing the job you deserve.
          </p> */}
        </div>
      </div>
    </main>
  );
}
