'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Footer } from '@/modules/layout';
import { apiFetchWithFallback } from '@/lib/api-client';
/* eslint-disable @next/next/no-img-element */

const travelImages = [
  'https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=200&h=250&fit=crop',
  'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=200&h=250&fit=crop',
  'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=200&h=250&fit=crop',
  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=200&h=250&fit=crop',
];

const fieldTitleClass = 'text-[32px] font-semibold leading-[1.4] tracking-[-0.41px]';
const helperTextClass = 'text-[16px] font-normal leading-[1.4] tracking-[-0.41px]';
const fieldInputClass = 'text-[36px] font-bold leading-[1.4] tracking-[-0.41px]';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    displayName: '',
    basedIn: '',
    countriesTraveled: '',
    email: '',
  });
  const [sessionUserID, setSessionUserID] = useState('');
  const totalSteps = sessionUserID ? 3 : 5;
  const [linkSent, setLinkSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadSession = async () => {
      try {
        const meRes = await apiFetchWithFallback('/api/auth/me');
        if (!meRes.ok) {
          // Allow guest users to continue onboarding and verify via email in later steps.
          return;
        }

        const meData = (await meRes.json()) as { user_id?: string; email?: string; onboarded?: boolean };
        if (meData.onboarded && meData.user_id) {
          router.replace(`/profile/${meData.user_id}`);
          return;
        }

        setSessionUserID((meData.user_id || '').trim());
        setFormData((prev) => ({
          ...prev,
          email: (meData.email || '').trim().toLowerCase(),
        }));
      } catch {
        // Ignore session load errors; onboarding still works for unauthenticated users.
      }
    };

    loadSession();
  }, [router]);

  const canProceed =
    step === 1
      ? Boolean(formData.displayName.trim())
      : step === 2
        ? Boolean(formData.basedIn)
        : step === 3
          ? Boolean(formData.countriesTraveled.trim())
          : step === 4
            ? Boolean(formData.email.trim())
            : linkSent;

  const handleNext = () => {
    if (step < totalSteps && canProceed) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const sendVerificationLink = async (keepCurrentStep: boolean) => {
    setLoading(true);
    setError('');

    try {
      if (sessionUserID) {
        const onboardRes = await apiFetchWithFallback('/api/auth/onboard', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            display_name: formData.displayName.trim(),
            based_in: formData.basedIn,
            countries_traveled: Number(formData.countriesTraveled),
          }),
        });

        if (!onboardRes.ok) {
          const onboardData = await onboardRes.json().catch(() => ({} as { error?: string }));
          setError(onboardData.error || 'Failed to complete onboarding. Please try again.');
          return;
        }

        router.push(`/profile/${sessionUserID}`);
        return;
      }

      if (!formData.email.trim()) {
        setError('Please enter your email.');
        return;
      }

      const verifyRes = await apiFetchWithFallback('/api/auth/magic-link/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email.trim().toLowerCase(),
          display_name: formData.displayName.trim(),
          based_in: formData.basedIn,
          countries_traveled: Number(formData.countriesTraveled),
        }),
      });

      if (!verifyRes.ok) {
        const verifyData = await verifyRes.json().catch(() => ({} as { error?: string }));
        setError(verifyData.error || 'Failed to send verification link. Please try again.');
        return;
      }

      setLinkSent(true);
      if (!keepCurrentStep) {
        setStep(5);
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="px-6 md:px-24 py-8 md:py-10">
        <div className="max-w-372 mx-auto flex items-center justify-between">
          <Link href="/" className="text-2xl font-semibold">
            travingat
          </Link>
          <Link href="/signin" className="px-5 py-2 rounded-full border border-[#2d2d2d] text-sm font-medium hover:border-white hover:text-white transition">Sign In</Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 md:px-24 pb-24">
        <div className="max-w-372 mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-start">
            {/* Left Side - Welcome */}
            <div className="space-y-8 lg:pt-24">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
                Welcome to
                <br />
                Travingat!
              </h1>

              {/* Image Grid */}
              <div className="flex gap-3 md:gap-4">
                {travelImages.map((src, i) => (
                  <div
                    key={i}
                    className="relative w-27 h-40 rounded-lg overflow-hidden bg-gray-800"
                  >
                    <img
                      src={src}
                      alt={`Travel ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>

              <p className="text-lg text-gray-400 max-w-md">
                Collect, organize, and share your travels — by countries and collections.
              </p>
            </div>

            {/* Right Side - Form */}
            <div className="lg:pt-24">
              <div className="bg-[#1a1a1a] rounded-2xl p-12 max-w-120">
                {/* Header */}
                <div className="mb-10">
                  <h2 className="text-3xl font-semibold mb-4">Profile setup</h2>

                  {/* Step Indicator */}
                  <div className="flex gap-1 w-48">
                    {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s) => (
                      <div
                        key={s}
                        className={`h-2 flex-1 rounded-full transition ${s === step
                          ? 'bg-orange-500'
                          : s < step
                            ? 'bg-orange-500/50'
                            : 'bg-gray-700'
                          }`}
                      />
                    ))}
                  </div>
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded px-4 py-3 mb-6 text-sm text-red-400 text-center">
                    {error}
                  </div>
                )}

                {/* Step Content */}
                <div className="space-y-10">
                  {step === 1 && (
                    <div>
                      <div className="mb-10">
                        <h3 className={`${fieldTitleClass} mb-2`}>Your display name</h3>
                        <p className={`${helperTextClass} text-[#646464]`}>
                          This is how your name will appear on your profile.
                        </p>
                      </div>
                      <input
                        type="text"
                        value={formData.displayName}
                        onChange={(e) =>
                          setFormData({ ...formData, displayName: e.target.value })
                        }
                        placeholder="Enter your name"
                        className={`w-full rounded-xl bg-black border border-gray-700 px-4 py-4 focus:outline-none focus:border-white transition placeholder:text-gray-600 ${fieldInputClass}`}
                      />
                    </div>
                  )}

                  {step === 2 && (
                    <div>
                      <div className="mb-10">
                        <h3 className={`${fieldTitleClass} mb-2`}>Based in</h3>
                        <p className={`${helperTextClass} text-[#767676]`}>
                          Your home base, shown on your profile.
                        </p>
                      </div>
                      <select
                        value={formData.basedIn}
                        onChange={(e) =>
                          setFormData({ ...formData, basedIn: e.target.value })
                        }
                        className={`w-full rounded-xl bg-black border border-gray-700 px-4 py-4 focus:outline-none focus:border-white transition appearance-none cursor-pointer ${fieldInputClass}`}
                      >
                        <option value="">Select country</option>
                        <option value="US">United States</option>
                        <option value="GB">United Kingdom</option>
                        <option value="CA">Canada</option>
                        <option value="AU">Australia</option>
                        <option value="DE">Germany</option>
                        <option value="FR">France</option>
                        <option value="JP">Japan</option>
                        <option value="IN">India</option>
                      </select>
                    </div>
                  )}

                  {step === 3 && (
                    <div>
                      <div className="mb-10">
                        <h3 className={`${fieldTitleClass} mb-2`}>Countries you&apos;ve traveled to</h3>
                        <p className={`${helperTextClass} text-[#767676]`}>You can update it anytime.</p>
                      </div>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={formData.countriesTraveled}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            countriesTraveled: e.target.value.replace(/\D/g, ''),
                          })
                        }
                        placeholder="Eg. 8"
                        className={`w-full rounded-xl bg-black border border-gray-700 px-4 py-4 focus:outline-none focus:border-white transition placeholder:text-gray-600 ${fieldInputClass}`}
                      />
                    </div>
                  )}

                  {step === 4 && (
                    <div>
                      <div className="mb-10">
                        <h3 className={`${fieldTitleClass} mb-2`}>{sessionUserID ? 'Ready to finish' : 'Email'}</h3>
                        <p className={`${helperTextClass} text-[#767676]`}>
                          {sessionUserID
                            ? 'Your account is signed in. Complete onboarding to continue.'
                            : 'We will send a verification link to this email.'}
                        </p>
                      </div>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        placeholder="Enter your email"
                        readOnly={Boolean(sessionUserID)}
                        className={`w-full rounded-xl bg-black border border-gray-700 px-4 py-4 focus:outline-none focus:border-white transition placeholder:text-gray-600 text-[28px] md:text-[36px] font-bold leading-[1.4] tracking-[-0.41px]`}
                      />
                    </div>
                  )}

                  {step === 5 && (
                    <div>
                      <div className="mb-8">
                        <h3 className={`${fieldTitleClass} mb-2`}>Verification</h3>
                        <p className={`${helperTextClass} text-[#767676]`}>
                          Open the verification link sent to {formData.email || 'your email'}.
                        </p>
                      </div>

                      <div className="rounded-xl border border-[#2d2d2d] bg-[#111] px-4 py-4 mb-6 text-sm text-[#cfcfcf] leading-relaxed">
                        After clicking the link in your inbox, your account will be verified and you can sign in.
                      </div>

                      {linkSent && (
                        <button
                          type="button"
                          onClick={() => sendVerificationLink(true)}
                          disabled={loading}
                          className="text-sm text-[#bcbcbc] hover:text-white underline underline-offset-4 disabled:opacity-50"
                        >
                          Resend verification link
                        </button>
                      )}
                    </div>
                  )}

                  {/* Buttons */}
                  <div className="flex items-center gap-4 pt-10">
                    {step > 1 && (
                      <button
                        onClick={handleBack}
                        className="w-11 h-11 flex items-center justify-center rounded border border-gray-700 hover:border-white transition"
                      >
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M15 18l-6-6 6-6" />
                        </svg>
                      </button>
                    )}
                    {sessionUserID && step === 3 ? (
                      <button
                        onClick={() => sendVerificationLink(false)}
                        disabled={loading || !canProceed}
                        className="flex-1 bg-white text-black py-3 rounded font-medium hover:bg-gray-100 transition ml-auto min-w-40 disabled:opacity-50"
                      >
                        {loading ? 'Finishing...' : 'Complete setup'}
                      </button>
                    ) : step < 4 ? (
                      <button
                        onClick={handleNext}
                        disabled={!canProceed}
                        className="flex-1 bg-white text-black py-3 rounded font-medium hover:bg-gray-100 transition ml-auto min-w-40 disabled:opacity-50"
                      >
                        Next
                      </button>
                    ) : step === 4 ? (
                      <button
                        onClick={() => sendVerificationLink(false)}
                        disabled={loading || !canProceed}
                        className="flex-1 bg-white text-black py-3 rounded font-medium hover:bg-gray-100 transition ml-auto min-w-40 disabled:opacity-50"
                      >
                        {loading ? 'Sending...' : 'Send verification link'}
                      </button>
                    ) : (
                      <Link
                        href="/signin"
                        className="flex-1 bg-white text-black py-3 rounded font-medium hover:bg-gray-100 transition ml-auto min-w-40 text-center"
                      >
                        Go to sign in
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
