"use client";

import { API_BASE_URL } from "@/lib/api";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

function VerificationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [resendCount, setResendCount] = useState(0);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

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

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData("text")
      .replace(/[^0-9]/g, "")
      .slice(0, 6);
    if (pastedData) {
      const newOtp = [...otp];
      for (let i = 0; i < pastedData.length; i++) {
        if (i < 6) newOtp[i] = pastedData[i];
      }
      setOtp(newOtp);
      const focusIndex = Math.min(pastedData.length, 5);
      inputsRef.current[focusIndex]?.focus();
    }
  };

  const handleResend = async () => {
    if (!email) return;
    setResending(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (response.ok && data.status === 1) {
        toast.success("Verification code resent to your email.");
        setTimeLeft(300); // Reset timer to 5 minutes
        setResendCount((prev) => prev + 1);
      } else {
        toast.error(data.message || "Failed to resend code.");
      }
    } catch (err) {
      console.error("Resend error:", err);
      toast.error("An unexpected error occurred.");
    } finally {
      setResending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length === 6) {
      setLoading(true);

      try {
        const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, code: code }),
        });

        const data = await response.json();

        if (response.ok && data.status === 1) {
          router.push("/set-password?email=" + encodeURIComponent(email));
        } else {
          toast.error(data.message || "Invalid or expired code.");
        }
      } catch (err) {
        console.error("Verification error:", err);
        toast.error("An unexpected error occurred.");
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
            <h1 className="text-3xl font-bold text-foreground tracking-tight">
              Verify your email
            </h1>
            <p className="text-gray-500 max-w-[320px]">
              We've sent a 6-digit code to{" "}
              <span className="font-medium text-gray-700">{email}</span>. Please
              enter it below to confirm your identity.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-10">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between gap-1 sm:gap-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputsRef.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  disabled={loading}
                  className="w-10 h-12 sm:w-12 sm:h-14 md:w-14 md:h-16 text-center text-xl sm:text-2xl font-bold border border-gray-300 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors bg-white text-foreground disabled:opacity-50"
                  required
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4 w-full">
            <button
              type="submit"
              disabled={
                loading ||
                resending ||
                otp.join("").length < 6 ||
                timeLeft === 0
              }
              className="w-full py-4 btn-primary text-base disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? "Verifying..." : "Verify & Continue"}
            </button>

            <div className="flex flex-col items-center justify-center gap-2 mt-4">
              <span className="font-mono text-sm text-gray-500 font-semibold tracking-wide">
                Code expires in:{" "}
                <span
                  className={`font-bold ${
                    timeLeft < 60 ? "text-red-500" : "text-primary"
                  }`}
                >
                  {Math.floor(timeLeft / 60)}:
                  {(timeLeft % 60).toString().padStart(2, "0")}
                </span>
              </span>

              <div className="flex items-center gap-2 text-sm mt-1">
                <span className="font-mono text-gray-500 font-semibold tracking-wide">
                  Didn't receive the code?
                </span>
                {(() => {
                  const cooldownSeconds =
                    resendCount === 0 ? 10 : resendCount === 1 ? 30 : 60;
                  const canResendThreshold = 300 - cooldownSeconds;
                  const isCoolingDown = timeLeft > canResendThreshold;
                  const waitTime = timeLeft - canResendThreshold;

                  return (
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={loading || resending || isCoolingDown}
                      className="font-mono text-primary font-semibold tracking-wide hover:underline decoration-primary/30 underline-offset-4 disabled:opacity-50 cursor-pointer disabled:hover:no-underline"
                    >
                      {resending
                        ? "Resending..."
                        : isCoolingDown
                        ? `Wait ${waitTime}s`
                        : "Resend code"}
                    </button>
                  );
                })()}
              </div>
            </div>
          </div>
        </form>

        {/* Footer Note */}
        <div className="w-full pt-8 border-t border-gray-100 flex items-center justify-center gap-2 text-gray-500 opacity-60">
          <span>🔒</span>
          <span className="font-mono text-xs font-semibold tracking-wide">
            End-to-end encrypted authentication
          </span>
        </div>
      </div>
    </div>
  );
}

export default function VerificationPage() {
  return (
    <div className="w-full">
      <Suspense
        fallback={
          <div className="min-h-[80vh] flex items-center justify-center">
            Loading...
          </div>
        }
      >
        <VerificationContent />
      </Suspense>
    </div>
  );
}
