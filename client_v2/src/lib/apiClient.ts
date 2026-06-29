import { getTokens, setTokens, clearTokens } from "./auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3010/api";

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const { accessToken } = getTokens();
  
  const headers = new Headers(options.headers || {});
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }
  
  // Ensure we send content-type json by default for body requests if not set
  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  // Use absolute URL if provided, otherwise prefix with API_BASE_URL
  const targetUrl = url.startsWith("http") ? url : `${API_BASE_URL}${url}`;

  let response = await fetch(targetUrl, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    const { refreshToken } = getTokens();
    
    if (!refreshToken) {
      // No refresh token, clear out and throw
      clearTokens();
      if (typeof window !== "undefined") window.location.href = "/login";
      throw new Error("Unauthorized");
    }

    if (isRefreshing) {
      // If already refreshing, wait for it to finish and then retry the request
      try {
        const token = await new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        });
        
        headers.set("Authorization", `Bearer ${token}`);
        return fetch(targetUrl, { ...options, headers });
      } catch (err) {
        throw err;
      }
    }

    isRefreshing = true;

    try {
      const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
      
      const refreshData = await refreshRes.json();
      
      if (refreshRes.ok && refreshData.status === 1) {
        const newAccessToken = refreshData.data.accessToken;
        const newRefreshToken = refreshData.data.refreshToken;
        
        setTokens(newAccessToken, newRefreshToken);
        processQueue(null, newAccessToken);
        
        // Retry original request
        headers.set("Authorization", `Bearer ${newAccessToken}`);
        response = await fetch(targetUrl, { ...options, headers });
      } else {
        throw new Error("Refresh failed");
      }
    } catch (err) {
      processQueue(err, null);
      clearTokens();
      if (typeof window !== "undefined") window.location.href = "/login";
      throw err;
    } finally {
      isRefreshing = false;
    }
  }

  return response;
}
