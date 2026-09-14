import { NextRequest, NextResponse } from "next/server";
import {
  AUTH_PAGE_PATHS,
  AUTH_TOKEN_COOKIE_NAME,
  AUTH_TOKEN_EXPIRES_COOKIE_NAME,
  AUTH_USER_ID_COOKIE_NAME,
  PROTECTED_PAGE_PATHS,
  hasValidAuthSession,
  matchesProtectedPath,
} from "@/lib/auth-session";

function clearAuthCookies(response: NextResponse) {
  response.cookies.delete(AUTH_TOKEN_COOKIE_NAME);
  response.cookies.delete(AUTH_TOKEN_EXPIRES_COOKIE_NAME);
  response.cookies.delete(AUTH_USER_ID_COOKIE_NAME);
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const token = request.cookies.get(AUTH_TOKEN_COOKIE_NAME)?.value;
  const expiresAt = request.cookies.get(AUTH_TOKEN_EXPIRES_COOKIE_NAME)?.value;
  const isAuthenticated = hasValidAuthSession(token, expiresAt);

  if (matchesProtectedPath(pathname, PROTECTED_PAGE_PATHS) && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    const response = NextResponse.redirect(loginUrl);
    clearAuthCookies(response);
    return response;
  }

  if (matchesProtectedPath(pathname, AUTH_PAGE_PATHS) && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (token || expiresAt) {
    const response = NextResponse.next();

    if (!isAuthenticated) {
      clearAuthCookies(response);
    }

    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*", "/rewards/:path*", "/login", "/signup", "/forgot-password"],
};