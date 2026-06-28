"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SubscribeForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      router.push("/verify?email=" + encodeURIComponent(email));
    }
  };

  return (
    <form 
      onSubmit={handleSubmit}
      className="flex flex-col sm:flex-row bg-white border border-gray-300 rounded-lg p-1.5 shadow-sm w-full"
    >
      <input 
        type="email" 
        placeholder="Enter your email address" 
        className="flex-1 px-4 py-3 outline-none text-gray-700 bg-transparent"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <button 
        type="submit"
        className="bg-primary hover:bg-emerald-600 text-white font-bold px-8 py-3 rounded text-sm sm:text-base transition-colors mt-2 sm:mt-0"
      >
        Get Job Alerts
      </button>
    </form>
  );
}
