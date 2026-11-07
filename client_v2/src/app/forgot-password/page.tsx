"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { KeyRound, Mail, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { API_BASE_URL } from "@/lib/api";
import { setTokens, setUserInfo } from "@/lib/auth";
import { toast } from "sonner";

function ForgotPasswordContent() {
  const router = useRouter();

  const [step, setStep] = useState<"EMAIL" | "RESET">("EMAIL");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds

  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (step !== "RESET" || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [step, timeLeft]);

  // Focus first OTP input when transitioning to RESET step
  useEffect(() => {
    if (step === "RESET") {
      setTimeout(() => {
        inputsRef.current[0]?.focus();
      }, 50);
    }
  }, [step]);

  const handleOtpChange = (index: number, value: string) => {
    const cleaned = value.replace(/[^0-9]/g, "");
    if (cleaned.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = cleaned;
    setOtp(newOtp);

    if (cleaned !== "" && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
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

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      toast.error("Please enter your email address");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail }),
      });
      const data = await res.json();

      if (res.ok && data.status === 1) {
        toast.success(
          data.message || "If an account exists, a reset code has been sent."
        );
        setOtp(["", "", "", "", "", ""]);
        setStep("RESET");
        setTimeLeft(300);
      } else {
        toast.error(data.message || "Failed to send reset code. Please try again.");
      }
    } catch {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (timeLeft > 0 || resending || !email) return;
    setResending(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();

      if (res.ok && data.status === 1) {
        toast.success("New reset code sent to your email.");
        setTimeLeft(300);
      } else {
        toast.error(data.message || "Failed to resend code.");
      }
    } catch {
      toast.error("An error occurred while resending the code.");
    } finally {
      setResending(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length !== 6) {
      toast.error("Please enter the complete 6-digit verification code");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          code,
          password,
        }),
      });
      const data = await res.json();

      if (res.ok && data.status === 1) {
        if (data.data?.accessToken && data.data?.refreshToken) {
          setTokens(data.data.accessToken, data.data.refreshToken);
          setUserInfo({
            userId: data.data.userId,
            email: data.data.email || email.trim(),
          });
        }
        toast.success("Password reset successfully! Welcome back.");
        router.push("/jobs");
      } else {
        toast.error(data.message || "Invalid or expired reset code");
      }
    } catch {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="card w-full max-w-[512px] p-8 md:p-[65px] flex flex-col gap-10 items-center border-[#e2e8f0]">
        {step === "EMAIL" ? (
          <>
            {/* Header */}
            <div className="flex flex-col items-center gap-6 text-center w-full">
              <div className="size-16 bg-[#ecfdf5] border border-[#d1fae5] rounded-xl flex items-center justify-center">
                <KeyRound className="size-8 text-primary" strokeWidth={1.75} />
              </div>
              <div className="flex flex-col gap-2 w-full">
                <h1 className="text-3xl font-bold text-foreground tracking-tight">
                  Reset password
                </h1>
                <p className="text-gray-500 max-w-[340px] mx-auto text-sm">
                  Enter your email address and we&apos;ll send you a 6-digit code to
                  reset your password.
                </p>
              </div>
            </div>

            {/* Email Form */}
            <form
              onSubmit={handleEmailSubmit}
              className="w-full flex flex-col gap-6"
            >
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white text-foreground transition-colors"
                  required
                  autoFocus
                />
              </div>

              <div className="flex flex-col gap-4 w-full mt-2">
                <button
                  type="submit"
                  disabled={loading || !email.trim()}
                  className="w-full py-4 btn-primary text-base cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Sending code..." : "Send Reset Code"}
                </button>

                <div className="flex items-center justify-center mt-2">
                  <Link
                    href="/login"
                    className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-primary transition-colors cursor-pointer"
                  >
                    <ArrowLeft size={16} />
                    Back to Sign In
                  </Link>
                </div>
              </div>
            </form>
          </>
        ) : (
          <>
            {/* Header */}
            <div className="flex flex-col items-center gap-6 text-center w-full">
              <div className="size-16 bg-[#ecfdf5] border border-[#d1fae5] rounded-xl flex items-center justify-center">
                <Mail className="size-8 text-primary" strokeWidth={1.75} />
              </div>
              <div className="flex flex-col gap-2 w-full">
                <h1 className="text-3xl font-bold text-foreground tracking-tight">
                  Enter verification code
                </h1>
                <p className="text-gray-500 max-w-[340px] mx-auto text-sm">
                  We&apos;ve sent a 6-digit code to{" "}
                  <span className="font-semibold text-gray-700">{email}</span>.
                </p>
                <div>
                  <button
                    type="button"
                    onClick={() => {
                      setStep("EMAIL");
                      setOtp(["", "", "", "", "", ""]);
                    }}
                    className="text-xs font-semibold text-primary hover:underline underline-offset-2 cursor-pointer"
                  >
                    Change email
                  </button>
                </div>
              </div>
            </div>

            {/* Reset Form */}
            <form
              onSubmit={handleResetSubmit}
              className="w-full flex flex-col gap-6"
            >
              {/* 6-box OTP */}
              <div className="flex flex-col gap-2 items-center">
                <label className="text-sm font-semibold text-gray-700 self-start">
                  6-Digit Reset Code
                </label>
                <div className="flex gap-2 justify-between w-full">
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => {
                        inputsRef.current[idx] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      autoComplete={idx === 0 ? "one-time-code" : "off"}
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      onPaste={handleOtpPaste}
                      className="size-11 sm:size-12 md:size-14 text-center text-xl md:text-2xl font-bold rounded-lg border border-gray-300 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white text-foreground transition-colors"
                      required
                    />
                  ))}
                </div>
              </div>

              {/* Password Fields */}
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-700">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 8 characters"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white text-foreground transition-colors pr-10"
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-gray-700">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter your password"
                      className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-1 bg-white text-foreground transition-colors pr-10 ${
                        confirmPassword && password !== confirmPassword
                          ? "border-red-400 focus:border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:border-primary focus:ring-primary"
                      }`}
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                  {confirmPassword && password !== confirmPassword && (
                    <p className="text-red-500 text-xs mt-0.5">
                      Passwords do not match
                    </p>
                  )}
                </div>
              </div>

              {/* Countdown & Resend Code */}
              <div className="flex flex-col items-center gap-1.5 text-sm text-gray-500">
                <div>
                  Code expires in:{" "}
                  <span className="font-semibold text-gray-700">
                    {Math.floor(timeLeft / 60)}:
                    {(timeLeft % 60).toString().padStart(2, "0")}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={timeLeft > 0 || resending}
                  className="text-primary hover:underline font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {resending ? "Sending..." : "Resend code"}
                </button>
              </div>

              {/* Submit Button */}
              <div className="flex flex-col gap-4 w-full mt-2">
                <button
                  type="submit"
                  disabled={
                    loading ||
                    otp.join("").length !== 6 ||
                    !password ||
                    password !== confirmPassword
                  }
                  className="w-full py-4 btn-primary text-base cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Updating password..." : "Reset Password"}
                </button>

                <div className="flex items-center justify-center">
                  <Link
                    href="/login"
                    className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-primary transition-colors cursor-pointer"
                  >
                    <ArrowLeft size={16} />
                    Back to Sign In
                  </Link>
                </div>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[80vh] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      }
    >
      <ForgotPasswordContent />
    </Suspense>
  );
}
