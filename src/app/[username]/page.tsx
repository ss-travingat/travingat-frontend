import { notFound, redirect } from 'next/navigation';
import { API_URL } from '@/lib/api-client';

type PublicProfile = {
  user_id: string;
  username: string;
};

type RouteParams = {
  username: string;
};

const RESERVED_SEGMENTS = new Set([
  'admin',
  'api',
  'blog',
  'demo',
  'flag-test',
  'flags-demo',
  'onboarding',
  'profile',
  'profile-example',
  'signin',
  'signup',
  'upload',
  'verify-email',
]);

export default async function UsernameProfileRedirectPage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { username: rawUsername } = await params;
  const username = (rawUsername || '').trim().toLowerCase();

  if (!username || RESERVED_SEGMENTS.has(username)) {
    notFound();
  }

  const res = await fetch(`${API_URL}/api/public/profile/${encodeURIComponent(username)}`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    notFound();
  }

  const profile = (await res.json()) as PublicProfile;
  if (!profile?.user_id) {
    notFound();
  }

  redirect(`/profile/${profile.user_id}`);
}
