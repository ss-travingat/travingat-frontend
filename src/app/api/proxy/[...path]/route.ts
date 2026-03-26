import { NextRequest, NextResponse } from 'next/server';

const BACKEND_BASE = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export const runtime = 'nodejs';

function normalizeBase(base: string) {
  return base.replace(/\/$/, '');
}

function resolveBackendBases() {
  const bases = new Set<string>();
  bases.add(normalizeBase(BACKEND_BASE));

  if (process.env.NODE_ENV !== 'production') {
    bases.add('http://localhost:8080');
    bases.add('http://127.0.0.1:8080');
  }

  return Array.from(bases);
}

function buildTargetURL(base: string, pathname: string, search: string) {
  const cleanPath = pathname.replace(/^\/+/, '');
  return `${normalizeBase(base)}/${cleanPath}${search}`;
}

async function proxy(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  const joinedPath = Array.isArray(path) ? path.join('/') : '';

  const headers = new Headers(req.headers);
  headers.delete('host');
  headers.delete('content-length');
  headers.delete('connection');

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
      const responseHeaders = new Headers(upstream.headers);
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
