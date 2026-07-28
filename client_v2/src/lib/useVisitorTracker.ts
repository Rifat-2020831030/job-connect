import { useEffect } from "react";
import { API_BASE_URL } from "./api";

export function useVisitorTracker() {
  useEffect(() => {
    const trackVisitor = async () => {
      try {
        const hasTracked = localStorage.getItem("chakri_visitor_tracked");

        if (!hasTracked) {
          // Ping backend to register new visitor via IP
          const res = await fetch(`${API_BASE_URL}/stat/visitor`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          });

          if (res.ok) {
            localStorage.setItem("chakri_visitor_tracked", "true");
          }
        }
      } catch (error) {
        console.error("Error tracking unique visitor", error);
      }
    };

    trackVisitor();
  }, []);
}
