'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { flags } from '@/lib/flags';
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
  location_name?: string;
  file_url: string;
  mime_type: string;
  caption: string;
  created_at: string;
};

type CountryMeta = {
  country_code: string;
  description: string;
};

const isUUIDLike = (value: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

export default function MediaViewerPage() {
  const params = useParams<{ id: string; mediaId: string }>();
  const searchParams = useSearchParams();

  const routeUserID = params?.id || '';
  const routeMediaID = params?.mediaId || '';

  const source = (searchParams.get('source') || 'country').toLowerCase();
  const sourceCountryCode = (searchParams.get('countryCode') || '').toUpperCase();
  const sourceCollectionID = searchParams.get('collectionId') || '';

  const [profile, setProfile] = useState<Profile | null>(null);
  const [allMedia, setAllMedia] = useState<MediaItem[]>([]);
  const [countryMetaByCode, setCountryMetaByCode] = useState<Record<string, CountryMeta>>({});
  const [videoViews, setVideoViews] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        if (!isUUIDLike(routeUserID)) {
          setError('Profile not found');
          return;
        }

        const [profileRes, mediaRes, countryMetaRes] = await Promise.all([
          fetch(`${API_URL}/api/public/profile/id/${routeUserID}`),
          fetch(`${API_URL}/api/public/media/user/${routeUserID}`),
          fetch(`${API_URL}/api/public/media/user/${routeUserID}/country-meta`),
        ]);

        const profileData = await profileRes.json();
        const mediaData = await mediaRes.json();
        const countryMetaData = await countryMetaRes.json();

        if (!profileRes.ok) {
          throw new Error(profileData.error || 'Failed to load profile');
        }
        if (!mediaRes.ok) {
          throw new Error(mediaData.error || 'Failed to load media');
        }
        if (!countryMetaRes.ok) {
          throw new Error(countryMetaData.error || 'Failed to load country metadata');
        }

        const mediaItems: MediaItem[] = Array.isArray(mediaData.items) ? mediaData.items : [];
        const metaItems: CountryMeta[] = Array.isArray(countryMetaData.items) ? countryMetaData.items : [];

        const metaMap: Record<string, CountryMeta> = {};
        for (const item of metaItems) {
          const code = (item.country_code || '').toUpperCase();
          if (!code) continue;
          metaMap[code] = item;
        }

        setProfile(profileData);
        setAllMedia(mediaItems);
        setCountryMetaByCode(metaMap);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load media viewer');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [routeUserID]);

  const scopedMedia = useMemo(() => {
    if (source === 'collection' && sourceCollectionID) {
      return allMedia.filter((item) => item.collection_id === sourceCollectionID);
    }

    if (source === 'country' && sourceCountryCode) {
      return allMedia.filter((item) => (item.country_code || '').toUpperCase() === sourceCountryCode);
    }

    return allMedia;
  }, [allMedia, source, sourceCollectionID, sourceCountryCode]);

  const currentIndex = useMemo(() => {
    return scopedMedia.findIndex((item) => item.id === routeMediaID);
  }, [scopedMedia, routeMediaID]);

  const currentMedia = currentIndex >= 0 ? scopedMedia[currentIndex] : null;
  const prevMedia = currentIndex > 0 ? scopedMedia[currentIndex - 1] : null;
  const nextMedia = currentIndex >= 0 && currentIndex < scopedMedia.length - 1 ? scopedMedia[currentIndex + 1] : null;

  useEffect(() => {
    if (!currentMedia || !routeMediaID) {
      setVideoViews(0);
      return;
    }

    if (!currentMedia.mime_type.startsWith('video/')) {
      setVideoViews(0);
      return;
    }

    const storageKey = `travingat:video-views:${routeMediaID}`;
    const raw = typeof window !== 'undefined' ? window.localStorage.getItem(storageKey) : null;
    const current = Number(raw || '0');
    const next = Number.isFinite(current) ? current + 1 : 1;

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(storageKey, String(next));
    }
    setVideoViews(next);
  }, [routeMediaID, currentMedia]);

  const currentCountryCode = (currentMedia?.country_code || sourceCountryCode || '').toUpperCase();
  const currentCountry = flags.find((flag) => flag.countryCode === currentCountryCode);
  const currentCountryName = currentCountry?.countryName || currentCountryCode || 'Unknown country';

  const lastUpdated = useMemo(() => {
    if (!currentMedia?.created_at) return '';
    const parsed = Date.parse(currentMedia.created_at);
    if (!Number.isFinite(parsed)) return '';
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(parsed));
  }, [currentMedia?.created_at]);

  const backHref = useMemo(() => {
    if (source === 'collection' && sourceCollectionID) {
      return `/profile/${routeUserID}/collection/${sourceCollectionID}`;
    }
    if (source === 'country' && sourceCountryCode) {
      return `/profile/${routeUserID}/country/${sourceCountryCode.toLowerCase()}`;
    }
    return `/profile/${routeUserID}`;
  }, [routeUserID, source, sourceCollectionID, sourceCountryCode]);

  const buildMediaHref = (mediaID: string) => {
    const base = `/profile/${routeUserID}/media/${mediaID}`;
    if (source === 'collection') {
      return `${base}?source=collection&collectionId=${encodeURIComponent(sourceCollectionID)}`;
    }
    return `${base}?source=country&countryCode=${encodeURIComponent(sourceCountryCode || currentCountryCode)}`;
  };

  const prevHref = prevMedia
    ? buildMediaHref(prevMedia.id)
    : '';

  const nextHref = nextMedia
    ? buildMediaHref(nextMedia.id)
    : '';

  if (loading) {
    return <div className="min-h-screen bg-black text-white grid place-items-center">Loading media...</div>;
  }

  if (error || !profile || !currentMedia) {
    return (
      <div className="min-h-screen bg-black text-white grid place-items-center px-6">
        <div className="text-center space-y-4">
          <p>{error || 'Media not found'}</p>
          <Link href={backHref} className="underline text-gray-300 hover:text-white">Back</Link>
        </div>
      </div>
    );
  }

  const countryDescription = countryMetaByCode[currentCountryCode]?.description || '';
  const profileName = profile.display_name || profile.username;

  return (
    <div className="min-h-[100dvh] bg-black text-white backdrop-blur-sm">
      <div className="mx-auto w-full max-w-[1800px] px-4 py-4 md:px-8 md:py-6 lg:px-10 lg:py-6">
        <div className="grid gap-6 lg:h-[calc(100dvh-3rem)] lg:grid-cols-[minmax(0,1fr)_400px]">
          <section className="min-w-0 lg:min-h-0">
            <div className="flex h-full flex-col gap-4">
              <div className="flex min-w-0 items-center justify-between gap-3 text-sm text-[#9f9f9f]">
                <div className="flex min-w-0 items-center gap-2">
                  <Link href={backHref} className="rounded-full border border-[#2f2f2f] bg-[#121212] px-3 py-1.5 text-xs text-[#dfdfdf] hover:bg-[#1a1a1a]">
                    Back
                  </Link>
                  <span className="text-[#4d4d4d]">|</span>
                  <span>{currentIndex + 1} of {scopedMedia.length}</span>
                </div>
                <span className="truncate text-right">{source === 'collection' ? 'Collection carousel' : 'Country carousel'}</span>
              </div>

              <div className="relative min-h-[420px] flex-1 rounded-3xl border border-[#242424] bg-[#080808] lg:min-h-0">
                <div className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-3xl">
                  {currentMedia.mime_type.startsWith('video/') ? (
                    <video src={currentMedia.file_url} controls autoPlay className="max-h-full w-auto max-w-full object-contain" />
                  ) : (
                    <Image src={currentMedia.file_url} alt="Media" className="max-h-full w-auto max-w-full object-contain" />
                  )}
                </div>

                {prevMedia ? (
                  <Link
                    href={prevHref}
                    className="absolute left-3 top-1/2 z-20 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-[#3a3a3a] bg-black/65 text-white hover:bg-black"
                    aria-label="Previous media"
                  >
                    <span className="material-symbols-rounded text-[19px]">arrow_back_ios_new</span>
                  </Link>
                ) : null}

                {nextMedia ? (
                  <Link
                    href={nextHref}
                    className="absolute right-3 top-1/2 z-20 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-[#3a3a3a] bg-black/65 text-white hover:bg-black"
                    aria-label="Next media"
                  >
                    <span className="material-symbols-rounded text-[19px]">arrow_forward_ios</span>
                  </Link>
                ) : null}
              </div>

              {scopedMedia.length > 1 ? (
                <div className="-mx-1 max-w-full overflow-x-auto pb-1">
                  <div className="flex min-w-max items-center gap-2 px-1">
                    {scopedMedia.map((item, idx) => {
                      const isActive = item.id === currentMedia.id;
                      return (
                        <Link
                          key={item.id}
                          href={buildMediaHref(item.id)}
                          className={`group relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border transition md:h-20 md:w-20 ${isActive ? 'border-white/90 ring-1 ring-white/40' : 'border-[#2a2a2a] hover:border-[#666]'
                            }`}
                          aria-label={`Open media ${idx + 1}`}
                        >
                          {item.mime_type.startsWith('video/') ? (
                            <video src={`${item.file_url}#t=0.1`} muted preload="metadata" className="h-full w-full object-cover" />
                          ) : (
                            <Image src={item.file_url} alt="Media thumbnail" className="h-full w-full object-cover" />
                          )}
                          <span className="absolute inset-x-0 bottom-0 bg-black/65 px-1 py-[2px] text-center text-[10px] text-white">
                            {idx + 1}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </div>
          </section>

          <aside className="w-full min-w-0 rounded-2xl border border-[#2a2a2a] bg-[#111] p-6 sm:p-8 lg:h-full lg:min-h-0 lg:overflow-y-auto">
            <div className="space-y-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 overflow-hidden rounded-xl bg-[#1e1e1e]">
                    {profile.avatar_url ? <Image src={profile.avatar_url} alt={profileName} className="h-full w-full object-cover" /> : null}
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-[#bcbcbc]">@{profile.username || profileName}</p>
                    <div className="flex items-center gap-2 text-sm text-[#9d9d9d]">
                      {currentCountry ? (
                        <Image src={currentCountry.path} alt={`${currentCountryName} flag`} className="h-4 w-6 rounded-sm object-cover" />
                      ) : null}
                      <span>{currentCountryName}</span>
                    </div>
                  </div>
                </div>
                <Link href={backHref} className="text-[#a7a7a7] hover:text-white" aria-label="Close viewer">
                  <span className="material-symbols-rounded">close</span>
                </Link>
              </div>

              <div className="rounded-xl border border-[#252525] bg-[#171717] p-4">
                <p className="text-xs uppercase tracking-[0.08em] text-[#7d7d7d]">Media details</p>
                <div className="mt-3 space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[#a9a9a9]">Position</span>
                    <span className="font-medium text-[#efefef]">{currentIndex + 1}/{scopedMedia.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#a9a9a9]">Uploaded</span>
                    <span className="font-medium text-[#efefef]">{lastUpdated || 'Recently'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#a9a9a9]">Type</span>
                    <span className="font-medium text-[#efefef]">{currentMedia.mime_type.startsWith('video/') ? 'Video' : 'Photo'}</span>
                  </div>
                  {currentMedia.mime_type.startsWith('video/') ? (
                    <div className="flex items-center justify-between">
                      <span className="text-[#a9a9a9]">Views</span>
                      <span className="font-medium text-[#efefef]">{videoViews}</span>
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="space-y-2 border-t border-[#242424] pt-6">
                <p className="text-base font-medium text-white">{source === 'collection' ? 'Collection context' : currentCountryName}</p>
                <p className="text-sm text-[#8f8f8f]">
                  {source === 'collection'
                    ? 'Viewing media from this collection sequence.'
                    : countryDescription || 'No country description added yet.'}
                </p>
              </div>

              <div className="space-y-2 border-t border-[#242424] pt-6">
                <p className="text-base font-medium text-white">Caption</p>
                <p className="whitespace-pre-line text-sm text-[#a0a0a0]">
                  {currentMedia.caption?.trim() || 'No caption added for this media.'}
                </p>
                {currentMedia.location_name ? <p className="text-xs text-[#7a7a7a]">Location: {currentMedia.location_name}</p> : null}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
