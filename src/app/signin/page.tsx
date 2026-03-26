'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Footer } from '@/modules/layout';
import { API_FALLBACK_URL, API_URL, apiFetchWithFallback } from '@/lib/api-client';
import Image from 'next/image';

const travelImages = [
  'https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=150&h=200&fit=crop',
  'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=150&h=200&fit=crop',
  'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=150&h=200&fit=crop',
  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=150&h=200&fit=crop',
];

const travelImageFallback =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="150" height="200"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="%231d2a44"/><stop offset="100%" stop-color="%23111b2e"/></linearGradient></defs><rect width="150" height="200" fill="url(%23g)"/></svg>';

export default function SignInPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'signup' | 'signin'>('signin');
  const [flow, setFlow] = useState('');
  const [step, setStep] = useState<'options' | 'email' | 'verify' | 'no-account'>('options');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState(['', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [brokenTravelImages, setBrokenTravelImages] = useState<boolean[]>(() => travelImages.map(() => false));

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setMode(params.get('mode') === 'signup' ? 'signup' : 'signin');
    setFlow(params.get('flow') || '');

    const checkSession = async () => {
      try {
        const res = await apiFetchWithFallback('/api/auth/me');
        if (!res.ok) return;
        const data = await res.json();
        if (data?.user_id) {
          router.replace(`/profile/${data.user_id}`);
        }
      } catch {
        // Keep user on sign-in when API is unreachable.
      }
    };

    checkSession();
  }, [router]);

  const handleGoogleSignin = () => {
    // Start OAuth directly on API host to avoid oversized app-domain cookie headers on proxy requests.
    const preferredBase = API_FALLBACK_URL || API_URL;
    window.location.href = `${preferredBase}/api/auth/google`;
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await apiFetchWithFallback('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to send code');
        return;
      }

      if (data.account_exists) {
        setStep('verify');
      } else {
        setStep('no-account');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (index: number, value: string) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);

      if (value && index < 4) {
        const nextInput = document.getElementById(`code-${index + 1}`);
        nextInput?.focus();
      }
    }
  };

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerify = async () => {
    const fullCode = code.join('');
    if (fullCode.length !== 5) return;

    setLoading(true);
    setError('');

    try {
      const res = await apiFetchWithFallback('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: fullCode }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Invalid code');
        setCode(['', '', '', '', '']);
        document.getElementById('code-0')?.focus();
        return;
      }

      if (data.is_new_user) {
        window.location.href = '/onboarding';
      } else if (data.user_id) {
        window.location.href = `/profile/${data.user_id}`;
      } else {
        window.location.href = '/';
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await apiFetchWithFallback('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setError('');
        setCode(['', '', '', '', '']);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to resend');
      }
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = () => {
    window.location.href = '/onboarding';
  };

  useEffect(() => {
    if (flow === 'email') {
      setStep('email');
    }
  }, [flow]);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="px-6 md:px-24 py-8 md:py-10">
        <div className="max-w-[1488px] mx-auto flex items-center justify-between">
          <Link href="/" className="text-2xl font-semibold">
            travingat
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 md:px-24 pb-24">
        <div className="max-w-[1488px] mx-auto flex justify-center pt-8">
          <div className="bg-[#1a1a1a] rounded-2xl p-9 w-full max-w-[440px]">

            {/* Step: Options */}
            {step === 'options' && (
              <>
                <div className="mb-8">
                  <h1 className="text-4xl font-semibold mb-4">{mode === 'signup' ? 'Join Travingat' : 'Welcome Back'}</h1>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    Collect, organize, and share your travels by countries and collections.
                  </p>
                </div>

                <div className="flex gap-2.5 mb-10">
                  {travelImages.map((src, i) => (
                    <div
                      key={i}
                      className="w-[83px] h-[123px] rounded-lg overflow-hidden bg-gray-800"
                    >
                      <Image
                        src={brokenTravelImages[i] ? travelImageFallback : src}
                        alt={`Travel ${i + 1}`}
                        onError={() => {
                          setBrokenTravelImages((prev) => {
                            if (prev[i]) return prev;
                            const next = [...prev];
                            next[i] = true;
                            return next;
                          });
                        }}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <button
                    onClick={handleGoogleSignin}
                    className="w-full bg-white text-black h-[54px] rounded flex items-center justify-center gap-3 hover:bg-gray-100 transition font-medium"
                  >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M19.8055 10.2292C19.8055 9.55212 19.7501 8.86627 19.6302 8.19922H10.2002V12.0492H15.6012C15.3761 13.2908 14.6567 14.3893 13.6023 15.0874V17.5866H16.8251C18.7196 15.8449 19.8055 13.2724 19.8055 10.2292Z" fill="#4285F4" />
                      <path d="M10.2002 20.0006C12.9512 20.0006 15.2726 19.1151 16.8295 17.5865L13.6067 15.0873C12.7113 15.6973 11.5553 16.043 10.2046 16.043C7.54688 16.043 5.2903 14.283 4.50049 11.9165H1.1792V14.4923C2.77965 17.6852 6.31201 20.0006 10.2002 20.0006Z" fill="#34A853" />
                      <path d="M4.49609 11.917C4.0817 10.6754 4.0817 9.32677 4.49609 8.08511V5.50928H1.17927C-0.324033 8.50677 -0.324033 12.4954 1.17927 15.4929L4.49609 11.917Z" fill="#FBBC04" />
                      <path d="M10.2002 3.95805C11.6255 3.936 13.0038 4.47008 14.0408 5.45722L16.8914 2.60218C15.185 0.990509 12.9331 0.0808105 10.2002 0.103275C6.31201 0.103275 2.77965 2.41865 1.1792 5.61154L4.49603 8.1873C5.28139 5.81646 7.54243 3.95805 10.2002 3.95805Z" fill="#EA4335" />
                    </svg>
                    <span>Continue with Google</span>
                  </button>

                  <button
                    onClick={() => setStep('email')}
                    className="w-full bg-[#2a2a2a] text-white h-[56px] rounded flex items-center justify-center gap-3 hover:bg-[#333] transition font-medium"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                    </svg>
                    <span>Continue with Email</span>
                  </button>

                  <Link
                    href={mode === 'signup' ? '/signin' : '/onboarding'}
                    className="w-full h-[54px] rounded flex items-center justify-center text-sm hover:bg-white/5 transition"
                  >
                    {mode === 'signup' ? 'Already traveler? Sign in' : 'No account yet? Sign up'}
                  </Link>
                </div>

                <p className="text-xs text-gray-500 mt-8 leading-relaxed">
                  By continuing, you accept Travingat&apos;s{' '}
                  <Link href="/terms" className="underline hover:text-gray-400">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="underline hover:text-gray-400">
                    Privacy Policy
                  </Link>
                  .
                </p>
              </>
            )}

            {/* Step: Email Input */}
            {step === 'email' && (
              <>
                <div className="flex justify-center mb-8">
                  <div className="w-[100px] h-[100px] rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="white">
                      <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                    </svg>
                  </div>
                </div>

                <h1 className="text-4xl font-semibold mb-8 text-center">
                  Enter your email
                </h1>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded px-4 py-3 mb-6 text-sm text-red-400 text-center">
                    {error}
                  </div>
                )}

                <form onSubmit={handleEmailSubmit} className="space-y-6">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    required
                    className="w-full bg-transparent border-b border-gray-700 px-0 py-4 text-center text-lg focus:outline-none focus:border-white transition placeholder:text-gray-600"
                  />

                  <div className="space-y-4 pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-white text-black h-[54px] rounded hover:bg-gray-100 transition font-medium disabled:opacity-50"
                    >
                      {loading ? 'Sending...' : 'Continue'}
                    </button>

                    <button
                      type="button"
                      onClick={() => { setStep('options'); setError(''); }}
                      className="w-full h-[54px] rounded hover:bg-white/5 transition text-sm"
                    >
                      Back to sign in options
                    </button>
                  </div>
                </form>
              </>
            )}

            {/* Step: Verify Code */}
            {step === 'verify' && (
              <>
                <div className="flex justify-center mb-8">
                  <div className="w-[100px] h-[100px] rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="white">
                      <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                    </svg>
                  </div>
                </div>

                <div className="mb-10 space-y-4">
                  <h1 className="text-4xl font-semibold text-center">
                    Check your email
                  </h1>
                  <p className="text-sm text-gray-400 text-center">
                    Enter the 5-digit code we sent to{' '}
                    <span className="text-white">{email}</span>
                  </p>
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded px-4 py-3 mb-6 text-sm text-red-400 text-center">
                    {error}
                  </div>
                )}

                <div className="flex gap-4 justify-center mb-10">
                  {code.map((digit, index) => (
                    <input
                      key={index}
                      id={`code-${index}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleCodeChange(index, e.target.value)}
                      onKeyDown={(e) => handleCodeKeyDown(index, e)}
                      className="w-16 h-24 bg-black border-b-2 border-gray-700 text-center text-4xl font-semibold focus:outline-none focus:border-white transition"
                    />
                  ))}
                </div>

                <div className="space-y-4">
                  <button
                    onClick={handleVerify}
                    disabled={loading || code.join('').length !== 5}
                    className="w-full bg-white text-black h-[54px] rounded hover:bg-gray-100 transition font-medium disabled:opacity-50"
                  >
                    {loading ? 'Verifying...' : 'Verify & Continue'}
                  </button>

                  <button
                    onClick={handleResendCode}
                    disabled={loading}
                    className="w-full h-[54px] rounded hover:bg-white/5 transition text-sm disabled:opacity-50"
                  >
                    Resend Code
                  </button>

                  <button
                    onClick={() => { setStep('email'); setError(''); setCode(['', '', '', '', '']); }}
                    className="w-full h-[54px] rounded hover:bg-white/5 transition text-sm"
                  >
                    Use a different email
                  </button>
                </div>
              </>
            )}

            {/* Step: No Account Found */}
            {step === 'no-account' && (
              <>
                <div className="flex justify-center mb-8">
                  <div className="w-[100px] h-[100px] rounded-full overflow-hidden bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="white">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
                    </svg>
                  </div>
                </div>

                <div className="mb-10 space-y-4">
                  <h1 className="text-4xl font-semibold text-center">
                    No account found
                  </h1>
                  <p className="text-sm text-gray-400 text-center">
                    There&apos;s no account associated with{' '}
                    <span className="text-white">{email}</span>
                  </p>
                </div>

                <div className="space-y-4">
                  <button
                    onClick={handleCreateAccount}
                    className="w-full bg-white text-black h-[54px] rounded hover:bg-gray-100 transition font-medium"
                  >
                    {mode === 'signup' ? 'Start profile setup' : 'Create account'}
                  </button>

                  <button
                    onClick={() => { setStep('email'); setError(''); setEmail(''); }}
                    className="w-full h-[54px] rounded hover:bg-white/5 transition text-sm"
                  >
                    Try a different email
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
