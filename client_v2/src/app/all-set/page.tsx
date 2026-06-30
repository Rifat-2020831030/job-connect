"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function AllSetContent() {
  const searchParams = useSearchParams();
  
  // Read state passed from preferences
  const categoriesParam = searchParams.get("categories");
  const modelParam = searchParams.get("model");
  const frequencyParam = searchParams.get("frequency");
  
  const categories = categoriesParam ? categoriesParam.split(",") : ["web", "devops"];
  const models = modelParam ? modelParam.split(",") : ["Remote", "Hybrid"];
  const frequency = frequencyParam ? [frequencyParam] : ["Morning"];
  
  const tags = [...categories, ...models, ...frequency];
  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="card w-full max-w-[576px] p-8 md:p-12 flex flex-col gap-8 items-center text-center shadow-lg shadow-black/5 relative overflow-hidden">
        
        {/* Decorative pulse circles */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10">
          <div className="size-[200%] bg-primary/5 blur-3xl rounded-full" />
        </div>

        {/* Success Icon */}
        <div className="size-24 md:size-32 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/30 text-white">
          <svg className="w-12 h-12 md:w-16 md:h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
        </div>

        {/* Header */}
        <div className="flex flex-col gap-4 mt-2">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">You're all set!</h1>
          <p className="text-gray-600 text-lg max-w-[448px]">
            Your personalized job alerts are now active. We'll notify you as soon as matching roles are posted.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full py-6">
          <Link href="/saved-jobs" className="w-full sm:w-48 btn-primary py-3 text-base flex items-center justify-center gap-2">
            Go to Dashboard
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
          </Link>
          <Link href="/" className="w-full sm:w-48 py-3 text-base rounded-lg border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors flex items-center justify-center">
            Back to Home
          </Link>
        </div>

        {/* Secondary Confirmation Detail */}
        <div className="w-full bg-gray-50 rounded-xl border border-gray-100 p-6 flex flex-col gap-4 mt-2">
          <span className="font-mono text-xs font-semibold tracking-widest text-gray-700">MONITORING STACK</span>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {tags.map((tag) => (
              <span key={tag} className="px-4 py-1.5 rounded-full bg-purple-100/50 border border-purple-200/50 text-purple-700 font-mono text-sm font-medium capitalize">
                {tag}
              </span>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

export default function AllSetPage() {
  return (
    <div className="w-full">
      <Suspense fallback={<div className="min-h-[85vh] flex items-center justify-center">Loading...</div>}>
        <AllSetContent />
      </Suspense>
    </div>
  );
}
