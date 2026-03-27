

export function withAuth(init: RequestInit = {}): RequestInit {
  const headers = new Headers(init.headers || {});

  return {
    ...init,
    credentials: 'include',
    headers,
  };
}

export function apiFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  return fetch(input, withAuth(init));
}
