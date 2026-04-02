import { NextRequest, NextResponse } from 'next/server';

const BACKEND_BASE = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const BACKEND_FALLBACK_BASE = process.env.API_BASE_FALLBACK_URL || process.env.NEXT_PUBLIC_API_FALLBACK_URL || 'https://travingat-backend-production.up.railway.app';

export const runtime = 'nodejs';

function normalizeBase(base: string) {
  return base.replace(/\/$/, '');
}

function stripApiSuffix(base: string) {
  return base.replace(/\/api$/i, '');
}

function resolveBackendBases() {
  const bases = new Set<string>();
  const primary = normalizeBase(BACKEND_BASE);
  bases.add(primary);
  bases.add(stripApiSuffix(primary));

  if (BACKEND_FALLBACK_BASE) {
    const fallback = normalizeBase(BACKEND_FALLBACK_BASE);
    bases.add(fallback);
    bases.add(stripApiSuffix(fallback));
  }

  if (process.env.NODE_ENV !== 'production') {
    bases.add('http://localhost:8080');
    bases.add('http://127.0.0.1:8080');
  }

  return Array.from(bases);
}

function buildTargetURL(base: string, pathname: string, search: string) {
  const cleanPath = pathname.replace(/^\/+/, '');
  const normalizedBase = normalizeBase(base);

  // Prevent accidental /api/api/* when base already ends with /api.
  const finalPath = normalizedBase.toLowerCase().endsWith('/api') && cleanPath.toLowerCase().startsWith('api/')
    ? cleanPath.slice(4)
    : cleanPath;

  return `${normalizedBase}/${finalPath}${search}`;
}

async function proxy(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  const joinedPath = Array.isArray(path) ? path.join('/') : '';

  const headers = new Headers(req.headers);
  headers.delete('host');
  headers.delete('content-length');
  headers.delete('connection');
  // Force identity encoding so Railway never sends brotli/gzip-compressed bodies.
  // Node.js undici (used by Next.js) does not decompress brotli, causing the proxy
  // to strip content-encoding but pass raw compressed bytes to the browser.
  headers.set('accept-encoding', 'identity');

  // Only forward cookies the backend actually needs — stripping analytics/tracking
  // cookies keeps the Cookie header small and prevents 431 from Fiber's read buffer.
  const allowedCookiePrefixes = ['auth_token', 'oauth_'];
  const rawCookie = req.headers.get('cookie') ?? '';
  const filteredCookie = rawCookie
    .split(';')
    .map((c) => c.trim())
    .filter((c) => allowedCookiePrefixes.some((prefix) => c.startsWith(prefix)))
    .join('; ');
  if (filteredCookie) {
    headers.set('cookie', filteredCookie);
  } else {
    headers.delete('cookie');
  }

  const needsBody = !['GET', 'HEAD'].includes(req.method);
  const rawBody = needsBody ? await req.arrayBuffer() : null;

  const attemptedTargets: string[] = [];
  const errors: string[] = [];

  for (const base of resolveBackendBases()) {
    const targetURL = buildTargetURL(base, joinedPath, req.nextUrl.search);
    attemptedTargets.push(targetURL);

    const init: RequestInit = {
      method: req.method,
      headers,
      redirect: 'manual',
      body: rawBody ? rawBody.slice(0) : undefined,
    };

    try {
      const upstream = await fetch(targetURL, init);

      // Build response headers carefully — new Headers(upstream.headers) can
      // combine multiple Set-Cookie values into one comma-separated string,
      // which browsers reject.  Instead, copy non-cookie headers normally and
      // re-append each Set-Cookie individually.
      const responseHeaders = new Headers();
      for (const [key, value] of upstream.headers.entries()) {
        if (key.toLowerCase() === 'set-cookie') continue;
        responseHeaders.set(key, value);
      }
      const setCookies =
        typeof upstream.headers.getSetCookie === 'function'
          ? upstream.headers.getSetCookie()
          : [];
      for (const cookie of setCookies) {
        responseHeaders.append('set-cookie', cookie);
      }

      responseHeaders.delete('content-encoding');
      responseHeaders.delete('transfer-encoding');

      return new NextResponse(upstream.body, {
        status: upstream.status,
        headers: responseHeaders,
      });
    } catch (err) {
      errors.push(err instanceof Error ? err.message : 'unknown error');
    }
  }

  return NextResponse.json({ error: 'Proxy request failed', detail: errors[0] || '' }, { status: 502 });
}

export async function GET(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  return proxy(req, ctx);
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  return proxy(req, ctx);
}

export async function PUT(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  return proxy(req, ctx);
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  return proxy(req, ctx);
}

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  return proxy(req, ctx);
}

export async function OPTIONS(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  return proxy(req, ctx);
}
