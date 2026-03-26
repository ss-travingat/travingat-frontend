'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { flags } from '@/lib/flags';
import { apiFetch } from '@/lib/auth-client';
import Image from 'next/image';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const COUNTRIES_EMPTY_PREVIEW_IMAGES = [
  'https://www.figma.com/api/mcp/asset/ce0e8660-fd4e-4e06-ba46-215fafae0a09',
  'https://www.figma.com/api/mcp/asset/4b2f6f35-de14-45dc-bd56-9d15ae9ad29a',
  'https://www.figma.com/api/mcp/asset/071f9986-88fd-4358-a0e0-d48eb4474138',
] as const;

type Profile = {
  user_id: string;
  username: string;
  display_name: string;
  based_in: string;
  countries_traveled: number;
  bio: string;
  avatar_url: string;
  cover_image_url: string;
};

export default function MyProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiFetch(`${API_URL}/api/profile/me`);

        if (res.status === 401) {
          window.location.href = '/signin';
          return;
        }

        const data = await res.json();
        if (!res.ok) {
          setError(data.error || 'Failed to load profile');
          return;
        }

        setProfile(data);
      } catch {
        setError('Network error. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const basedInFlagPath = useMemo(() => {
    if (!profile?.based_in) return null;
    const match = flags.find(
      (flag) => flag.countryName.toLowerCase() === profile.based_in.toLowerCase()
    );
    return match?.path || null;
  }, [profile?.based_in]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white grid place-items-center px-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="media-plane-loader" aria-hidden="true">
            <div className="media-plane-loader__ring" />
            <div className="media-plane-loader__plane-wrap">
              <span className="media-plane-loader__trail" />
              <svg className="media-plane-loader__plane" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M21 16v-2l-8-5V3.5A1.5 1.5 0 0 0 11.5 2 1.5 1.5 0 0 0 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5L21 16Z" fill="currentColor" />
              </svg>
            </div>
          </div>
          <p className="text-sm text-white/80">flying to your destination</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-black text-white grid place-items-center px-6">
        <div className="text-center space-y-4">
          <p>{error || 'Profile not found'}</p>
          <Link href="/onboarding" className="underline text-gray-300 hover:text-white">Go to onboarding</Link>
        </div>
      </div>
    );
  }

  const displayName = profile.display_name || profile.username;
  const countries = profile.countries_traveled || 0;
  const maxCountries = 8;
  const progressCountries = Math.min(countries, maxCountries);
  const basedIn = profile.based_in || 'Not set';
  const handle = profile.username ? `@${profile.username}` : '@username';
  const hasEmptyState = countries === 0;

  return (
    <div className="min-h-screen bg-black text-white px-5 md:px-12 lg:px-20 py-10">
      <div className="max-w-6xl mx-auto grid gap-10">
        <div className="w-full border-y border-[#1f1f1f] py-3 flex items-center justify-center">
          <div className="text-[16px] tracking-[-0.41px] leading-none flex items-center gap-1">
            <span className="text-white font-medium">{progressCountries}</span>
            <span className="text-[#606060]">/{maxCountries}</span>
            <span className="text-white">Countries added</span>
            <Link href={`/profile/${profile.user_id}/edit`} className="text-white/80 hover:text-white transition" aria-label="Edit profile">
              <span className="text-sm">✎</span>
            </Link>
          </div>
        </div>

        <section className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[#989898] text-[18px] tracking-[-0.2px] leading-[26px]">
              {basedInFlagPath ? (
                <Image src={basedInFlagPath} alt={`${basedIn} flag`} className="w-6 h-4 rounded-[4px] object-cover" />
              ) : (
                <span className="inline-block w-6 h-4 rounded-[4px] bg-[#222222]" />
              )}
              <span>{basedIn}</span>
            </div>

            <h1 className="text-[42px] md:text-[44px] leading-[1.15] tracking-[-0.5px] font-semibold text-white">
              {displayName}
            </h1>

            <div className="flex items-center gap-2 text-[#989898]">
              <p className="text-[24px] leading-[32px] tracking-[-0.5px]">{handle}</p>
              <Link href={`/profile/${profile.user_id}/edit`} className="text-white/80 hover:text-white transition" aria-label="Edit profile details">
                <span className="text-lg">✎</span>
              </Link>
            </div>
          </div>

          <div className="w-full rounded-2xl border-l border-[#353535] bg-gradient-to-r from-[#1c1c1c] to-[rgba(0,0,0,0.1)] px-4 py-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-10">
              <div className="flex items-center gap-4">
                <div className="w-[60px] h-[60px] rounded-xl bg-[#232323] grid place-items-center">
                  <span className="material-symbols-rounded text-[#a8a8a8] text-[22px]">public</span>
                </div>
                <div>
                  <p className="text-[24px] leading-[32px] tracking-[-0.5px] text-white font-semibold">{countries}</p>
                  <p className="text-[14px] leading-5 tracking-[-0.08px] text-[#989898]">Countries</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-[60px] h-[60px] rounded-xl bg-[#232323] grid place-items-center">
                  <span className="material-symbols-rounded text-[#a8a8a8] text-[22px]">photo_library</span>
                </div>
                <div>
                  <p className="text-[24px] leading-[32px] tracking-[-0.5px] text-white font-semibold">0</p>
                  <p className="text-[14px] leading-5 tracking-[-0.08px] text-[#989898]">All media</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-[60px] h-[60px] rounded-xl bg-[#232323] grid place-items-center">
                  <span className="material-symbols-rounded text-[#a8a8a8] text-[22px]">collections_bookmark</span>
                </div>
                <div>
                  <p className="text-[24px] leading-[32px] tracking-[-0.5px] text-white font-semibold">0</p>
                  <p className="text-[14px] leading-5 tracking-[-0.08px] text-[#989898]">Collections</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="flex items-center justify-center gap-2 flex-wrap">
          <span className="px-6 py-2.5 rounded-full bg-[#161616] text-[#a8a8a8] text-[16px] tracking-[-0.41px]">All media</span>
          <span className="px-6 py-2.5 rounded-full bg-[#1d1d1d] border border-white text-white text-[16px] tracking-[-0.41px] font-medium">Countries</span>
          <span className="px-6 py-2.5 rounded-full bg-[#161616] text-[#a8a8a8] text-[16px] tracking-[-0.41px]">Collections</span>
          <span className="px-6 py-2.5 rounded-full bg-[#161616] text-[#a8a8a8] text-[16px] tracking-[-0.41px]">About me</span>
        </div>

        <section className="pt-6">
          <div className="space-y-8">
            <div className="flex items-center justify-center gap-2 text-[16px] tracking-[-0.41px]">
              <span className="h-px flex-1 bg-[#1f1f1f]" />
              <div className="flex items-center gap-1">
                <span className="text-white font-medium">{countries}</span>
                <span className="text-[#606060]">/{maxCountries}</span>
              </div>
              <span className="text-white">Countries added</span>
              <span className="material-symbols-rounded text-[#9a9a9a] text-[16px]">edit</span>
              <span className="h-px flex-1 bg-[#1f1f1f]" />
            </div>

            <div className="rounded-2xl border border-dashed border-[#2b2b2b] bg-[#0e0e0e] p-10 md:p-16">
              <div className="max-w-[600px] mx-auto flex flex-col items-center gap-6 text-center">
                <div className="flex items-center gap-3">
                  {COUNTRIES_EMPTY_PREVIEW_IMAGES.map((src, index) => (
                    <div key={src} className="w-[76px] h-[76px] md:w-[100px] md:h-[100px] rounded-[10px] overflow-hidden">
                      <Image src={src} alt={`Travel sample ${index + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <h2 className="text-[24px] leading-[1.4] tracking-[-0.41px] font-semibold text-white">
                    {hasEmptyState ? 'Add your first country' : 'Add your next country'}
                  </h2>
                  <p className="text-[16px] leading-[1.5] tracking-[-0.41px] text-[#a8a8a8]">
                    {hasEmptyState
                      ? 'Start with your favorite country - you can add the rest later.'
                      : 'Keep building your map by adding another country.'}
                  </p>
                </div>

                <Link
                  href={`/profile/${profile.user_id}/edit`}
                  className="w-[148px] bg-white text-black rounded-full px-6 py-3 text-sm font-medium tracking-[-0.408px] hover:bg-gray-200 transition"
                >
                  Add Country
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-[#1f1f1f] p-6 bg-[#0d0d0d]">
          <h3 className="text-xl font-semibold mb-3">Bio</h3>
          <p className="text-[#b7b7b7] leading-7">{profile.bio || 'No bio yet. Add your travel story from Edit profile.'}</p>
        </section>
      </div>
    </div>
  );
}
