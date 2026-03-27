import { NextRequest, NextResponse } from 'next/server';

const BACKEND_BASE = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const BACKEND_FALLBACK_BASE = process.env.API_BASE_FALLBACK_URL || process.env.NEXT_PUBLIC_API_FALLBACK_URL || 'https://travingat-backend-production.up.railway.app';

export const runtime = 'nodejs';

function normalizeBase(base: string) {
	return base.trim().replace(/\/+$/, '');
}

function maybeStripApiSuffix(base: string) {
	return base.replace(/\/api$/i, '');
}

function resolveOAuthStartURL(search: string) {
	const primary = normalizeBase(BACKEND_BASE);
	const fallback = BACKEND_FALLBACK_BASE ? normalizeBase(BACKEND_FALLBACK_BASE) : '';

	const candidates = [
		primary,
		maybeStripApiSuffix(primary),
		fallback,
		fallback ? maybeStripApiSuffix(fallback) : '',
	].filter(Boolean);

	// Deduplicate while preserving order.
	const seen = new Set<string>();
	for (const base of candidates) {
		if (seen.has(base)) continue;
		seen.add(base);
		return `${base}/api/auth/google${search}`;
	}

	return `http://localhost:8080/api/auth/google${search}`;
}

export async function GET(req: NextRequest) {
	const target = resolveOAuthStartURL(req.nextUrl.search);
	return NextResponse.redirect(target, { status: 307 });
}
