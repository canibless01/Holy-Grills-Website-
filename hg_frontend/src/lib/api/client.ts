import axios from "axios";
import Cookies from "js-cookie";
import {
  AUTH_TOKEN_COOKIE_NAME,
  AUTH_USER_ID_COOKIE_NAME,
  AUTH_USER_REFRESH_TOKEN_COOKIE_NAME,
  setAuthCookies,
} from "@/lib/auth-session";

function getResolvedBaseUrl(): string {
  if (process.env.VITEST || process.env.NODE_ENV === 'test') {
    return "/api";
  }

  const envUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    "/api";

  let url = envUrl.trim().replace(/\/+$/, "");
  if (url.endsWith("/api/v1")) {
    url = url.replace(/\/v1$/, "");
  }
  if (!url.endsWith("/api")) {
    url = `${url}/api`;
  }
  return url;
}

export const apiClient = axios.create({
  baseURL: getResolvedBaseUrl(),
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  // Normalize request URL if it starts with /api to prevent double /api/api
  if (config.url) {
    if (config.url.startsWith("/api/")) {
      config.url = config.url.replace(/^\/api/, "");
    }
    if (!config.url.startsWith("/")) {
      config.url = `/${config.url}`;
    }
  }

  const token =
    typeof window === "undefined"
      ? undefined
      : Cookies.get(AUTH_TOKEN_COOKIE_NAME);

  if (token) {
    config.headers.Authorization = "Bearer " + token;
  }

  return config;
});

let refreshingPromise: Promise<void> | null = null;

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as
      | (typeof error.config & { _retry?: boolean })
      | undefined;

    if (
      error?.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry
    ) {
      return Promise.reject(error);
    }

    const refreshToken =
      typeof window === "undefined"
        ? undefined
        : Cookies.get(AUTH_USER_REFRESH_TOKEN_COOKIE_NAME);
    if (!refreshToken) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (!refreshingPromise) {
      refreshingPromise = apiClient
        .post("/auth/refresh", {
          refresh_token: refreshToken,
          refreshToken,
        })
        .then((response) => {
          const payload = response?.data?.data ?? response?.data;
          const accessToken = payload?.access_token ?? payload?.accessToken;
          const nextRefreshToken =
            payload?.refresh_token ?? payload?.refreshToken ?? refreshToken;
          const expiresAt = payload?.expires_at ?? payload?.expiresAt;
          const expiresIn = payload?.expires_in ?? payload?.expiresIn;
          const userId =
            payload?.user?.id ??
            (typeof window === "undefined"
              ? undefined
              : Cookies.get(AUTH_USER_ID_COOKIE_NAME)) ??
            "";

          if (!accessToken || !userId) {
            throw new Error("Unable to refresh session");
          }

          setAuthCookies(
            accessToken,
            nextRefreshToken,
            userId,
            expiresAt,
            expiresIn,
          );
        })
        .finally(() => {
          refreshingPromise = null;
        });
    }

    await refreshingPromise;
    return apiClient(originalRequest);
  },
);

export default apiClient;
