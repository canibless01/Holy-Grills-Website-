import { useQuery } from "@tanstack/react-query";
import { getAuthStreak } from "@/lib/api/auth";

export interface AuthStreakView {
  lastCheckinDate: string | null;
  streakCount: number;
  longestStreak: number;
  canCheckinToday: boolean;
  weeklyHistory?: boolean[];
  streakRewards?: Record<string, number>;
  hpAwarded?: number;
}

export function useAuthStreak({ enabled = true }: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: ["auth", "streak"],
    enabled,
    retry: 1,
    staleTime: 60_000,
    queryFn: getAuthStreak,
    select: (data): AuthStreakView => {
      return {
        streakCount: data.streak_count,
        longestStreak: data.longest_streak,
        lastCheckinDate: data.last_checkin_date,
        canCheckinToday: data.can_checkin_today,
        weeklyHistory: data.weekly_history,
        streakRewards: data.streak_rewards,
        hpAwarded: data.hp_awarded,
      };
    },
  });
}
