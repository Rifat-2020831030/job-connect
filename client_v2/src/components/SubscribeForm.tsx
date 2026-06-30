"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { API_BASE_URL } from "@/lib/api";

export default function SubscribeForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/auth/subscribe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok && data.status === 1) {
        if (data.alreadyVerified) {
          router.push("/set-password?email=" + encodeURIComponent(email));
        } else {
          router.push("/verify?email=" + encodeURIComponent(email));
        }
      } else {
        setError(data.message || "Failed to subscribe.");
      }
    } catch (err) {
      console.error("Subscription error:", err);
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full">
      <form 
        onSubmit={handleSubmit}
        className="flex flex-col sm:flex-row bg-white border border-gray-300 rounded-lg p-1.5 shadow-sm w-full relative"
      >
        <input 
          type="email" 
          placeholder="Enter your email address" 
          className="flex-1 px-4 py-3 outline-none text-gray-700 bg-transparent"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
        />
        <button 
          type="submit"
          disabled={loading}
          className="bg-primary hover:bg-emerald-600 text-white font-bold px-8 py-3 rounded text-sm sm:text-base transition-colors mt-2 sm:mt-0 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? "Please wait..." : "Get Job Alerts"}
        </button>
      </form>
      {error && (
        <p className="text-red-500 text-sm mt-2 px-1">{error}</p>
      )}
    </div>
  );
}
