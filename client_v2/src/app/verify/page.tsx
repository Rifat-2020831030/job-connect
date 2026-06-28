"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useRef, Suspense } from "react";

function VerificationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return; // Prevent multiple chars
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next
    if (value !== "" && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length === 6) {
      router.push("/set-password?email=" + encodeURIComponent(email));
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="card w-full max-w-[512px] p-8 md:p-[65px] flex flex-col gap-10 items-center border-[#e2e8f0]">
        
        {/* Header */}
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="size-16 bg-[#ecfdf5] border border-[#d1fae5] rounded-xl flex items-center justify-center text-primary text-2xl">
            ✉️
          </div>
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold text-foreground tracking-tight">Verify your email</h1>
            <p className="text-gray-500 max-w-[320px]">
              We've sent a 6-digit code to your inbox. Please enter it below to confirm your identity.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-10">
          <div className="flex justify-between gap-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => { inputsRef.current[index] = el; }}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-14 md:w-14 md:h-16 text-center text-2xl font-bold border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors bg-white text-foreground"
                required
              />
            ))}
          </div>

          <div className="flex flex-col gap-4 w-full">
            <button type="submit" className="w-full py-4 btn-primary text-base">
              Verify & Continue
            </button>
            
            <div className="flex items-center justify-center gap-2 text-sm">
              <span className="font-mono text-gray-500 font-semibold tracking-wide">Didn't receive the code?</span>
              <button type="button" className="font-mono text-primary font-semibold tracking-wide hover:underline decoration-primary/30 underline-offset-4">
                Resend code
              </button>
            </div>
          </div>
        </form>

        {/* Footer Note */}
        <div className="w-full pt-8 border-t border-gray-100 flex items-center justify-center gap-2 text-gray-500 opacity-60">
          <span>🔒</span>
          <span className="font-mono text-xs font-semibold tracking-wide">End-to-end encrypted authentication</span>
        </div>

      </div>
    </div>
  );
}

export default function VerificationPage() {
  return (
    <div className="w-full">
      <Suspense fallback={<div className="min-h-[80vh] flex items-center justify-center">Loading...</div>}>
        <VerificationContent />
      </Suspense>
    </div>
  );
}
