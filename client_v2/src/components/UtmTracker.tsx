"use client";

import { useEffect } from "react";
import { API_BASE_URL } from "@/lib/api";

const VALID_UTM_SOURCES = ["cv", "share", "referral", "social"];

export default function UtmTracker() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const searchParams = new URLSearchParams(window.location.search);
      const utmSource = searchParams.get("utm_source");

      if (utmSource && utmSource.trim()) {
        const cleanSource = utmSource.trim().toLowerCase();

        // Only ping backend if source is in the allowed whitelist
        if (VALID_UTM_SOURCES.includes(cleanSource)) {
          fetch(`${API_BASE_URL}/stat/source`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ utm_source: cleanSource }),
          }).catch((err) => {
            console.error("Failed to track utm_source", err);
          });
        }

        // Clean up utm_source from address bar regardless to keep URL clean
        searchParams.delete("utm_source");
        const remainingQuery = searchParams.toString();
        const cleanUrl = `${window.location.pathname}${
          remainingQuery ? `?${remainingQuery}` : ""
        }${window.location.hash}`;
        window.history.replaceState(null, "", cleanUrl);
      }
    } catch (error) {
      console.error("Error in UtmTracker", error);
    }
  }, []);

  return null;
}
