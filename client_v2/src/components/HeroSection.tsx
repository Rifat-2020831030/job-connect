import React from 'react';

export default function HeroSection() {
  return (
    <section className="flex flex-col items-center justify-center pt-24 pb-16 px-6 md:px-12 w-full max-w-7xl mx-auto">
      <div className="bg-primary/10 border border-primary/30 flex gap-2 items-center px-4 py-1.5 rounded-full mb-8">
        <div className="size-2 bg-primary rounded-full animate-pulse"></div>
        <span className="font-mono text-primary text-xs md:text-sm font-semibold tracking-wider uppercase">
          1,402 NEW ROLES ADDED TODAY
        </span>
      </div>
      
      <h1 className="text-4xl md:text-6xl font-bold text-foreground text-center tracking-tight mb-6 max-w-4xl">
        Find Your Next <span className="text-primary italic">Destination.</span>
      </h1>
      
      <p className="text-lg md:text-xl text-gray-600 text-center max-w-2xl mb-10 leading-relaxed">
        A one-stop platform to get all the latest job updates from leading companies and startups.
      </p>
      
      <div className="flex flex-col w-full max-w-md gap-4 mb-12">
        <div className="flex flex-col sm:flex-row bg-white border border-gray-300 rounded-lg p-1.5 shadow-sm">
          <input 
            type="email" 
            placeholder="Enter your email address" 
            className="flex-1 px-4 py-3 outline-none text-gray-700 bg-transparent"
          />
          <button className="bg-primary hover:bg-emerald-600 text-white font-bold px-8 py-3 rounded text-sm sm:text-base transition-colors mt-2 sm:mt-0">
            Get Job Alerts
          </button>
        </div>
        <p className="text-sm text-gray-500 text-center">
          Receive job updates the same day they're posted. No spam, ever.
        </p>
      </div>

      {/* Stats Section */}
      <div className="flex items-center justify-center gap-8 md:gap-16 pt-8 border-t border-gray-200 w-full max-w-2xl">
        <div className="flex flex-col items-center gap-1">
          <span className="text-2xl md:text-3xl font-bold text-foreground">2,500+</span>
          <span className="text-meta text-center">Active Jobs</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-2xl md:text-3xl font-bold text-foreground">850+</span>
          <span className="text-meta text-center">Companies</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-2xl md:text-3xl font-bold text-foreground">15k+</span>
          <span className="text-meta text-center">Subscribers</span>
        </div>
      </div>
    </section>
  );
}
