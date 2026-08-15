"use client";

import { API_BASE_URL } from "@/lib/api";
import { setIsSubscribed } from "@/lib/auth";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { toast } from "sonner";

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [reason, setReason] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmittingReason, setIsSubmittingReason] = useState(false);
  const [reasonSubmitted, setReasonSubmitted] = useState(false);

  useEffect(() => {
    if (!id) {
      setStatus("error");
      return;
    }

    const unsubscribe = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/email/unsubscribe?id=${id}`);
        const data = await res.json();

        if (res.ok && data.status === 1) {
          setStatus("success");
          if (data.data) setEmail(data.data);
          setIsSubscribed(false);
        } else {
          setStatus("error");
        }
      } catch (err) {
        setStatus("error");
      }
    };

    unsubscribe();
  }, [id]);

  const handleSubmitReason = async () => {
    if (!reason.trim()) return;
    setIsSubmittingReason(true);

    try {
      const res = await fetch(`${API_BASE_URL}/email/unsubscribe-reason`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, reason, email }),
      });
      const data = await res.json();

      if (res.ok && data.status === 1) {
        setReasonSubmitted(true);
      } else {
        toast.error("Failed to submit feedback. Please try again.");
      }
    } catch (err) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsSubmittingReason(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="animate-spin mb-4 text-primary" size={48} />
        <h1 className="text-2xl font-bold text-foreground">Processing...</h1>
        <p className="text-gray-500 mt-2">Unsubscribing you from job alerts</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <div className="size-16 rounded-full bg-red-100 text-red-500 flex items-center justify-center mb-6">
          <svg
            className="size-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-foreground">Oops!</h1>
        <p className="text-gray-500 mt-4 max-w-md">
          We couldn&apos;t process your unsubscription request. The link may be
          invalid or broken.
        </p>
        <Link href="/" className="mt-8 btn-primary px-6 py-2">
          Go to Homepage
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center py-20 px-6">
      <div className="w-full max-w-md flex flex-col items-center text-center">
        <div className="size-16 rounded-full bg-green-100 text-green-500 flex items-center justify-center mb-6">
          <svg
            className="size-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="3"
              d="M5 13l4 4L19 7"
            ></path>
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-foreground">
          Unsubscribed Successfully
        </h1>
        <p className="text-gray-500 mt-4">
          You will no longer receive job alerts from us.
          <br /> We&apos;re sorry to see you go!
        </p>

        {!reasonSubmitted ? (
          <div className="w-full mt-10 bg-white border border-gray-200 rounded-xl p-6 shadow-sm text-left">
            <h2 className="text-lg font-bold text-foreground mb-2">
              Care to tell us why?
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Your feedback helps us improve.
            </p>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="E.g., Too many emails, not relevant jobs..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary h-24 mb-4"
            ></textarea>
            <div className="flex items-center gap-3">
              <button
                onClick={handleSubmitReason}
                disabled={isSubmittingReason || !reason.trim()}
                className="btn-primary flex-1 py-2.5 disabled:opacity-50 cursor-pointer"
              >
                {isSubmittingReason ? "Sending..." : "Send Feedback"}
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full mt-10 bg-green-50 border border-green-100 rounded-xl p-6 text-center">
            <p className="text-green-700 font-medium">
              Thank you for your feedback!
            </p>
          </div>
        )}

        <Link
          href="/jobs"
          className="mt-10 px-8 py-3 rounded-lg border border-gray-300 font-bold text-gray-600 hover:bg-gray-50 transition-colors w-full text-center"
        >
          Browse Existing Jobs
        </Link>
      </div>
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="animate-spin text-primary" size={48} />
        </div>
      }
    >
      <UnsubscribeContent />
    </Suspense>
  );
}
