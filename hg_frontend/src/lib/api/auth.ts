import { AUTH_TOKEN_COOKIE_NAME } from "../auth-session";
import { getCookie } from "../cookies";
import { apiClient } from "./client";
import { z } from "zod";

const authLoginUserSchema = z
  .object({
    id: z.string(),
    role: z.string(),
    email: z.string(),
    phone: z.string().optional(),
    user_metadata: z
      .object({
        full_name: z.string().optional(),
      })
      .passthrough()
      .optional(),
    created_at: z.string().optional(),
  })
  .passthrough();

const authLoginResponseSchema = z
  .object({
    access_token: z.string(),
    expires_at: z.number(),
    expires_in: z.number(),
    refresh_token: z.string(),
    token_type: z.string(),
    user: authLoginUserSchema,
    weak_password: z.unknown().nullable().optional(),
  })
  .passthrough();

const authStreakResponseSchema = z
  .object({
    streak_count: z.number().default(0),
    longest_streak: z.number().default(0),
    last_checkin_date: z.string().nullable().optional(),
    can_checkin_today: z.boolean().default(false),
    weekly_history: z.array(z.boolean()).optional(),
    streak_rewards: z.record(z.string(), z.number()).optional(),
    hp_awarded: z.number().optional(),
  })
  .passthrough();

const authProfileResponseSchema = z
  .object({
    date_of_birth: z.string().nullable().optional(),
    email_notifications: z.boolean().optional(),
    full_name: z.string().optional(),
    nickname: z.string().nullable().optional(),
    leaderboard_show_full_name: z.boolean().optional(),
    phone: z.string().nullable().optional(),
  })
  .passthrough();

const authProfileUpdatePayloadSchema = z.object({
  date_of_birth: z.string().optional(),
  email_notifications: z.boolean().optional(),
  full_name: z.string().optional(),
  nickname: z.string().optional().nullable(),
  leaderboard_show_full_name: z.boolean().optional(),
  phone: z.string().optional(),
}).passthrough();

export interface AuthUser {
  id: string;
  role: string;
  email: string;
  full_name: string;
  nickname?: string | null;
  leaderboard_show_full_name?: boolean;
  photo_url: string | null;
  hp_balance: number;
  wallet_balance: number;
  date_of_birth?: string | null;
  email_notifications?: boolean;
  created_at?: string;
  createdAt?: string;
  phone?: string | null;
}

export interface AuthSessionUser {
  user: AuthUser;
}

export interface SignupAuthResponse {
  user: AuthSessionUser["user"] & {
    name: string;
    accessToken: string;
    refreshToken: string;
  };
}

export interface AuthUserProfileResponse {
  created_at: string;
  current_tier_id: string | null;
  date_of_birth: string | null;
  deactivated_at: string | null;
  deactivated_by: string | null;
  deactivation_reason: string | null;
  department: string | null;
  email: string;
  email_notifications: boolean;
  faculty: string | null;
  full_name: string;
  has_scheduled_order: boolean;
  hp_balance: number;
  hp_earned_120day: number;
  id: string;
  is_active: boolean;
  jwt_version: number;
  last_activity_at: string | null;
  last_hp_activity_at: string | null;
  last_seen_at: string | null;
  onboarding_completed_at: string | null;
  phone: string | null;
  photo_url: string | null;
  preferences: Record<string, unknown>;
  push_enabled: boolean;
  referral_code: string;
  referred_by: string | null;
  role: string;
  tier_grace_ends_at: string | null;
  tier_grace_started_at: string | null;
  tier_lost_at: string | null;
  updated_at: string;
  wallet_balance: number;
}

export interface AuthWalletResponse {
  balance: number;
  currency: string;
}

export interface FetchUserProfileResponse {
  email: string;
  full_name: string;
  id: string;
  profile: AuthUserProfileResponse;
  role: string;
  tier: Record<string, unknown> | null;
  wallet: AuthWalletResponse;
}

export interface UserResponse {
  profile: AuthUserProfileResponse;
}

export interface AuthLoginResponse {
  user: AuthSessionUser["user"];
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  expiresIn: number;
}

export interface AuthStreakResponse {
  streak_count: number;
  longest_streak: number;
  last_checkin_date: string | null;
  can_checkin_today: boolean;
  weekly_history?: boolean[];
  streak_rewards?: Record<string, number>;
  hp_awarded?: number;
}

export interface AuthProfileResponse {
  date_of_birth: string | null;
  email_notifications: boolean;
  full_name: string;
  nickname?: string | null;
  leaderboard_show_full_name?: boolean;
  phone: string | null;
}

export interface AuthProfileUpdatePayload {
  date_of_birth: string;
  email_notifications: boolean;
  full_name: string;
  nickname?: string | null;
  leaderboard_show_full_name?: boolean;
  phone: string;
}

export interface ForgotPasswordResponse {
  message: string;
  success: boolean;
}

export interface ResetPasswordResponse {
  message: string;
  success: boolean;
}

export function getLoginAccessToken(_data?: unknown): string | null {
  return getCookie(AUTH_TOKEN_COOKIE_NAME) ?? null;
}

export async function loginApi(
  email: string,
  password: string,
): Promise<AuthLoginResponse> {
  const { data } = await apiClient.post<unknown>("/auth/login", {
    email,
    password,
  });

  const parsedResponse = authLoginResponseSchema.parse(data);

  return {
    user: {
      id: parsedResponse.user.id,
      role: parsedResponse.user.role,
      email: parsedResponse.user.email,
      // Profile-only fields are resolved from /auth/me; keep login mapping minimal.
      full_name:
        parsedResponse.user.user_metadata?.full_name ?? parsedResponse.user.email,
      photo_url: null,
      hp_balance: 0,
      wallet_balance: 0,
      date_of_birth: null,
      email_notifications: false,
      created_at: parsedResponse.user.created_at,
      createdAt: parsedResponse.user.created_at,
      phone: parsedResponse.user.phone || null,
    },
    accessToken: parsedResponse.access_token,
    refreshToken: parsedResponse.refresh_token,
    expiresAt: parsedResponse.expires_at,
    expiresIn: parsedResponse.expires_in,
  };
}

export async function signupApi(
  name: string,
  email: string,
  password: string,
  phone_number?: string,
  department_id?: string,
  academic_level_id?: string,
  referral_code?: string,
  nickname?: string,
): Promise<SignupAuthResponse> {
  const { data } = await apiClient.post<SignupAuthResponse>("/auth/register", {
    full_name: name,
    email,
    password,
    phone: phone_number,
    department_id,
    academic_level_id,
    referral_code,
    nickname,
  });
  return data;
}

export async function logoutApi(refreshToken: string): Promise<void> {
  const { data } = await apiClient.post("/auth/logout", {
    refresh_token: refreshToken,
    refreshToken,
  });

  return data;
}

export async function fetchUserProfile(): Promise<FetchUserProfileResponse> {
  const { data } = await apiClient.get<FetchUserProfileResponse>("/auth/me");
  return data;
}

export async function getAuthStreak(): Promise<AuthStreakResponse> {
  const { data } = await apiClient.get<unknown>("/auth/streak");
  const parsed = authStreakResponseSchema.parse(data);

  return {
    streak_count: parsed.streak_count,
    longest_streak: parsed.longest_streak,
    last_checkin_date: parsed.last_checkin_date ?? null,
    can_checkin_today: parsed.can_checkin_today,
    weekly_history: parsed.weekly_history,
    streak_rewards: parsed.streak_rewards,
    hp_awarded: parsed.hp_awarded,
  };
}

export async function checkinStreakApi(): Promise<{ message: string; streak_count: number; hp_earned: number }> {
  const { data } = await apiClient.post<Record<string, unknown>>("/auth/streak/checkin");
  return {
    message: String(data.message ?? "Daily check-in completed!"),
    streak_count: Number(data.streak_count ?? 0),
    hp_earned: Number(data.hp_earned ?? 0),
  };
}

export async function reclaimStreakApi(type: 'order' | 'topup'): Promise<{ message: string; streak_count: number }> {
  const { data } = await apiClient.post<Record<string, unknown>>("/auth/streak/reclaim", { type });
  return {
    message: String(data.message ?? "Streak day reclaimed!"),
    streak_count: Number(data.streak_count ?? 0),
  };
}

export async function getAuthProfile(): Promise<AuthProfileResponse> {
  const { data } = await apiClient.get<unknown>("/auth/me");
  const unwrapped = (data && typeof data === 'object' && 'user' in data ? (data as Record<string, unknown>).user : data);
  const parsed = authProfileResponseSchema.parse(unwrapped);

  return {
    date_of_birth: parsed.date_of_birth ?? null,
    email_notifications: parsed.email_notifications ?? true,
    full_name: parsed.full_name ?? "",
    nickname: parsed.nickname,
    leaderboard_show_full_name: parsed.leaderboard_show_full_name,
    phone: parsed.phone ?? null,
  };
}

export async function updateAuthProfile(
  payload: AuthProfileUpdatePayload,
): Promise<AuthProfileResponse> {
  const validatedPayload = authProfileUpdatePayloadSchema.parse(payload);
  const { data } = await apiClient.put<unknown>(
    "/auth/me",
    validatedPayload,
  );
  const unwrapped = (data && typeof data === 'object' && 'user' in data ? (data as Record<string, unknown>).user : data);
  const parsed = authProfileResponseSchema.parse(unwrapped);

  return {
    date_of_birth: parsed.date_of_birth ?? null,
    email_notifications: parsed.email_notifications ?? true,
    full_name: parsed.full_name ?? "",
    nickname: parsed.nickname,
    leaderboard_show_full_name: parsed.leaderboard_show_full_name,
    phone: parsed.phone ?? null,
  };
}

export async function getDepartmentsApi(): Promise<Array<{ id: string; name: string; faculty?: string }>> {
  const { data } = await apiClient.get<{ data: Array<{ id: string; name: string; faculty?: string }> }>("/departments");
  return data?.data ?? (data as unknown as Array<{ id: string; name: string }>);
}

export async function getAcademicLevelsApi(): Promise<Array<{ id: string; name: string; value?: string }>> {
  const { data } = await apiClient.get<{ data: Array<{ id: string; name: string; value?: string }> }>("/academic-levels");
  return data?.data ?? (data as unknown as Array<{ id: string; name: string }>);
}

export async function requestPasswordResetApi(
  email: string,
): Promise<ForgotPasswordResponse> {
  const { data } = await apiClient.post<ForgotPasswordResponse>(
    "/auth/forgot-password",
    {
      email,
    },
  );
  return data;
}

export async function resetPasswordApi(
  accessToken: string,
  password: string,
): Promise<ResetPasswordResponse> {
  const { data } = await apiClient.post<ResetPasswordResponse>(
    "/auth/reset-password",
    {
      token: accessToken,
      new_password: password,
    },
  );
  return data;
}

export async function updateUserProfileApi(
  profileData: Partial<AuthUserProfileResponse>,
): Promise<UserResponse> {
  const { data } = await apiClient.put<UserResponse>(
    "/auth/me",
    profileData,
  );
  return data;
}
