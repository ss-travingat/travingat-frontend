'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { apiFetch } from '@/lib/auth-client';
import Image from 'next/image';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

type Profile = {
  user_id: string;
  username: string;
  display_name: string;
  avatar_url: string;
};

type MediaItem = {
  id: string;
  collection_id?: string;
  country_code: string;
  file_url: string;
  caption: string;
  mime_type: string;
  created_at: string;
};

type MeResponse = {
  user_id: string;
};

const isUUIDLike = (value: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

export default function ArchivePage() {
  const params = useParams<{ id: string }>();
  const routeUserID = params?.id || '';

  const [profile, setProfile] = useState<Profile | null>(null);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [openMenuMediaID, setOpenMenuMediaID] = useState('');
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (!menuRef.current) return;
      if (menuRef.current.contains(event.target as Node)) return;
      setOpenMenuMediaID('');
    };

    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        if (!isUUIDLike(routeUserID)) {
          setError('Profile not found');
          return;
        }

        let owner = false;
        try {
          const meRes = await apiFetch(`${API_URL}/api/auth/me`);
          if (meRes.ok) {
            const meData: MeResponse = await meRes.json();
            owner = meData.user_id === routeUserID;
          }
        } catch {
          owner = false;
        }

        const [profileRes, mediaRes] = await Promise.all([
          fetch(`${API_URL}/api/public/profile/id/${routeUserID}`),
          owner ? apiFetch(`${API_URL}/api/media/archive`) : Promise.resolve(null),
        ]);

        const profileData = await profileRes.json();
        const mediaData = mediaRes ? await mediaRes.json() : null;

        if (!profileRes.ok) {
          throw new Error(profileData.error || 'Failed to load profile');
        }
        if (!owner) {
          throw new Error('Archive is private and only visible to the profile owner');
        }
        if (!mediaRes || !mediaRes.ok) {
          throw new Error(mediaData.error || 'Failed to load media');
        }

        setProfile(profileData);
        setMediaItems(Array.isArray(mediaData.items) ? mediaData.items : []);
        setIsOwner(owner);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load archive');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [routeUserID]);

  const removeFromArchive = async (mediaID: string) => {
    if (!isOwner) return;

    const previousItems = mediaItems;
    setMediaItems((prev) => prev.filter((item) => item.id !== mediaID));
    setOpenMenuMediaID('');

    try {
      const res = await apiFetch(`${API_URL}/api/media/${mediaID}/archive`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to remove media from archive');
      }
    } catch (err) {
      setMediaItems(previousItems);
      setError(err instanceof Error ? err.message : 'Failed to remove media from archive');
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-black text-white grid place-items-center">Loading archive...</div>;
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-black text-white grid place-items-center px-6">
        <div className="text-center space-y-4">
          <p>{error || 'Archive not available'}</p>
          <Link href={`/profile/${routeUserID}`} className="underline text-gray-300 hover:text-white">
            Back to profile
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white px-4 py-6 md:px-8 md:py-8">
      <div className="mx-auto w-full max-w-[1488px] space-y-6">
        <header className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-[-0.4px]">Archived Media</h1>
            <p className="text-sm text-[#8f8f8f] mt-1">@{profile.username || profile.display_name}</p>
          </div>
          <Link
            href={`/profile/${routeUserID}`}
            className="rounded-full border border-[#363636] bg-[#181818] px-4 py-2 text-xs font-medium text-[#ececec] hover:bg-[#202020]"
          >
            Back to Profile
          </Link>
        </header>

        {mediaItems.length === 0 ? (
          <section className="rounded-2xl border border-dashed border-[#2b2b2b] bg-[#0e0e0e] p-10 md:p-16 text-center text-[#8e8e8e]">
            No archived media yet.
          </section>
        ) : (
          <section className="columns-2 md:columns-3 xl:columns-4 gap-4 space-y-4">
            {mediaItems.map((item) => (
              <div
                key={item.id}
                className="group relative break-inside-avoid rounded-2xl overflow-hidden border border-[#1f1f1f] bg-[#111]"
                ref={openMenuMediaID === item.id ? menuRef : undefined}
              >
                <Link
                  href={
                    item.collection_id
                      ? `/profile/${routeUserID}/media/${item.id}?source=collection&collectionId=${encodeURIComponent(item.collection_id)}`
                      : `/profile/${routeUserID}/media/${item.id}?source=country&countryCode=${encodeURIComponent((item.country_code || '').toUpperCase())}`
                  }
                  className="block"
                >
                  {item.mime_type?.startsWith('video/') ? (
                    <video src={item.file_url} muted playsInline preload="metadata" className="w-full object-cover" />
                  ) : (
                    <Image src={item.file_url} alt="Archived media" loading="lazy" decoding="async" className="w-full object-cover" />
                  )}
                </Link>

                <button
                  type="button"
                  aria-label="Media actions"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    setOpenMenuMediaID((current) => (current === item.id ? '' : item.id));
                  }}
                  className="absolute right-3 top-3 z-10 h-8 w-8 rounded-full border border-[#3c3c3c] bg-[rgba(10,10,10,0.85)] text-white grid place-items-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <span className="material-symbols-rounded text-[16px]">more_horiz</span>
                </button>

                {openMenuMediaID === item.id ? (
                  <div className="absolute right-3 top-12 z-20 min-w-[190px] rounded-xl border border-[#2f2f2f] bg-[#0f0f10] p-2 shadow-[0_14px_30px_rgba(0,0,0,0.45)]">
                    <button
                      type="button"
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        void removeFromArchive(item.id);
                      }}
                      className="w-full rounded-lg px-3 py-2 text-left text-sm text-[#dfdfdf] hover:bg-[#1a1a1a]"
                    >
                      Remove from archive
                    </button>
                  </div>
                ) : null}
              </div>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}
