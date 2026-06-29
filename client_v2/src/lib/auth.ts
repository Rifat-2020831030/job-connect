export const ACCESS_TOKEN_KEY = "jf_access_token";
export const REFRESH_TOKEN_KEY = "jf_refresh_token";
export const USER_INFO_KEY = "jf_user_info";

export interface UserInfo {
  userId: string;
  email: string;
}

export function setTokens(accessToken: string, refreshToken: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
}

export function getTokens() {
  if (typeof window !== "undefined") {
    return {
      accessToken: localStorage.getItem(ACCESS_TOKEN_KEY),
      refreshToken: localStorage.getItem(REFRESH_TOKEN_KEY),
    };
  }
  return { accessToken: null, refreshToken: null };
}

export function clearTokens() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_INFO_KEY);
  }
}

export function setUserInfo(info: UserInfo) {
  if (typeof window !== "undefined") {
    localStorage.setItem(USER_INFO_KEY, JSON.stringify(info));
  }
}

export function getUserInfo(): UserInfo | null {
  if (typeof window !== "undefined") {
    const data = localStorage.getItem(USER_INFO_KEY);
    if (data) {
      try {
        return JSON.parse(data);
      } catch (e) {
        return null;
      }
    }
  }
  return null;
}
