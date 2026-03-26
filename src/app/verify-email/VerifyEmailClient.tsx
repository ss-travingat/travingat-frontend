'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiFetchWithFallback } from '@/lib/api-client';

export default function VerifyEmailClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = useMemo(() => searchParams.get('token') || '', [searchParams]);
  const [verifiedUserID, setVerifiedUserID] = useState('');

  const [status, setStatus] = useState<'verifying' | 'verified' | 'error'>('verifying');
  const [error, setError] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(5);

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setStatus('error');
        setError('Missing verification token.');
        return;
      }

      try {
        const res = await apiFetchWithFallback('/api/auth/magic-link/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });
        const data = await res.json();
        if (!res.ok) {
          setStatus('error');
          setError(data.error || 'Verification failed.');
          return;
        }

        if (typeof data.user_id === 'string' && data.user_id) {
          setVerifiedUserID(data.user_id);
        }

        setStatus('verified');
      } catch {
        setStatus('error');
        setError('Network error. Please try again.');
      }
    };

    verify();
  }, [token]);

  useEffect(() => {
    if (status !== 'verified') return;

    const intervalId = window.setInterval(() => {
      setSecondsLeft((prev) => (prev > 1 ? prev - 1 : 0));
    }, 1000);

    const timeoutId = window.setTimeout(() => {
      if (verifiedUserID) {
        router.push(`/profile/${verifiedUserID}`);
      } else {
        router.push('/signin');
      }
    }, 5000);

    return () => {
      window.clearInterval(intervalId);
      window.clearTimeout(timeoutId);
    };
  }, [status, verifiedUserID, router]);

  return (
    <div className="min-h-screen bg-black text-white grid place-items-center px-6">
      <div className="w-full max-w-xl rounded-2xl border border-[#2a2a2a] bg-[#121212] p-8 text-center space-y-4">
        {status === 'verifying' && (
          <>
            <h1 className="text-3xl font-semibold tracking-[-0.41px]">Verifying link...</h1>
            <p className="text-[#9ca3af]">Please wait while we verify your email.</p>
          </>
        )}

        {status === 'verified' && (
          <>
            <h1 className="text-3xl font-semibold tracking-[-0.41px]">Verified successfully</h1>
            <p className="text-[#9ca3af]">Your account is created. Redirecting in {secondsLeft}s.</p>
            <button
              onClick={() => (verifiedUserID ? router.push(`/profile/${verifiedUserID}`) : router.push('/signin'))}
              className="bg-white text-black px-5 py-3 rounded font-medium hover:bg-gray-100 transition"
            >
              Continue now
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            <h1 className="text-3xl font-semibold tracking-[-0.41px]">Verification failed</h1>
            <p className="text-red-400">{error}</p>
            <button
              onClick={() => router.push('/onboarding')}
              className="bg-white text-black px-5 py-3 rounded font-medium hover:bg-gray-100 transition"
            >
              Back to onboarding
            </button>
          </>
        )}
      </div>
    </div>
  );
}
