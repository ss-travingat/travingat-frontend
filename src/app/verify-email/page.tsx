import { Suspense } from 'react';
import VerifyEmailClient from './VerifyEmailClient';

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black text-white grid place-items-center px-6">
          <p>Loading...</p>
        </div>
      }
    >
      <VerifyEmailClient />
    </Suspense>
  );
}
