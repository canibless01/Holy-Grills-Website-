"use client";

import { fetchUserProfile } from "@/lib/api/auth";
import { useAuthStore } from "@/stores/authStore";
import { useEffect } from "react";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const setUser = useAuthStore((state) => state.setUser);
  const setLoading = useAuthStore((state) => state.setLoading);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    const fetchUser = async () => {
      try {
        const data = await fetchUserProfile();
        setUser({
          id: data.id,
          role: data.role,
          email: data.email,
          full_name: data.full_name,
          photo_url: data.profile.photo_url,
          hp_balance: data.profile.hp_balance,
          wallet_balance: data.wallet?.balance ?? data.profile.wallet_balance,
          date_of_birth: data.profile.date_of_birth,
          email_notifications: data.profile.email_notifications,
          created_at: data.profile.created_at,
          createdAt: data.profile.created_at,
          phone: data.profile.phone,
        });
      } catch {
        // Keep the auth session from login/signup response while profile route is unavailable.
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [hasHydrated, isAuthenticated, setLoading, setUser]);

  return <>{children}</>;
}
