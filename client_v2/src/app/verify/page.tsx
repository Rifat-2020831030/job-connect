"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useRef, Suspense } from "react";

function VerificationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendMessage, setResendMessage] = useState("");
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

  const handleResend = async () => {
    if (!email) return;
    setResendMessage("");
    setError("");
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3010/api";
      const response = await fetch(`${apiUrl}/auth/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (response.ok && data.status === 1) {
        setResendMessage("Verification code resent to your email.");
      } else {
        setError(data.message || "Failed to resend code.");
      }
    } catch (err) {
      console.error("Resend error:", err);
      setError("An unexpected error occurred.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length === 6) {
      setLoading(true);
      setError("");
      setResendMessage("");
      
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3010/api";
        const response = await fetch(`${apiUrl}/auth/verify-otp`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, code: code }),
        });
        
        const data = await response.json();
        
        if (response.ok && data.status === 1) {
          router.push("/set-password?email=" + encodeURIComponent(email));
        } else {
          setError(data.message || "Invalid or expired code.");
        }
      } catch (err) {
        console.error("Verification error:", err);
        setError("An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
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
          <div className="flex flex-col gap-2">
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
                  disabled={loading}
                  className="w-12 h-14 md:w-14 md:h-16 text-center text-2xl font-bold border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors bg-white text-foreground disabled:opacity-50"
                  required
                />
              ))}
            </div>
            {error && <p className="text-red-500 text-sm text-center mt-2">{error}</p>}
            {resendMessage && <p className="text-primary text-sm text-center mt-2">{resendMessage}</p>}
          </div>

          <div className="flex flex-col gap-4 w-full">
            <button 
              type="submit" 
              disabled={loading || otp.join("").length < 6}
              className="w-full py-4 btn-primary text-base disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? "Verifying..." : "Verify & Continue"}
            </button>
            
            <div className="flex items-center justify-center gap-2 text-sm">
              <span className="font-mono text-gray-500 font-semibold tracking-wide">Didn't receive the code?</span>
              <button 
                type="button" 
                onClick={handleResend}
                disabled={loading}
                className="font-mono text-primary font-semibold tracking-wide hover:underline decoration-primary/30 underline-offset-4 disabled:opacity-50"
              >
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
