import { apiFetch } from '@/lib/auth-client';

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
export const API_FALLBACK_URL = process.env.NEXT_PUBLIC_API_FALLBACK_URL || 'https://travingat-backend-production.up.railway.app';

function normalizeBase(base: string) {
	return base.trim().replace(/\/+$/, '');
}

function maybeStripApiSuffix(base: string) {
	return base.replace(/\/api$/i, '');
}

export function resolveApiBaseCandidates() {
	const candidates = new Set<string>();
	const primary = normalizeBase(API_URL);
	candidates.add(primary);
	candidates.add(maybeStripApiSuffix(primary));

	if (API_FALLBACK_URL) {
		const fallback = normalizeBase(API_FALLBACK_URL);
		candidates.add(fallback);
		candidates.add(maybeStripApiSuffix(fallback));
	}

	candidates.add('http://localhost:8080');
	candidates.add('http://127.0.0.1:8080');

	if (typeof window !== 'undefined') {
		const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
		const hostname = window.location.hostname;
		if (hostname) {
			const localBase = `${protocol}//${hostname}:8080`;
			candidates.add(localBase);
			candidates.add(maybeStripApiSuffix(localBase));
		}
	}

	return Array.from(candidates).filter(Boolean).map(normalizeBase);
}

export async function apiFetchWithFallback(path: string, init: RequestInit = {}) {
	const retryableStatuses = new Set([404, 413, 431, 502]);
	let lastResponse: Response | null = null;

	try {
		const proxyRes = await apiFetch(`/api/proxy${path}`, init);
		if (!retryableStatuses.has(proxyRes.status)) {
			return proxyRes;
		}
		lastResponse = proxyRes;
	} catch {
		// Fall back to direct backend bases below.
	}

	let lastErr: unknown = null;
	for (const base of resolveApiBaseCandidates()) {
		try {
			const res = await apiFetch(`${base}${path}`, init);
			if (!retryableStatuses.has(res.status)) {
				return res;
			}
			lastResponse = res;
		} catch (err) {
			lastErr = err;
		}
	}

	if (lastResponse) {
		return lastResponse;
	}

	if (lastErr instanceof Error) {
		throw lastErr;
	}
	throw new TypeError('Failed to fetch');
}
