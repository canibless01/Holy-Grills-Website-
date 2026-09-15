// HolyGrill Live API Client — calls the real backend at holy-grills-backend.onrender.com
const BASE_URL = 'https://holy-grills-backend.onrender.com/api';

const TOKEN_KEY = 'hg_access_token';
const REFRESH_KEY = 'hg_refresh_token';

// "Remember me" — when the user leaves the checkbox unchecked, tokens are
// stored in sessionStorage so they are cleared when the browser closes.
// When checked, tokens persist in localStorage across sessions.
const isRemember = () => localStorage.getItem('hg_remember') === '1';
const storage = () => isRemember() ? localStorage : sessionStorage;

export class ApiError extends Error {
  constructor(status, message, detail) {
    super(message);
    this.status = status;
    this.detail = detail;
  }
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_KEY) || sessionStorage.getItem(REFRESH_KEY);
}

export function setTokens(access, refresh) {
  // Clear both stores first so a stale token from the other storage can't
  // linger and cause isAuthenticated() to read a phantom session.
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(REFRESH_KEY);
  const s = storage();
  if (access) s.setItem(TOKEN_KEY, access);
  if (refresh) s.setItem(REFRESH_KEY, refresh);
}

export function clearTokens() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(REFRESH_KEY);
}

async function refreshToken() {
  const refresh = getRefreshToken();
  if (!refresh) throw new ApiError(401, 'No refresh token');

  // Refresh with a timeout so a cold-starting backend can't hang the refresh
  // indefinitely. Transient failures (network error, timeout, 5xx) must NOT
  // clear the tokens — the access token may still be valid and the user
  // shouldn't be logged out just because the server was slow/unreachable.
  // Only a definitive 401/403 from /auth/refresh (refresh token invalid) clears.
  const doFetch = () => new Promise((resolve, reject) => {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 12000);
    fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refresh }),
      signal: controller.signal,
    }).then((res) => { clearTimeout(t); resolve(res); })
      .catch((e) => { clearTimeout(t); reject(e); });
  });

  let res;
  try { res = await doFetch(); }
  catch (e) {
    throw new ApiError(0, e.name === 'AbortError' ? 'Refresh timed out — the server may be starting up.' : (e.message || 'Network error during refresh'));
  }

  if (res.status === 401 || res.status === 403) {
    clearTokens();
    throw new ApiError(401, 'Session expired — please log in again');
  }
  if (!res.ok) {
    // 5xx or other — keep tokens; this is likely a transient backend issue.
    throw new ApiError(res.status, `Refresh failed (${res.status}) — retry shortly`);
  }

  const data = await res.json().catch(() => null);
  if (data?.access_token) setTokens(data.access_token, data.refresh_token || refresh);
  return data?.access_token;
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  // 12s timeout — fails fast on a cold-starting backend instead of hanging
  // indefinitely and freezing the UI behind a loading state.
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, { ...options, headers, signal: controller.signal });
  } catch (e) {
    clearTimeout(timeoutId);
    if (e.name === 'AbortError') throw new ApiError(0, 'Request timed out — the server may be starting up. Try again in a moment.');
    throw new ApiError(0, e.message || 'Network error');
  }
  clearTimeout(timeoutId);

  // Auto-refresh on 401 (once). On a transient refresh failure (network/5xx)
  // keep the tokens so the user isn't logged out by a slow backend — surface
  // a retryable error instead. Only clear on a definitive auth rejection.
  if (res.status === 401 && token && !options._retried) {
    try {
      await refreshToken();
      return request(path, { ...options, _retried: true });
    } catch (refreshErr) {
      if (refreshErr.status === 401 || refreshErr.status === 403) {
        clearTokens();
        throw refreshErr;
      }
      throw new ApiError(refreshErr.status || 0, refreshErr.message || 'Session refresh unavailable — please retry.');
    }
  }

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new ApiError(res.status, data?.error || data?.message || `Request failed (${res.status})`, data);
  }

  return data;
}

export const apiClient = {
  get(path, params) {
    const qs = params ? '?' + new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
    ).toString() : '';
    return request(path + qs);
  },
  post(path, body) {
    return request(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined });
  },
  patch(path, body) {
    return request(path, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined });
  },
  delete(path) {
    return request(path, { method: 'DELETE' });
  },
  setTokens,
  clearTokens,
  getToken,
};

// Auth helper — login and store tokens
export async function login(email, password) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(res.status, data?.error || 'Login failed', data);
  if (data.access_token) setTokens(data.access_token, data.refresh_token);
  return data;
}

// Check if we have a token
export function isAuthenticated() {
  return !!getToken();
}