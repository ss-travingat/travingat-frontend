const ACCESS_TOKEN_KEY = 'travingat_access_token';

export function setAccessToken(token: string) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function getAccessToken(): string {
  if (typeof window === 'undefined') return '';
  return window.localStorage.getItem(ACCESS_TOKEN_KEY) || '';
}

export function clearAccessToken() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
}

export function withAuth(init: RequestInit = {}): RequestInit {
  const headers = new Headers(init.headers || {});
  const token = getAccessToken();

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  return {
    ...init,
    credentials: 'include',
    headers,
  };
}

export function apiFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  return fetch(input, withAuth(init));
}
