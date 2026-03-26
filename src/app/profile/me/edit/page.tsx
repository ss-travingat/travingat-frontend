'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/auth-client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

type MeResponse = {
  user_id: string;
};

export default function RedirectMeEditPage() {
  const router = useRouter();

  useEffect(() => {
    const redirectToUUIDEdit = async () => {
      try {
        const res = await apiFetch(`${API_URL}/api/auth/me`);
        if (res.status === 401) {
          router.replace('/signin');
          return;
        }

        const data: MeResponse = await res.json();
        if (!res.ok || !data.user_id) {
          router.replace('/signin');
          return;
        }

        router.replace(`/profile/${data.user_id}/edit`);
      } catch {
        router.replace('/signin');
      }
    };

    redirectToUUIDEdit();
  }, [router]);

  return <div className="min-h-screen bg-black text-white grid place-items-center">Redirecting...</div>;
}
