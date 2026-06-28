"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";

function SetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password && password === confirmPassword) {
      router.push("/preferences");
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="card w-full max-w-[512px] p-8 md:p-[65px] flex flex-col gap-10 items-center border-[#e2e8f0]">
        
        {/* Header */}
        <div className="flex flex-col items-center gap-6 text-center w-full">
          <div className="size-16 bg-[#ecfdf5] border border-[#d1fae5] rounded-xl flex items-center justify-center text-primary text-2xl">
            🔐
          </div>
          <div className="flex flex-col gap-2 w-full">
            <h1 className="text-3xl font-bold text-foreground tracking-tight">Set your password</h1>
            <p className="text-gray-500 max-w-[320px] mx-auto">
              Secure your account by choosing a strong password.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6">
          <div className="flex flex-col gap-4">
            
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700">Email Address</label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white text-foreground"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-1 bg-white text-foreground ${
                  confirmPassword && password !== confirmPassword 
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:border-primary focus:ring-primary"
                }`}
                required
              />
              {confirmPassword && password !== confirmPassword && (
                <p className="text-red-500 text-xs mt-1">Passwords do not match.</p>
              )}
            </div>

          </div>

          <div className="flex flex-col gap-4 w-full mt-4">
            <button 
              type="submit" 
              disabled={!password || password !== confirmPassword}
              className="w-full py-4 btn-primary text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save Password & Continue
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}

export default function SetPasswordPage() {
  return (
    <div className="w-full">
      <Suspense fallback={<div className="min-h-[80vh] flex items-center justify-center">Loading...</div>}>
        <SetPasswordContent />
      </Suspense>
    </div>
  );
}
