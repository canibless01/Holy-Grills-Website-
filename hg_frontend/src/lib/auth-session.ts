import { deleteCookie, setCookie } from "./cookies";

export const AUTH_TOKEN_COOKIE_NAME = "hg_token";
export const AUTH_USER_REFRESH_TOKEN_COOKIE_NAME = "hg_refresh_token";
export const AUTH_TOKEN_EXPIRES_COOKIE_NAME = "hg_token_expires";
export const AUTH_TOKEN_EXPIRES_IN_COOKIE_NAME = "hg_token_expires_in";
export const AUTH_USER_ID_COOKIE_NAME = "hg_user_id";

export const AUTH_PAGE_PATHS = ["/login", "/signup", "/forgot-password"] as const;
export const PROTECTED_PAGE_PATHS = ["/dashboard", "/profile", "/rewards"] as const;

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;
const TOKEN_EXPIRY_BUFFER = 5 * 60 * 1000; // 5 minutes buffer
const DEFAULT_EXPIRY_MILLISECONDS = MILLISECONDS_PER_DAY;

function resolveExpiryTimestampMs(
  expiresAt?: number | string | null,
  now = Date.now(),
): number {
  const rawExpiry = Number(expiresAt);

  if (!Number.isFinite(rawExpiry) || rawExpiry <= 0) {
    return now + DEFAULT_EXPIRY_MILLISECONDS;
  }

  // Support both epoch seconds and epoch milliseconds.
  return rawExpiry > 1_000_000_000_000 ? rawExpiry : rawExpiry * 1000;
}

export function getExpiryTimestampSeconds(
  expiresAt?: number | string | null,
  now = Date.now(),
): number {
  return Math.floor(resolveExpiryTimestampMs(expiresAt, now) / 1000);
}

export function isTokenExpired(
  expiresAt?: number | string | null,
  now = Date.now(),
): boolean {
  return resolveExpiryTimestampMs(expiresAt, now) <= now + TOKEN_EXPIRY_BUFFER;
}

export function hasValidAuthSession(
  token: string | null | undefined,
  expiresAt?: number | string | null,
  now = Date.now(),
): boolean {
  return Boolean(token) && !isTokenExpired(expiresAt, now);
}

export function getCookieExpiryDays(
  expiresAt?: number | string | null,
  now = Date.now(),
): number {
  const expiryMs = resolveExpiryTimestampMs(expiresAt, now);

  return Math.max((expiryMs - now - TOKEN_EXPIRY_BUFFER) / MILLISECONDS_PER_DAY, 0);
}

export function matchesProtectedPath(pathname: string, paths: readonly string[]): boolean {
  return paths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

export function setAuthCookies(
  accessToken: string,
  refreshToken: string,
  id: string,
  expiresAt?: number | string | null,
  expiresIn?: number | string | null,
) {
  const expiryTimestampSeconds = getExpiryTimestampSeconds(expiresAt);
  const cookieExpiryDays = getCookieExpiryDays(expiresAt, Date.now());
  const expiresInNumber = Number(expiresIn);
  const resolvedExpiresIn = Number.isFinite(expiresInNumber) && expiresInNumber > 0
    ? Math.floor(expiresInNumber)
    : Math.max(expiryTimestampSeconds - Math.floor(Date.now() / 1000), 0);

  setCookie(
    AUTH_TOKEN_COOKIE_NAME,
    accessToken,
    cookieExpiryDays,
  );
  setCookie(AUTH_USER_ID_COOKIE_NAME, id);
  setCookie(
    AUTH_TOKEN_EXPIRES_COOKIE_NAME,
    expiryTimestampSeconds.toString(),
    cookieExpiryDays,
  );
  setCookie(
    AUTH_TOKEN_EXPIRES_IN_COOKIE_NAME,
    resolvedExpiresIn.toString(),
    cookieExpiryDays,
  );

  setCookie(
    AUTH_USER_REFRESH_TOKEN_COOKIE_NAME,
    refreshToken,
    cookieExpiryDays,
  );
}


export function clearAuthCookies() {
  deleteCookie(AUTH_TOKEN_COOKIE_NAME);
  deleteCookie(AUTH_USER_ID_COOKIE_NAME);
  deleteCookie(AUTH_TOKEN_EXPIRES_COOKIE_NAME);
  deleteCookie(AUTH_TOKEN_EXPIRES_IN_COOKIE_NAME);
  deleteCookie(AUTH_USER_REFRESH_TOKEN_COOKIE_NAME);
}
