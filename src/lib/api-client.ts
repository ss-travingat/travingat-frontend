import { apiFetch } from '@/lib/auth-client';

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export function resolveApiBaseCandidates() {
	const candidates = new Set<string>();
	candidates.add(API_URL);
	candidates.add('http://localhost:8080');
	candidates.add('http://127.0.0.1:8080');

	if (typeof window !== 'undefined') {
		const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
		const hostname = window.location.hostname;
		if (hostname) {
			candidates.add(`${protocol}//${hostname}:8080`);
		}
	}

	return Array.from(candidates).filter(Boolean);
}

export async function apiFetchWithFallback(path: string, init: RequestInit = {}) {
	try {
		const proxyRes = await apiFetch(`/api/proxy${path}`, init);
		if (proxyRes.status !== 502 && proxyRes.status !== 413) {
			return proxyRes;
		}
	} catch {
		// Fall back to direct backend bases below.
	}

	let lastErr: unknown = null;
	for (const base of resolveApiBaseCandidates()) {
		try {
			return await apiFetch(`${base}${path}`, init);
		} catch (err) {
			lastErr = err;
		}
	}

	if (lastErr instanceof Error) {
		throw lastErr;
	}
	throw new TypeError('Failed to fetch');
}
