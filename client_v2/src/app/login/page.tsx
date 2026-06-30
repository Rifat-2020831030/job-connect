"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Eye, EyeOff } from "lucide-react";
import { API_BASE_URL } from "@/lib/api";
import { setTokens, setUserInfo } from "@/lib/auth";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      
      if (res.ok && data.status === 1) {
        const { accessToken, refreshToken, userId, email: userEmail } = data.data;
        setTokens(accessToken, refreshToken);
        setUserInfo({ userId, email: userEmail });
        
        router.push("/jobs");
      } else {
        toast.error(data.message || "Invalid email or password");
      }
    } catch (err) {
      toast.error("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="card w-full max-w-[512px] p-8 md:p-[65px] flex flex-col gap-10 items-center border-[#e2e8f0]">
        
        {/* Header */}
        <div className="flex flex-col items-center gap-6 text-center w-full">
          <div className="size-16 flex items-center justify-center">
            <User className="size-10 text-foreground" strokeWidth={1.5} />
          </div>
          <div className="flex flex-col gap-2 w-full">
            <h1 className="text-3xl font-bold text-foreground tracking-tight">Welcome back</h1>
            <p className="text-gray-500 max-w-[320px] mx-auto">
              Enter your credentials to access your account.
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
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white text-foreground transition-colors"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold text-gray-700">Password</label>
                <Link href="/login" onClick={(e) => { e.preventDefault(); toast.info("Forgot password feature coming soon"); }} className="text-xs font-semibold text-primary hover:underline underline-offset-2">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-white text-foreground transition-colors pr-10"
                  required
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

          </div>

          <div className="flex flex-col gap-4 w-full mt-4">
            <button 
              type="submit" 
              disabled={loading || !email || !password}
              className="w-full py-4 btn-primary text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
            
            <div className="flex items-center justify-center gap-2 text-sm mt-2">
              <span className="font-mono text-gray-500 font-semibold tracking-wide">Don't have an account?</span>
              <Link 
                href="/#subscribe" 
                className="font-mono text-primary font-semibold tracking-wide hover:underline decoration-primary/30 underline-offset-4"
              >
                Subscribe
              </Link>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
}
