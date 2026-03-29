'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

function CallbackContent() {
	const searchParams = useSearchParams();

	useEffect(() => {
		const redirect = searchParams.get('redirect') || '/';
		// Only allow relative paths to prevent open-redirect attacks.
		const safeRedirect = redirect.startsWith('/') ? redirect : '/';

		if (window.opener && !window.opener.closed) {
			window.opener.postMessage(
				{ type: 'google_oauth_success', redirect: safeRedirect },
				window.location.origin
			);
			window.close();
		} else {
			// Not in a popup — just navigate directly.
			window.location.href = safeRedirect;
		}
	}, [searchParams]);

	return (
		<div className="min-h-screen bg-black text-white flex items-center justify-center">
			<p className="text-gray-400 text-sm">Completing sign in...</p>
		</div>
	);
}

export default function AuthCallbackPage() {
	return (
		<Suspense
			fallback={
				<div className="min-h-screen bg-black text-white flex items-center justify-center">
					<p className="text-gray-400 text-sm">Completing sign in...</p>
				</div>
			}
		>
			<CallbackContent />
		</Suspense>
	);
}
