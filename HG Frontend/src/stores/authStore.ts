import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AuthSessionUser, loginApi, logoutApi, signupApi } from "@/lib/api/auth";
import {
  AUTH_USER_REFRESH_TOKEN_COOKIE_NAME,
  clearAuthCookies,
  setAuthCookies,
} from "@/lib/auth-session";
import { toast } from "@/components/ui/sonner";
import { AxiosError } from "axios";
import { getCookie } from "@/lib/cookies";

interface AuthState {
  user: AuthSessionUser["user"] | null;
  isAuthenticated: boolean;
  hasHydrated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (
    name: string,
    email: string,
    password: string,
    phone?: string,
    department_id?: string,
    academic_level_id?: string,
    referral_code?: string,
  ) => Promise<void>;
  setUser: (user: AuthSessionUser["user"] | null) => void;
  logout: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  setHasHydrated: (hasHydrated: boolean) => void;
}

function extractApiErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof AxiosError) {
    if (error.code === "ECONNABORTED") {
      return "Request timed out. Please check your internet and try again.";
    }

    const responseData = error.response?.data as
      | { message?: string; error?: string; detail?: string }
      | undefined;

    if (typeof responseData?.message === "string" && responseData.message.trim()) {
      return responseData.message;
    }

    if (typeof responseData?.error === "string" && responseData.error.trim()) {
      return responseData.error;
    }

    if (typeof responseData?.detail === "string" && responseData.detail.trim()) {
      return responseData.detail;
    }

    if (typeof error.message === "string" && error.message.trim()) {
      return error.message;
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
}

/** Returns the URL only if it starts with http:// or https://. Prevents javascript: URI injection. */
export function safeImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:"
      ? parsed.href
      : null;
  } catch {
    return null;
  }
}

/** Derive user initials from a display name (up to 2 letters). */
export function getInitials(name?: string | null): string {
  const safeName = name?.trim();

  if (!safeName) {
    return "";
  }

  return safeName
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      hasHydrated: false,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const data = await loginApi(email, password);
          const accessToken = data.accessToken;
          const refreshToken = data.refreshToken;

          if (!accessToken || !refreshToken) {
            throw new Error("There is an error, kindly try again later.");
          }

          setAuthCookies(
            accessToken,
            refreshToken,
            data.user.id,
            data.expiresAt,
            data.expiresIn,
          );
          set({ user: data.user, isAuthenticated: true });
        } catch (e) {
          const message = extractApiErrorMessage(
            e,
            "Unable to sign in right now. Please try again.",
          );
          toast.error(message);
          console.log("Login error message:", message);
          throw new Error(message);
        } finally {
          set({ isLoading: false });
        }
      },

      signup: async (
        name,
        email,
        password,
        phone,
        department_id,
        academic_level_id,
        referral_code,
      ) => {
        set({ isLoading: true });
        try {
          await signupApi(
            name,
            email,
            password,
            phone,
            department_id,
            academic_level_id,
            referral_code,
          );
          const loginData = await loginApi(email, password);
          const accessToken = loginData.accessToken;
          const refreshToken = loginData.refreshToken;

          if (!accessToken || !refreshToken) {
            throw new Error("Login response is missing access token.");
          }

          setAuthCookies(
            accessToken,
            refreshToken,
            loginData.user.id,
            loginData.expiresAt,
            loginData.expiresIn,
          );
          set({ user: loginData.user, isAuthenticated: true });
        } catch (e) {
          const message = extractApiErrorMessage(
            e,
            "Registration failed. Please try again.",
          );
          toast.error(message);
          console.log("Signup error message:", message);
          throw new Error(message);
        } finally {
          set({ isLoading: false });
        }
      },

      setUser: (user) => set({ user, isAuthenticated: !!user }),

      logout: async () => {
        try {
          const refreshToken = getCookie(AUTH_USER_REFRESH_TOKEN_COOKIE_NAME);

          if (refreshToken) {
            await logoutApi(refreshToken);
          }
        } catch (e) {
          const message = extractApiErrorMessage(
            e,
            "Unable to notify server about logout.",
          );
          console.log("Logout error message:", message);
        } finally {
          clearAuthCookies();
          set({ user: null, isAuthenticated: false });
        }
      },

      setLoading: (isLoading) => set({ isLoading }),
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
    }),
    {
      name: "holy-grills-auth",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
