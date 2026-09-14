import { useQuery } from "@tanstack/react-query";
import { getAuthStreak } from "@/lib/api/auth";

export interface AuthStreakView {
  lastLoginDate: string;
  lastUpdated: string;
  streakCount: number;
  hasBreak: boolean;
  daysSinceLastActivity: number;
}

function toUtcDate(value: string): Date {
  // Date-only values are treated as UTC midnight for stable day-diff checks.
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return new Date(`${value}T00:00:00.000Z`);
  }

  return new Date(value);
}

function dayDiffFromTodayUtc(date: Date): number {
  const now = new Date();
  const todayUtc = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  const targetUtc = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );

  return Math.max(
    Math.floor((todayUtc.getTime() - targetUtc.getTime()) / 86_400_000),
    0,
  );
}

export function useAuthStreak({ enabled = true }: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: ["auth", "streak"],
    enabled,
    retry: 1,
    staleTime: 60_000,
    queryFn: getAuthStreak,
    select: (data): AuthStreakView => {
      const lastLoginDate = toUtcDate(data.last_login_date);
      const lastUpdatedDate = toUtcDate(data.last_updated);
      const latestActivity =
        lastLoginDate.getTime() > lastUpdatedDate.getTime()
          ? lastLoginDate
          : lastUpdatedDate;
      const daysSinceLastActivity = dayDiffFromTodayUtc(latestActivity);

      return {
        streakCount: data.streak_count,
        lastLoginDate: data.last_login_date,
        lastUpdated: data.last_updated,
        daysSinceLastActivity,
        hasBreak: daysSinceLastActivity > 1,
      };
    },
  });
}
