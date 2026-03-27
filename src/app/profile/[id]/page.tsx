'use client';

import { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { apiFetch, clearAccessToken } from '@/lib/auth-client';
import { API_URL, apiFetchWithFallback } from '@/lib/api-client';
import { flags, searchFlagsByName } from '@/lib/flags';
/* eslint-disable @next/next/no-img-element */

const COUNTRIES_EMPTY_PREVIEW_IMAGES = [
  'https://www.figma.com/api/mcp/asset/ce0e8660-fd4e-4e06-ba46-215fafae0a09',
  'https://www.figma.com/api/mcp/asset/4b2f6f35-de14-45dc-bd56-9d15ae9ad29a',
  'https://www.figma.com/api/mcp/asset/071f9986-88fd-4358-a0e0-d48eb4474138',
] as const;

const COLLECTIONS_EMPTY_PREVIEW_IMAGES = [
  'https://www.figma.com/api/mcp/asset/01d17a3e-a34f-49e9-930e-4e25959b76ce',
  'https://www.figma.com/api/mcp/asset/0580dfdc-0f63-480d-bb05-c5511fbbd616',
  'https://www.figma.com/api/mcp/asset/b0fa8255-0f32-4ca7-8b7d-4e47ceb96258',
] as const;

const PROFILE_STATS_ICONS = {
  countries: 'https://www.figma.com/api/mcp/asset/3cf742e9-1801-4c37-bfec-7513ed62c6a7',
  allMedia: 'https://www.figma.com/api/mcp/asset/0a1ff485-b22a-4541-8d4a-29acfde0a276',
  collections: 'https://www.figma.com/api/mcp/asset/42274c3e-58ff-4e91-82c9-3b13f2bce0f1',
} as const;

const UPLOAD_QUOTES = [
  'Preserving your memories...',
  'Pinning this moment to your map...',
  'Saving your travel story...',
  'A new memory is being added...',
  'Keeping this adventure safe...',
] as const;

const ALL_MEDIA_PAGE_SIZE = 10;
const PAGE_ASSET_PRELOAD_TIMEOUT_MS = 4500;
const PAGE_LOAD_WAIT_TIMEOUT_MS = 2500;

type MeResponse = {
  user_id: string;
};

type SessionRole = 'owner' | 'authenticated_viewer' | 'public_viewer';

type Profile = {
  user_id: string;
  username: string;
  display_name: string;
  based_in: string;
  homeland?: string;
  currently_in?: string;
  countries_traveled: number;
  bio: string;
  avatar_url: string;
  cover_image_url: string;
  interests?: string[];
  languages?: string[];
  photo_urls?: string[];
  social_links?: {
    instagram?: string;
    facebook?: string;
    x?: string;
    linkedin?: string;
    youtube?: string;
  };
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

type MediaListResponse = {
  items?: MediaItem[];
  count?: number;
  total_count?: number;
  error?: string;
};

type Visit = {
  country_code: string;
};

type PendingUpload = {
  id: string;
  file: File;
  preview: string;
  mimeType: string;
};

type SelectedLocation = {
  name: string;
  lat: number;
  lng: number;
};

type OSMSearchItem = {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
};

type CountryMeta = {
  country_code: string;
  description: string;
  thumbnail_media_id?: string;
  thumbnail_file_url: string;
};

type Collection = {
  id: string;
  title: string;
  description: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
};

function getLowQualityMediaURL(url: string) {
  if (!url) return url;
  if (url.includes('/cdn-cgi/image/')) return url;
  return `/cdn-cgi/image/width=320,quality=35,format=auto/${url}`;
}

function resolveUploadMimeType(file: File) {
  const provided = (file.type || '').toLowerCase().trim();
  const isGenericProvided =
    provided === 'application/octet-stream' ||
    provided === 'binary/octet-stream' ||
    provided === 'application/binary';
  if (provided && !isGenericProvided) return provided;

  const name = (file.name || '').toLowerCase();
  if (name.endsWith('.jpg') || name.endsWith('.jpeg')) return 'image/jpeg';
  if (name.endsWith('.png')) return 'image/png';
  if (name.endsWith('.webp')) return 'image/webp';
  if (name.endsWith('.heic')) return 'image/heic';
  if (name.endsWith('.mp4')) return 'video/mp4';
  if (name.endsWith('.mov')) return 'video/quicktime';
  if (name.endsWith('.webm')) return 'video/webm';
  if (name.endsWith('.m4v')) return 'video/x-m4v';
  if (name.endsWith('.3gp')) return 'video/3gpp';
  if (name.endsWith('.3g2')) return 'video/3gpp2';
  if (name.endsWith('.avi')) return 'video/x-msvideo';

  return 'application/octet-stream';
}

async function uploadViaBackend(file: File, countryCode: string, location: SelectedLocation | null, caption = '') {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('country_code', countryCode);
  formData.append('caption', caption);
  if (location) {
    formData.append('location_name', location.name);
    formData.append('location_lat', String(location.lat));
    formData.append('location_lng', String(location.lng));
  }

  const res = await apiFetchWithFallback('/api/media/upload', {
    method: 'POST',
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Server upload fallback failed');
  }

  return data as MediaItem;
}

function waitForPageLoad(timeoutMs = PAGE_LOAD_WAIT_TIMEOUT_MS) {
  if (typeof window === 'undefined') return Promise.resolve();
  if (document.readyState === 'complete') return Promise.resolve();

  return new Promise<void>((resolve) => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      window.clearTimeout(timer);
      window.removeEventListener('load', onLoad);
      resolve();
    };

    const onLoad = () => finish();
    const timer = window.setTimeout(finish, timeoutMs);
    window.addEventListener('load', onLoad, { once: true });
  });
}

function preloadImageAsset(url: string, timeoutMs = PAGE_ASSET_PRELOAD_TIMEOUT_MS) {
  const normalized = (url || '').trim();
  if (!normalized) return Promise.resolve();
  if (typeof window === 'undefined') return Promise.resolve();

  return new Promise<void>((resolve) => {
    const img = new window.Image();
    let done = false;

    const finish = () => {
      if (done) return;
      done = true;
      window.clearTimeout(timer);
      img.onload = null;
      img.onerror = null;
      resolve();
    };

    const timer = window.setTimeout(finish, timeoutMs);

    img.decoding = 'async';
    img.onload = finish;
    img.onerror = finish;
    img.src = normalized;

    if (img.complete) {
      finish();
    }
  });
}

function buildCriticalAssetURLs(profileData: Profile | null, media: MediaItem[], visitItems: Visit[]) {
  const urls: string[] = [];

  if (profileData) {
    if (profileData.avatar_url) urls.push(profileData.avatar_url);
    if (profileData.cover_image_url) urls.push(profileData.cover_image_url);
    if (Array.isArray(profileData.photo_urls)) {
      urls.push(...profileData.photo_urls.filter(Boolean).slice(0, 4));
    }
  }

  const imageMedia = media
    .filter((item) => item.mime_type?.startsWith('image/') && Boolean(item.file_url))
    .slice(0, ALL_MEDIA_PAGE_SIZE)
    .map((item) => getLowQualityMediaURL(item.file_url));
  urls.push(...imageMedia);

  const visitCodes = Array.from(new Set(visitItems.map((visit) => (visit.country_code || '').toUpperCase()).filter(Boolean)));
  const headerFlags = visitCodes
    .map((code) => flags.find((entry) => entry.countryCode === code)?.path)
    .filter((path): path is string => Boolean(path))
    .slice(0, 24);
  urls.push(...headerFlags);

  urls.push(...Object.values(PROFILE_STATS_ICONS));

  return Array.from(new Set(urls.filter(Boolean)));
}

async function waitForProfilePageReadiness(profileData: Profile | null, media: MediaItem[], visits: Visit[]) {
  const criticalURLs = buildCriticalAssetURLs(profileData, media, visits);
  await Promise.allSettled([
    waitForPageLoad(),
    ...criticalURLs.map((url) => preloadImageAsset(url)),
  ]);
}

export default function UserProfilePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const routeUserID = params?.id || '';
  const [viewerUserID, setViewerUserID] = useState('');
  const [sessionRole, setSessionRole] = useState<SessionRole>('public_viewer');

  const [profile, setProfile] = useState<Profile | null>(null);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [countryMetaByCode, setCountryMetaByCode] = useState<Record<string, CountryMeta>>({});
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [activeTab, setActiveTab] = useState<'all' | 'countries' | 'collections' | 'about'>('all');
  const [showNavMenu, setShowNavMenu] = useState(false);
  const [showArchivedMediaOnly, setShowArchivedMediaOnly] = useState(false);
  const [archivedMediaIDs, setArchivedMediaIDs] = useState<Set<string>>(new Set());
  const [openMediaCardMenuID, setOpenMediaCardMenuID] = useState('');
  const [initializedFromQuery, setInitializedFromQuery] = useState(false);
  const [queryTab, setQueryTab] = useState('');

  const [queryEditor, setQueryEditor] = useState('');

  const [showCountryEditor, setShowCountryEditor] = useState(false);
  const [editorTab, setEditorTab] = useState<'media' | 'about'>('media');
  const [countryInput, setCountryInput] = useState('');
  const [selectedCountryCode, setSelectedCountryCode] = useState('');
  const [showCountrySuggestions, setShowCountrySuggestions] = useState(false);
  const [locationInput, setLocationInput] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<SelectedLocation | null>(null);
  const [locationSuggestions, setLocationSuggestions] = useState<OSMSearchItem[]>([]);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [isLoadingLocationSuggestions, setIsLoadingLocationSuggestions] = useState(false);
  const [aboutText, setAboutText] = useState('');
  const [visitMonth, setVisitMonth] = useState('');
  const [visitYear, setVisitYear] = useState('');
  const [pendingUploads, setPendingUploads] = useState<PendingUpload[]>([]);
  const [selectedUploadID, setSelectedUploadID] = useState('');
  const [savingCountry, setSavingCountry] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [, setUploadMessage] = useState('');
  const [uploadQuoteIndex, setUploadQuoteIndex] = useState(0);
  const [editorError, setEditorError] = useState('');
  const [uploadingProfileAsset, setUploadingProfileAsset] = useState<'avatar' | 'cover' | null>(null);
  const [mediaTotalCount, setMediaTotalCount] = useState(0);
  const [loadingMoreMedia, setLoadingMoreMedia] = useState(false);
  const [loadedMediaPreviewIDs, setLoadedMediaPreviewIDs] = useState<Set<string>>(new Set());

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const coverInputRef = useRef<HTMLInputElement | null>(null);
  const navMenuRef = useRef<HTMLDivElement | null>(null);
  const mediaCardMenuRef = useRef<HTMLDivElement | null>(null);
  const videoPreviewTimersRef = useRef<Map<HTMLVideoElement, number>>(new Map());
  const latestCountryInputRef = useRef('');
  const latestSelectedCountryCodeRef = useRef('');

  const clearVideoPreviewTimer = (video: HTMLVideoElement) => {
    const existingTimer = videoPreviewTimersRef.current.get(video);
    if (existingTimer) {
      window.clearTimeout(existingTimer);
      videoPreviewTimersRef.current.delete(video);
    }
  };

  const startVideoPreview = (video: HTMLVideoElement | null) => {
    if (!video) return;

    clearVideoPreviewTimer(video);
    video.currentTime = 0;
    video.muted = true;
    video.playsInline = true;

    void video.play().catch(() => {
      // Ignore autoplay restrictions in browsers that block muted preview play.
    });

    const timeoutID = window.setTimeout(() => {
      video.pause();
      video.currentTime = 0;
      videoPreviewTimersRef.current.delete(video);
    }, 5000);

    videoPreviewTimersRef.current.set(video, timeoutID);
  };

  const stopVideoPreview = (video: HTMLVideoElement | null) => {
    if (!video) return;
    clearVideoPreviewTimer(video);
    video.pause();
    video.currentTime = 0;
  };

  const onMediaCardMouseEnter = (event: React.MouseEvent<HTMLElement>) => {
    const video = event.currentTarget.querySelector('video');
    startVideoPreview(video);
  };

  const onMediaCardMouseLeave = (event: React.MouseEvent<HTMLElement>) => {
    const video = event.currentTarget.querySelector('video');
    stopVideoPreview(video);
  };

  const markMediaPreviewLoaded = (mediaID: string) => {
    setLoadedMediaPreviewIDs((prev) => {
      if (prev.has(mediaID)) return prev;
      const next = new Set(prev);
      next.add(mediaID);
      return next;
    });
  };

  useEffect(() => {
    const timers = videoPreviewTimersRef.current;
    return () => {
      for (const timeoutID of timers.values()) {
        window.clearTimeout(timeoutID);
      }
      timers.clear();
    };
  }, []);

  useEffect(() => {
    if (!showNavMenu) return;

    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (navMenuRef.current && !navMenuRef.current.contains(target)) {
        setShowNavMenu(false);
      }
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
    };
  }, [showNavMenu]);

  useEffect(() => {
    if (!openMediaCardMenuID) return;

    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (mediaCardMenuRef.current && !mediaCardMenuRef.current.contains(target)) {
        setOpenMediaCardMenuID('');
      }
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
    };
  }, [openMediaCardMenuID]);

  useEffect(() => {
    const query = locationInput.trim();
    const country = selectedCountryCode.trim().toLowerCase();

    if (!query || !country) {
      setLocationSuggestions([]);
      setIsLoadingLocationSuggestions(false);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setIsLoadingLocationSuggestions(true);
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=6&addressdetails=1&countrycodes=${encodeURIComponent(country)}&q=${encodeURIComponent(query)}`;
        const res = await fetch(url, {
          method: 'GET',
          headers: { 'Accept-Language': 'en' },
          signal: controller.signal,
        });
        if (!res.ok) {
          setLocationSuggestions([]);
          return;
        }
        const data = await res.json();
        setLocationSuggestions(Array.isArray(data) ? data : []);
      } catch {
        setLocationSuggestions([]);
      } finally {
        setIsLoadingLocationSuggestions(false);
      }
    }, 320);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [locationInput, selectedCountryCode]);

  useEffect(() => {
    if (!savingCountry) {
      setUploadQuoteIndex(0);
      return;
    }

    const timer = window.setInterval(() => {
      setUploadQuoteIndex((prev) => (prev + 1) % UPLOAD_QUOTES.length);
    }, 2000);

    return () => window.clearInterval(timer);
  }, [savingCountry]);

  const loadAll = async () => {
    const [profileRes, mediaRes, visitsRes, countryMetaRes, collectionsRes, archivedRes] = await Promise.all([
      apiFetch(`${API_URL}/api/profile/me`),
      apiFetch(`${API_URL}/api/media?limit=${ALL_MEDIA_PAGE_SIZE}&offset=0`),
      apiFetch(`${API_URL}/api/visits`),
      apiFetch(`${API_URL}/api/media/country-meta`),
      apiFetch(`${API_URL}/api/collections`),
      apiFetch(`${API_URL}/api/media/archive`),
    ]);

    const profileData = await profileRes.json();
    const mediaData: MediaListResponse = await mediaRes.json();
    const visitsData = await visitsRes.json();
    const countryMetaData = await countryMetaRes.json();
    const collectionsData = await collectionsRes.json();
    const archivedData: MediaListResponse = await archivedRes.json();

    if (!profileRes.ok) throw new Error(profileData.error || 'Failed to load profile');
    if (!mediaRes.ok) throw new Error(mediaData.error || 'Failed to load media');
    if (!visitsRes.ok) throw new Error(visitsData.error || 'Failed to load visits');
    if (!countryMetaRes.ok && countryMetaRes.status !== 404) {
      throw new Error(countryMetaData.error || 'Failed to load country metadata');
    }
    if (!collectionsRes.ok) {
      throw new Error(collectionsData.error || 'Failed to load collections');
    }
    if (!archivedRes.ok) {
      throw new Error((archivedData as { error?: string }).error || 'Failed to load archived media');
    }

    const normalizedMediaItems = Array.isArray(mediaData.items) ? mediaData.items : [];
    const normalizedVisits = Array.isArray(visitsData.visited_countries) ? visitsData.visited_countries : [];

    setProfile(profileData);
    setMediaItems(normalizedMediaItems);
    setMediaTotalCount(typeof mediaData.total_count === 'number' ? mediaData.total_count : (typeof mediaData.count === 'number' ? mediaData.count : normalizedMediaItems.length));
    setVisits(normalizedVisits);

    const metaItems: CountryMeta[] = countryMetaRes.status === 404
      ? []
      : (Array.isArray(countryMetaData.items) ? countryMetaData.items : []);
    const metaMap: Record<string, CountryMeta> = {};
    for (const item of metaItems) {
      const code = (item.country_code || '').toUpperCase();
      if (!code) continue;
      metaMap[code] = item;
    }
    setCountryMetaByCode(metaMap);
    setCollections(Array.isArray(collectionsData.items) ? collectionsData.items : []);

    const archivedItems = Array.isArray(archivedData.items) ? archivedData.items : [];
    setArchivedMediaIDs(new Set(archivedItems.map((item) => item.id).filter(Boolean)));

    await waitForProfilePageReadiness(profileData, normalizedMediaItems, normalizedVisits);
  };

  const loadPublicProfile = async () => {
    const [profileRes, mediaRes, visitsRes, countryMetaRes, collectionsRes] = await Promise.all([
      fetch(`${API_URL}/api/public/profile/id/${routeUserID}`),
      fetch(`${API_URL}/api/public/media/user/${routeUserID}?limit=${ALL_MEDIA_PAGE_SIZE}&offset=0`),
      fetch(`${API_URL}/api/public/visits/user/${routeUserID}`),
      fetch(`${API_URL}/api/public/media/user/${routeUserID}/country-meta`),
      fetch(`${API_URL}/api/public/collections/user/${routeUserID}`),
    ]);

    const profileData = await profileRes.json();
    const mediaData: MediaListResponse = await mediaRes.json();
    const visitsData = await visitsRes.json();
    const countryMetaData = await countryMetaRes.json();
    const collectionsData = await collectionsRes.json();

    if (!profileRes.ok) {
      throw new Error(profileData.error || 'Failed to load public profile');
    }
    if (!mediaRes.ok) {
      throw new Error(mediaData.error || 'Failed to load public media');
    }
    if (!visitsRes.ok) {
      throw new Error(visitsData.error || 'Failed to load public visits');
    }
    if (!countryMetaRes.ok) {
      throw new Error(countryMetaData.error || 'Failed to load public country metadata');
    }
    if (!collectionsRes.ok) {
      throw new Error(collectionsData.error || 'Failed to load public collections');
    }

    const normalizedMediaItems = Array.isArray(mediaData.items) ? mediaData.items : [];
    const normalizedVisits = Array.isArray(visitsData.visited_countries) ? visitsData.visited_countries : [];

    setProfile(profileData);
    setMediaItems(normalizedMediaItems);
    setMediaTotalCount(typeof mediaData.total_count === 'number' ? mediaData.total_count : (typeof mediaData.count === 'number' ? mediaData.count : normalizedMediaItems.length));
    setVisits(normalizedVisits);

    const metaItems: CountryMeta[] = Array.isArray(countryMetaData.items) ? countryMetaData.items : [];
    const metaMap: Record<string, CountryMeta> = {};
    for (const item of metaItems) {
      const code = (item.country_code || '').toUpperCase();
      if (!code) continue;
      metaMap[code] = item;
    }
    setCountryMetaByCode(metaMap);
    setCollections(Array.isArray(collectionsData.items) ? collectionsData.items : []);
    setArchivedMediaIDs(new Set());

    await waitForProfilePageReadiness(profileData, normalizedMediaItems, normalizedVisits);
  };

  const isUUIDLike = (value: string) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

  // routeUserID is the trigger; the called loaders are intentionally recreated with state.
  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    const load = async () => {
      try {
        if (!isUUIDLike(routeUserID)) {
          const username = routeUserID.trim().toLowerCase();
          if (!username) {
            setError('Profile not found');
            return;
          }

          const resolveRes = await fetch(`${API_URL}/api/public/profile/${encodeURIComponent(username)}`, {
            cache: 'no-store',
          });
          if (!resolveRes.ok) {
            setError('Profile not found');
            return;
          }

          const resolved = (await resolveRes.json()) as { user_id?: string };
          if (!resolved.user_id || !isUUIDLike(resolved.user_id)) {
            setError('Profile not found');
            return;
          }

          router.replace(`/profile/${resolved.user_id}`);
          return;
        }

        let meUserID = '';
        try {
          const meRes = await apiFetch(`${API_URL}/api/auth/me`);
          if (meRes.ok) {
            const meData: MeResponse = await meRes.json();
            meUserID = meData.user_id || '';
          }
        } catch {
          meUserID = '';
        }

        setViewerUserID(meUserID);
        if (routeUserID && meUserID === routeUserID) {
          setSessionRole('owner');
        } else if (meUserID) {
          setSessionRole('authenticated_viewer');
        } else {
          setSessionRole('public_viewer');
        }

        if (routeUserID && meUserID === routeUserID) {
          await loadAll();
        } else {
          await loadPublicProfile();
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Network error. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [routeUserID]);
  /* eslint-enable react-hooks/exhaustive-deps */

  const isOwner = sessionRole === 'owner';

  const basedInValue = profile?.based_in || '';
  const basedInFlagPath = useMemo(() => {
    if (!basedInValue) return null;
    const normalized = basedInValue.trim().toLowerCase();
    const match =
      flags.find((flag) => flag.countryCode.toLowerCase() === normalized) ||
      flags.find((flag) => flag.countryName.toLowerCase() === normalized);
    return match?.path || null;
  }, [basedInValue]);

  const headerFlagPaths = useMemo(() => {
    const visitCodes = visits
      .map((visit) => (visit.country_code || '').toUpperCase())
      .filter(Boolean);

    const uniqueCodes = Array.from(new Set(visitCodes));

    return uniqueCodes
      .map((code) => flags.find((item) => item.countryCode === code)?.path)
      .filter((path): path is string => Boolean(path))
      .slice(0, 24);
  }, [visits]);

  const groupedByCountry = useMemo(() => {
    const byCountry = new Map<string, MediaItem[]>();
    for (const item of mediaItems) {
      const code = (item.country_code || '').toUpperCase();
      const list = byCountry.get(code) || [];
      list.push(item);
      byCountry.set(code, list);
    }
    return byCountry;
  }, [mediaItems]);

  const countriesForCards = useMemo(() => {
    const set = new Set<string>();
    visits.forEach((v) => set.add((v.country_code || '').toUpperCase()));
    return Array.from(set).filter(Boolean);
  }, [visits]);

  const profileStats = useMemo(() => {
    return {
      countries: countriesForCards.length,
      allMedia: mediaTotalCount,
      collections: collections.length,
    };
  }, [countriesForCards.length, mediaTotalCount, collections.length]);

  const visibleAllMediaItems = useMemo(() => {
    if (!showArchivedMediaOnly) return mediaItems;
    return mediaItems.filter((item) => archivedMediaIDs.has(item.id));
  }, [archivedMediaIDs, mediaItems, showArchivedMediaOnly]);

  const hasMoreAllMediaItems = !showArchivedMediaOnly && mediaItems.length < mediaTotalCount;

  const loadMoreAllMedia = async () => {
    if (loadingMoreMedia || !hasMoreAllMediaItems || showArchivedMediaOnly) return;

    setLoadingMoreMedia(true);
    try {
      const offset = mediaItems.length;
      const path = isOwner
        ? `${API_URL}/api/media?limit=${ALL_MEDIA_PAGE_SIZE}&offset=${offset}`
        : `${API_URL}/api/public/media/user/${routeUserID}?limit=${ALL_MEDIA_PAGE_SIZE}&offset=${offset}`;
      const res = await (isOwner ? apiFetch(path) : fetch(path));
      const data: MediaListResponse = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load more media');
      }

      const nextItems = Array.isArray(data.items) ? data.items : [];
      setMediaItems((prev) => {
        const seen = new Set(prev.map((item) => item.id));
        const merged = [...prev];
        for (const item of nextItems) {
          if (seen.has(item.id)) continue;
          merged.push(item);
        }
        return merged;
      });

      if (typeof data.total_count === 'number') {
        setMediaTotalCount(data.total_count);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load more media');
    } finally {
      setLoadingMoreMedia(false);
    }
  };

  const countrySuggestions = useMemo(() => {
    const query = countryInput.trim();
    if (!query) return [];
    return searchFlagsByName(query).slice(0, 8);
  }, [countryInput]);

  const selectedUpload = pendingUploads.find((item) => item.id === selectedUploadID) || null;

  useEffect(() => {
    latestCountryInputRef.current = countryInput;
  }, [countryInput]);

  useEffect(() => {
    latestSelectedCountryCodeRef.current = selectedCountryCode;
  }, [selectedCountryCode]);

  const resolveFlagPath = (value: string) => {
    const raw = value.trim();
    if (!raw) return null;

    const part = raw.split(',').map((v) => v.trim()).filter(Boolean).pop() || raw;

    const byName = flags.find((f) => f.countryName.toLowerCase() === part.toLowerCase());
    if (byName) return byName.path;

    const byCode = flags.find((f) => f.countryCode.toLowerCase() === part.toLowerCase());
    return byCode?.path || null;
  };

  const openEditor = () => {
    setShowCountryEditor(true);
    setEditorTab('media');
    setCountryInput('');
    setSelectedCountryCode('');
    setShowCountrySuggestions(false);
    setLocationInput('');
    setSelectedLocation(null);
    setLocationSuggestions([]);
    setShowLocationSuggestions(false);
    setAboutText('');
    setVisitMonth('');
    setVisitYear('');
    setPendingUploads([]);
    setSelectedUploadID('');
    setUploadProgress(0);
    setUploadMessage('');
    setEditorError('');
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setQueryTab(params.get('tab') || '');
    setQueryEditor(params.get('editor') || '');
  }, []);

  useEffect(() => {
    if (!isOwner || initializedFromQuery) return;

    const tab = queryTab;
    if (tab === 'all' || tab === 'countries' || tab === 'collections' || tab === 'about') {
      setActiveTab(tab);
    }

    if (queryEditor === 'country') {
      openEditor();
    }

    setInitializedFromQuery(true);
  }, [initializedFromQuery, isOwner, queryEditor, queryTab]);

  const onPickFiles = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const nextItems = files.map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      file,
      preview: URL.createObjectURL(file),
      mimeType: resolveUploadMimeType(file),
    }));

    setPendingUploads((prev) => {
      const merged = [...prev, ...nextItems];
      if (!selectedUploadID && merged[0]) setSelectedUploadID(merged[0].id);
      return merged;
    });

    e.target.value = '';
  };

  const removePendingUpload = (uploadID: string) => {
    setPendingUploads((prev) => {
      const next = prev.filter((item) => {
        if (item.id === uploadID) {
          URL.revokeObjectURL(item.preview);
          return false;
        }
        return true;
      });

      setSelectedUploadID((current) => {
        if (current !== uploadID) return current;
        return next[0]?.id || '';
      });

      return next;
    });
  };

  const resolveProfileCountryCode = () => {
    const raw = (profile?.based_in || '').trim();
    if (!raw) return 'US';

    const exactCode = flags.find((f) => f.countryCode.toLowerCase() === raw.toLowerCase());
    if (exactCode) return exactCode.countryCode;

    const exactName = flags.find((f) => f.countryName.toLowerCase() === raw.toLowerCase());
    if (exactName) return exactName.countryCode;

    return 'US';
  };

  const saveCountry = async () => {
    const countryCode = selectedCountryCode;
    if (!countryCode) {
      setEditorError('Select a country from the suggestions list.');
      return;
    }

    if (!pendingUploads.length) {
      setEditorError('Upload at least one photo or video to continue.');
      return;
    }

    const hasImageUpload = pendingUploads.some((item) => (item.mimeType || '').startsWith('image/'));
    if (!hasImageUpload) {
      setEditorError('Add at least one image before creating a country.');
      return;
    }

    if (locationInput.trim() && !selectedLocation) {
      setEditorError('Select a location from suggestions or clear the location field.');
      return;
    }

    const thumbID = selectedUploadID || pendingUploads[0].id;
    const totalSize = pendingUploads.reduce((sum, item) => sum + item.file.size, 0);
    const uploadedByID: Record<string, number> = {};
    const finalizedByPendingID: Record<string, MediaItem> = {};

    setSavingCountry(true);
    setUploadProgress(0);
    setUploadMessage('Preparing upload...');
    setEditorError('');

    try {
      const visitRes = await apiFetchWithFallback('/api/visits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ country_code: countryCode }),
      });

      if (!visitRes.ok && visitRes.status !== 201 && visitRes.status !== 200) {
        const visitData = await visitRes.json();
        throw new Error(visitData.error || 'Failed to save country');
      }

      for (let index = 0; index < pendingUploads.length; index += 1) {
        const item = pendingUploads[index];
        setUploadMessage(`Uploading ${index + 1} of ${pendingUploads.length}...`);

        const uploadedItem = await uploadViaBackend(item.file, countryCode, selectedLocation);
        uploadedByID[item.id] = item.file.size;
        const uploadedTotal = Object.values(uploadedByID).reduce((sum, bytes) => sum + bytes, 0);
        const progress = totalSize > 0 ? Math.round((uploadedTotal / totalSize) * 100) : 0;
        setUploadProgress(Math.min(progress, 99));
        finalizedByPendingID[item.id] = uploadedItem;
      }

      const selectedThumbnail = finalizedByPendingID[thumbID] || finalizedByPendingID[pendingUploads[0].id];
      setUploadMessage('Saving country details...');

      const countryMetaRes = await apiFetchWithFallback('/api/media/country-meta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          country_code: countryCode,
          description: aboutText,
          thumbnail_media_id: selectedThumbnail?.id || null,
          thumbnail_file_url: selectedThumbnail?.file_url || '',
        }),
      });

      const countryMetaData = await countryMetaRes.json();
      if (!countryMetaRes.ok && countryMetaRes.status !== 404) {
        throw new Error(countryMetaData.error || 'Failed saving country metadata');
      }

      setUploadProgress(100);
      setUploadMessage('Upload complete. Redirecting...');

      await loadAll();
      setShowCountryEditor(false);
      setActiveTab('countries');
      router.push(`/profile/${routeUserID}`);
      router.refresh();
    } catch (err) {
      if (err instanceof TypeError && err.message.includes('Failed to fetch')) {
        setEditorError('Network request failed. Ensure frontend can reach API at http://localhost:8080 and try again.');
      } else {
        setEditorError(err instanceof Error ? err.message : 'Failed saving country');
      }
    } finally {
      setSavingCountry(false);
      setUploadMessage('');
    }
  };

  const handleLogout = async () => {
    try {
      await apiFetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
      });
    } finally {
      clearAccessToken();
      router.push('/signin');
    }
  };

  const toggleArchiveMedia = async (mediaID: string) => {
    if (!isOwner) return;

    let shouldArchive = true;
    setArchivedMediaIDs((prev) => {
      const next = new Set(prev);
      if (next.has(mediaID)) {
        next.delete(mediaID);
        shouldArchive = false;
      } else {
        next.add(mediaID);
        shouldArchive = true;
      }
      return next;
    });

    try {
      const res = await apiFetch(`${API_URL}/api/media/${mediaID}/archive`, {
        method: shouldArchive ? 'POST' : 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || (shouldArchive ? 'Failed to archive media' : 'Failed to remove archive'));
      }
    } catch (err) {
      setArchivedMediaIDs((prev) => {
        const next = new Set(prev);
        if (shouldArchive) {
          next.delete(mediaID);
        } else {
          next.add(mediaID);
        }
        return next;
      });
      setEditorError(err instanceof Error ? err.message : 'Failed to update archive');
    }
  };

  const uploadProfileAsset = async (file: File, target: 'avatar_url' | 'cover_image_url') => {
    const countryCode = resolveProfileCountryCode();
    setEditorError('');
    setUploadingProfileAsset(target === 'avatar_url' ? 'avatar' : 'cover');

    try {
      const caption = target === 'avatar_url' ? 'profile_avatar' : 'profile_cover';
      const uploaded = await uploadViaBackend(file, countryCode, null, caption);
      const uploadedURL = uploaded.file_url;

      const updatePayload = target === 'avatar_url'
        ? { avatar_url: uploadedURL }
        : { cover_image_url: uploadedURL };

      const res = await apiFetch(`${API_URL}/api/profile/me`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatePayload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update profile image');
      }

      setProfile((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          [target]: uploadedURL,
        };
      });
    } catch (err) {
      setEditorError(err instanceof Error ? err.message : 'Failed uploading profile image');
    } finally {
      setUploadingProfileAsset(null);
    }
  };

  const onSelectProfileAsset = (target: 'avatar_url' | 'cover_image_url') => async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadProfileAsset(file, target);
    e.target.value = '';
  };

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
          <Link href="/" className="underline text-gray-300 hover:text-white">Go to home</Link>
        </div>
      </div>
    );
  }

  const displayName = profile.display_name || profile.username;
  const basedIn = profile.based_in || 'Not set';
  const handle = profile.username ? `@${profile.username}` : '@username';
  const aboutPhotosFromProfile = (profile.photo_urls || []).filter(Boolean);
  const aboutPhotosFromMedia = mediaItems
    .filter((item) => (item.caption || '').toLowerCase() === 'profile_photo')
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .map((item) => item.file_url)
    .filter(Boolean);
  const aboutPhotos = (aboutPhotosFromProfile.length ? aboutPhotosFromProfile : aboutPhotosFromMedia).slice(0, 4);
  const aboutInterests = (profile.interests || []).slice(0, 10);
  const aboutLanguages = (profile.languages || []).slice(0, 8);
  const homeland = (profile.homeland || '').trim();
  const currentlyIn = (profile.currently_in || '').trim();
  const socialLinks = profile.social_links || {};

  const socialRows = [
    { key: 'instagram', label: socialLinks.instagram },
    { key: 'facebook', label: socialLinks.facebook },
    { key: 'x', label: socialLinks.x },
    { key: 'linkedin', label: socialLinks.linkedin },
    { key: 'youtube', label: socialLinks.youtube },
  ].filter((item) => Boolean(item.label?.trim()));

  const hasAboutContent =
    !!profile.bio ||
    aboutPhotos.length > 0 ||
    aboutInterests.length > 0 ||
    aboutLanguages.length > 0 ||
    socialRows.length > 0 ||
    !!homeland ||
    !!currentlyIn;

  const homelandFlag = resolveFlagPath(homeland);
  const currentlyInFlag = resolveFlagPath(currentlyIn);

  return (
    <>
      <div className="min-h-screen bg-black text-white flex flex-col items-center px-4 md:px-10 xl:px-24">
        <header className="relative w-full max-w-[1488px] flex items-center justify-between py-6 md:py-8">
          <Link href="/" className="font-semibold text-[22px] md:text-[24px] text-white tracking-[-0.41px]">
            travingat
          </Link>

          <div className="flex items-center gap-3 md:gap-5">
            <button className="text-[#e3e3e3] hover:text-white transition" aria-label="Favorites">
              <span className="material-symbols-rounded text-[22px]">favorite</span>
            </button>
            <button className="hidden md:inline-flex text-[#e3e3e3] hover:text-white transition" aria-label="Notifications">
              <span className="material-symbols-rounded text-[22px]">notifications</span>
            </button>

            <div className="relative" ref={navMenuRef}>
              <button
                onClick={() => setShowNavMenu((prev) => !prev)}
                className="flex items-center gap-2 rounded-xl border border-[#1e1e1e] bg-[#0b0b0b] px-3 py-2"
                aria-label="Open profile menu"
              >
                <span className="material-symbols-rounded text-[#e3e3e3] text-[21px]">dehaze</span>
                <div className="hidden md:block h-7 w-7 overflow-hidden rounded-lg">
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt="Profile"
                      loading="eager"
                      decoding="async"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-[#191919]" />
                  )}
                </div>
              </button>

              {showNavMenu ? (
                <div className="absolute right-0 top-full z-30 mt-3 w-[220px] rounded-2xl border border-[#252525] bg-[#101010] p-2 shadow-[0_12px_40px_rgba(0,0,0,0.45)]">
                  {sessionRole === 'owner' ? (
                    <>
                      <button onClick={openEditor} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-[#d8d8d8] hover:bg-[#1b1b1b]"><span className="material-symbols-rounded text-[17px] text-[#9a9a9a]">add_location_alt</span>Add Country</button>
                      <button
                        onClick={() => {
                          router.push(`/profile/${routeUserID}/archive`);
                          setShowNavMenu(false);
                        }}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-[#d8d8d8] hover:bg-[#1b1b1b]"
                      >
                        <span className="material-symbols-rounded text-[17px] text-[#9a9a9a]">archive</span>
                        Archive
                      </button>
                      <Link href={`/profile/${routeUserID}/edit`} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-[#d8d8d8] hover:bg-[#1b1b1b]"><span className="material-symbols-rounded text-[17px] text-[#9a9a9a]">edit</span>Edit profile</Link>
                      <button onClick={() => avatarInputRef.current?.click()} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-[#d8d8d8] hover:bg-[#1b1b1b]">
                        <span className="material-symbols-rounded text-[17px] text-[#9a9a9a]">add_a_photo</span>
                        {uploadingProfileAsset === 'avatar' ? 'Uploading avatar...' : 'Upload avatar'}
                      </button>
                      <button onClick={() => coverInputRef.current?.click()} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-[#d8d8d8] hover:bg-[#1b1b1b]">
                        <span className="material-symbols-rounded text-[17px] text-[#9a9a9a]">image</span>
                        {uploadingProfileAsset === 'cover' ? 'Uploading cover...' : 'Upload cover'}
                      </button>
                      <button onClick={handleLogout} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-[#f3a0a0] hover:bg-[#1b1b1b]"><span className="material-symbols-rounded text-[17px] text-[#f3a0a0]">logout</span>Logout</button>
                    </>
                  ) : sessionRole === 'authenticated_viewer' ? (
                    <>
                      <p className="px-3 py-2 text-xs uppercase tracking-[0.18em] text-[#7c7c7c]">View only</p>
                      <button
                        onClick={() => {
                          router.push(`/profile/${routeUserID}/archive`);
                          setShowNavMenu(false);
                        }}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-[#d8d8d8] hover:bg-[#1b1b1b]"
                      >
                        <span className="material-symbols-rounded text-[17px] text-[#9a9a9a]">archive</span>
                        Archive
                      </button>
                      <Link href={`/profile/${viewerUserID}`} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-[#d8d8d8] hover:bg-[#1b1b1b]"><span className="material-symbols-rounded text-[17px] text-[#9a9a9a]">person</span>Go to my profile</Link>
                      <button onClick={handleLogout} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-[#f3a0a0] hover:bg-[#1b1b1b]"><span className="material-symbols-rounded text-[17px] text-[#f3a0a0]">logout</span>Logout</button>
                    </>
                  ) : (
                    <Link href="/signin" className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-[#d8d8d8] hover:bg-[#1b1b1b]"><span className="material-symbols-rounded text-[17px] text-[#9a9a9a]">login</span>Sign in</Link>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </header>

        <main className="w-full max-w-[1488px] pb-12 md:pb-20 grid gap-10">
          <section className="lg:hidden space-y-5">
            <div className="flex flex-col items-center gap-5 rounded-[24px] w-full">
              <div className="w-full">
                <div className="h-[200px] mb-[-36px] rounded-[12px] overflow-hidden bg-[#151515]">
                  {profile.cover_image_url ? (
                    <img src={profile.cover_image_url} alt="Profile cover" className="w-full h-full object-cover" />
                  ) : (
                    <div className="h-full w-full bg-[#1f1f1f]" />
                  )}
                </div>
                <div className="relative z-10 mx-auto h-20 w-20 rounded-[16px] border-4 border-black overflow-hidden bg-[#151515]">
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt="Profile avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="h-full w-full bg-[#1f1f1f]" />
                  )}
                </div>
              </div>

              <div className="pt-1 text-center">
                <div className="flex items-center justify-center gap-1.5 text-[#696969] text-sm">
                  {basedInFlagPath ? (
                    <img src={basedInFlagPath} alt={`${basedIn} flag`} className="w-[15px] h-[10px] rounded-[2px] object-cover" />
                  ) : null}
                  <span>{basedIn}</span>
                </div>
                <h1 className="text-white text-[28px] leading-[1.1] tracking-[-0.5px] font-semibold mt-2">{displayName}</h1>
                <p className="text-[#a8a8a8] text-[16px] mt-1">{handle}</p>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-1">
              {headerFlagPaths.map((path, index) => (
                <img key={`${path}-${index}`} src={path} alt="Visited country flag" className="h-4 w-6 rounded-[2px] object-cover" />
              ))}
            </div>

            <div className="w-full rounded-[16px] border border-[#202020] bg-[#111] px-5 py-5">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-white text-[28px] leading-none tracking-[-0.4px] font-semibold">{profileStats.countries}</p>
                  <p className="text-[#989898] text-[12px] mt-1">Countries</p>
                </div>
                <div>
                  <p className="text-white text-[28px] leading-none tracking-[-0.4px] font-semibold">{profileStats.allMedia}</p>
                  <p className="text-[#989898] text-[12px] mt-1">All media</p>
                </div>
                <div>
                  <p className="text-white text-[28px] leading-none tracking-[-0.4px] font-semibold">{profileStats.collections}</p>
                  <p className="text-[#989898] text-[12px] mt-1">Collections</p>
                </div>
              </div>
            </div>

          </section>

          <section className="hidden lg:grid lg:grid-cols-[600px_minmax(0,1fr)] gap-10 lg:gap-12 items-end">
            <div className="space-y-10 pt-12 self-start">
              <div className="space-y-4">
                <div className="group relative h-[120px] w-[120px] overflow-hidden rounded-[20px] bg-[#151515]">
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt="Profile avatar"
                      loading="eager"
                      decoding="async"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-[#1f1f1f]" />
                  )}
                  {isOwner ? (
                    <button
                      type="button"
                      onClick={() => avatarInputRef.current?.click()}
                      className="absolute bottom-2 right-2 h-8 w-8 rounded-full border border-[#383838] bg-[rgba(15,15,15,0.92)] text-[#e3e3e3] grid place-items-center opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Edit profile photo"
                    >
                      <span className="material-symbols-rounded text-[17px]">edit</span>
                    </button>
                  ) : null}
                </div>

                <div className="flex items-center gap-2 text-[#989898] text-[16px] md:text-[18px] tracking-[-0.2px] leading-[1.4]">
                  {basedInFlagPath ? (
                    <img src={basedInFlagPath} alt={`${basedIn} flag`} className="w-6 h-4 rounded-[4px] object-cover" />
                  ) : (
                    <span className="inline-block w-6 h-4 rounded-[4px] bg-[#222222]" />
                  )}
                  <span>{basedIn}</span>
                </div>

                <h1 className="text-[34px] md:text-[44px] leading-[1.1] tracking-[-0.5px] font-semibold text-white">
                  {displayName}
                </h1>

                <p className="text-[#989898] text-[20px] md:text-[24px] leading-[1.2] tracking-[-0.5px]">{handle}</p>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {headerFlagPaths.map((path, index) => (
                  <img
                    key={`${path}-${index}`}
                    src={path}
                    alt="Visited country flag"
                    className="h-[14px] w-[20px] rounded-[2px] object-cover"
                  />
                ))}
              </div>

              <div className="w-full rounded-[20px] border-l border-[#353535] bg-gradient-to-r from-[#1a1a1a] to-[rgba(0,0,0,0.15)] px-4 py-4">
                <div className="grid grid-cols-3 gap-2 md:gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl bg-[#232323] grid place-items-center">
                      <img
                        src={PROFILE_STATS_ICONS.countries}
                        alt="Countries icon"
                        className="w-10 h-10 md:w-12 md:h-12 object-contain"
                        loading="eager"
                        decoding="async"
                      />
                    </div>
                    <div>
                      <p className="text-[20px] md:text-[24px] leading-none tracking-[-0.4px] text-white font-semibold">{profileStats.countries}</p>
                      <p className="text-[11px] md:text-[12px] text-[#989898] mt-1">Countries</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl bg-[#232323] grid place-items-center">
                      <img
                        src={PROFILE_STATS_ICONS.allMedia}
                        alt="All media icon"
                        className="w-10 h-10 md:w-12 md:h-12 object-contain"
                        loading="eager"
                        decoding="async"
                      />
                    </div>
                    <div>
                      <p className="text-[20px] md:text-[24px] leading-none tracking-[-0.4px] text-white font-semibold">{profileStats.allMedia}</p>
                      <p className="text-[11px] md:text-[12px] text-[#989898] mt-1">All media</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl bg-[#232323] grid place-items-center">
                      <img
                        src={PROFILE_STATS_ICONS.collections}
                        alt="Collections icon"
                        className="w-10 h-10 md:w-12 md:h-12 object-contain"
                        loading="eager"
                        decoding="async"
                      />
                    </div>
                    <div>
                      <p className="text-[20px] md:text-[24px] leading-none tracking-[-0.4px] text-white font-semibold">{profileStats.collections}</p>
                      <p className="text-[11px] md:text-[12px] text-[#989898] mt-1">Collections</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button className="rounded-full bg-white text-black px-6 py-2 text-sm font-medium hover:bg-[#ececec] transition">Follow</button>
                <button className="rounded-full bg-[#1a1a1a] text-[#d5d5d5] px-6 py-2 text-sm font-medium hover:bg-[#242424] transition">Connect</button>
                <button className="h-9 w-9 grid place-items-center rounded-full bg-[#1a1a1a] text-[#d5d5d5] hover:bg-[#242424] transition" aria-label="More options">
                  <span className="material-symbols-rounded text-[18px]">more_horiz</span>
                </button>
              </div>
            </div>

            <div className="flex flex-row items-end justify-end self-stretch">
              <div className="group relative aspect-[640/662] h-full w-full max-w-[640px] overflow-hidden rounded-[32px] bg-[#111] border border-[#1f1f1f]">
                {profile.cover_image_url ? (
                  <img
                    src={profile.cover_image_url}
                    alt="Profile cover"
                    loading="eager"
                    decoding="async"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-[#151515]" />
                )}
                {isOwner ? (
                  <button
                    type="button"
                    onClick={() => coverInputRef.current?.click()}
                    className="absolute bottom-8 right-8 h-10 w-10 rounded-full border border-[#383838] bg-[rgba(15,15,15,0.92)] text-[#e3e3e3] grid place-items-center opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Edit cover photo"
                  >
                    <span className="material-symbols-rounded text-[20px]">edit</span>
                  </button>
                ) : null}
              </div>
            </div>
          </section>

          <div className="flex items-center justify-center gap-2 flex-wrap">
            <button
              onClick={() => setActiveTab('all')}
              className={`rounded-[999px] px-6 py-2 text-[16px] leading-6 tracking-[-0.096px] transition ${activeTab === 'all'
                ? 'bg-[#1e1e1e] border border-white text-white font-medium'
                : 'bg-[#161616] border border-transparent text-[#bdbdbd] font-normal'
                }`}
            >
              All media
            </button>
            <button
              onClick={() => setActiveTab('countries')}
              className={`rounded-[999px] px-6 py-2 text-[16px] leading-6 tracking-[-0.096px] transition ${activeTab === 'countries'
                ? 'bg-[#1e1e1e] border border-white text-white font-medium'
                : 'bg-[#161616] border border-transparent text-[#bdbdbd] font-normal'
                }`}
            >
              Countries
            </button>
            <button
              onClick={() => setActiveTab('collections')}
              className={`rounded-[999px] px-6 py-2 text-[16px] leading-6 tracking-[-0.096px] transition ${activeTab === 'collections'
                ? 'bg-[#1e1e1e] border border-white text-white font-medium'
                : 'bg-[#161616] border border-transparent text-[#bdbdbd] font-normal'
                }`}
            >
              Collections
            </button>
            <button
              onClick={() => setActiveTab('about')}
              className={`rounded-[999px] px-6 py-2 text-[16px] leading-6 tracking-[-0.096px] transition ${activeTab === 'about'
                ? 'bg-[#1e1e1e] border border-white text-white font-medium'
                : 'bg-[#161616] border border-transparent text-[#bdbdbd] font-normal'
                }`}
            >
              About me
            </button>
          </div>

          {activeTab === 'all' && (
            <section className="md:hidden rounded-2xl border border-[#252525] bg-[#0b0b0d] px-3 py-3 min-h-[250px]">
              {showArchivedMediaOnly ? (
                <div className="mb-3 flex items-center justify-between rounded-xl border border-[#2a2a2a] bg-[#111] px-3 py-2 text-xs text-[#bfbfbf]">
                  <span>Archive view</span>
                  <button
                    type="button"
                    onClick={() => setShowArchivedMediaOnly(false)}
                    className="rounded-full border border-[#343434] px-3 py-1 text-[11px] text-white"
                  >
                    Close
                  </button>
                </div>
              ) : null}
              <div className="mb-3 grid grid-cols-4 rounded-xl border border-[#252525] bg-[#0d0d0d] p-2">
                <button className="grid place-items-center text-[#b7b7b7] py-1"><span className="material-symbols-rounded text-[20px]">home</span></button>
                <button className="grid place-items-center text-[#b7b7b7] py-1"><span className="material-symbols-rounded text-[20px]">neurology</span></button>
                <button className="grid place-items-center text-[#b7b7b7] py-1"><span className="material-symbols-rounded text-[20px]">folder</span></button>
                <button className="grid place-items-center text-[#b7b7b7] py-1"><span className="material-symbols-rounded text-[20px]">person</span></button>
              </div>
              {visibleAllMediaItems.length === 0 ? (
                <div className="max-w-xl mx-auto flex flex-col items-center gap-5 text-center py-10">
                  <h2 className="text-[30px] leading-none tracking-[-0.5px] font-semibold text-white">
                    {showArchivedMediaOnly ? 'Archive' : 'All media'}
                  </h2>
                  <p className="text-[#7c7c7c] text-[14px] leading-[1.4]">
                    {showArchivedMediaOnly
                      ? 'No archived media yet.'
                      : 'Add media to a country or collection to start building your gallery.'}
                  </p>
                </div>
              ) : (
                <div className="columns-2 gap-2 space-y-0">
                  {visibleAllMediaItems.map((item) => (
                    <div
                      key={item.id}
                      className="mb-2 break-inside-avoid rounded-xl overflow-hidden border border-[#1f1f1f] bg-[#111] relative"
                      ref={openMediaCardMenuID === item.id ? mediaCardMenuRef : undefined}
                    >
                      {isOwner ? (
                        <>
                          <button
                            type="button"
                            aria-label="Media actions"
                            onClick={(event) => {
                              event.preventDefault();
                              event.stopPropagation();
                              setOpenMediaCardMenuID((current) => (current === item.id ? '' : item.id));
                            }}
                            className="absolute right-2 top-2 z-10 h-7 w-7 rounded-full border border-[#3c3c3c] bg-[rgba(10,10,10,0.85)] text-white grid place-items-center"
                          >
                            <span className="material-symbols-rounded text-[16px]">more_horiz</span>
                          </button>
                          {openMediaCardMenuID === item.id ? (
                            <div className="absolute right-2 top-10 z-20 min-w-[170px] rounded-xl border border-[#2f2f2f] bg-[#0f0f10] p-1.5 shadow-[0_12px_26px_rgba(0,0,0,0.45)]">
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.preventDefault();
                                  event.stopPropagation();
                                  void toggleArchiveMedia(item.id);
                                  setOpenMediaCardMenuID('');
                                }}
                                className="w-full rounded-lg px-3 py-2 text-left text-xs text-[#dfdfdf] hover:bg-[#1a1a1a]"
                              >
                                {archivedMediaIDs.has(item.id) ? 'Remove from archive' : 'Archive media'}
                              </button>
                            </div>
                          ) : null}
                        </>
                      ) : null}

                      <Link
                        href={
                          item.collection_id
                            ? `/profile/${routeUserID}/media/${item.id}?source=collection&collectionId=${encodeURIComponent(item.collection_id)}`
                            : `/profile/${routeUserID}/media/${item.id}?source=country&countryCode=${encodeURIComponent((item.country_code || '').toUpperCase())}`
                        }
                        className="block"
                        onMouseEnter={onMediaCardMouseEnter}
                        onMouseLeave={onMediaCardMouseLeave}
                      >
                        {!loadedMediaPreviewIDs.has(item.id) ? (
                          <div className="pointer-events-none absolute inset-0 z-[2] grid place-items-center bg-[rgba(8,8,8,0.45)]">
                            <div className="media-plane-loader" aria-hidden="true">
                              <div className="media-plane-loader__ring" />
                              <div className="media-plane-loader__plane-wrap">
                                <span className="media-plane-loader__trail" />
                                <svg className="media-plane-loader__plane" viewBox="0 0 24 24" aria-hidden="true">
                                  <path d="M21 16v-2l-8-5V3.5A1.5 1.5 0 0 0 11.5 2 1.5 1.5 0 0 0 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5L21 16Z" fill="currentColor" />
                                </svg>
                              </div>
                            </div>
                          </div>
                        ) : null}
                        {item.mime_type?.startsWith('video/') ? (
                          <>
                            <video
                              src={item.file_url}
                              muted
                              playsInline
                              preload="metadata"
                              onLoadedData={() => markMediaPreviewLoaded(item.id)}
                              className="w-full h-auto object-cover"
                            />
                            <span className="absolute top-2 right-11 h-7 w-7 rounded-full border border-[#3c3c3c] bg-[rgba(10,10,10,0.85)] text-white grid place-items-center">
                              <span className="material-symbols-rounded text-[16px]">play_arrow</span>
                            </span>
                          </>
                        ) : (
                          <img
                            src={getLowQualityMediaURL(item.file_url)}
                            alt="Uploaded media"
                            loading="lazy"
                            decoding="async"
                            onLoad={() => markMediaPreviewLoaded(item.id)}
                            onError={(event) => {
                              const target = event.currentTarget;
                              if (target.src !== item.file_url) {
                                target.src = item.file_url;
                                return;
                              }
                              markMediaPreviewLoaded(item.id);
                            }}
                            className="w-full h-auto object-cover"
                          />
                        )}
                      </Link>
                    </div>
                  ))}
                </div>
              )}

              {hasMoreAllMediaItems ? (
                <div className="pt-4 flex justify-center">
                  <button
                    type="button"
                    onClick={() => void loadMoreAllMedia()}
                    className="rounded-full border border-[#343434] bg-[#111] px-5 py-2 text-xs text-white hover:bg-[#1a1a1a] transition"
                  >
                    {loadingMoreMedia ? 'Loading...' : 'View more'}
                  </button>
                </div>
              ) : null}
            </section>
          )}

          {activeTab === 'all' && (
            <section className="hidden md:block">
              {visibleAllMediaItems.length === 0 ? (
                <div className="space-y-10">
                  {showArchivedMediaOnly ? (
                    <div className="rounded-xl border border-[#2a2a2a] bg-[#111] px-4 py-3 text-sm text-[#bfbfbf] flex items-center justify-between">
                      <span>Archive view</span>
                      <button
                        type="button"
                        onClick={() => setShowArchivedMediaOnly(false)}
                        className="rounded-full border border-[#343434] px-3 py-1 text-xs text-white"
                      >
                        Close
                      </button>
                    </div>
                  ) : null}
                  <div className="flex items-center justify-center gap-2 text-[16px] tracking-[-0.41px]">
                    <span className="h-px flex-1 bg-[#1f1f1f]" />
                    <div className="flex items-center gap-1">
                      <span className="text-white font-medium">{countriesForCards.length}</span>
                      <span className="text-[#606060]">/8</span>
                    </div>
                    <span className="text-white">Countries added</span>
                    {isOwner ? <span className="material-symbols-rounded text-[#9a9a9a] text-[16px]">edit</span> : null}
                    <span className="h-px flex-1 bg-[#1f1f1f]" />
                  </div>

                  <div className="rounded-2xl bg-[#0b0b0d] min-h-[407px] px-10 py-16 grid place-items-center">
                    <div className="w-full max-w-[600px] mx-auto flex flex-col items-center gap-6 text-center">
                      <div className="flex items-center gap-3">
                        {COLLECTIONS_EMPTY_PREVIEW_IMAGES.map((src, idx) => (
                          <div key={src} className="w-[100px] h-[100px] rounded-[10px] overflow-hidden bg-[#151515]">
                            <img src={src} alt={`Empty media preview ${idx + 1}`} className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>

                      <div className="space-y-2">
                        <h2 className="text-white text-[34px] leading-none tracking-[-0.5px] font-semibold">
                          {showArchivedMediaOnly ? 'Archive' : 'All media'}
                        </h2>
                        <p className="text-[#7c7c7c] text-[16px] leading-[1.4] max-w-[600px]">
                          {showArchivedMediaOnly
                            ? 'No archived media yet.'
                            : 'All your photos and videos from countries and collections appear here. Add media to a country or create a collection to get started.'}
                        </p>
                      </div>

                      {isOwner ? (
                        <div className="flex items-center gap-3">
                          <button onClick={openEditor} className="w-[148px] bg-white text-black rounded-full px-5 py-2.5 text-sm font-medium hover:bg-gray-200 transition">Add Country</button>
                          <Link href={`/profile/${routeUserID}/collection/new`} className="w-[148px] bg-[#161616] text-[#d0d0d0] rounded-full px-5 py-2.5 text-sm font-medium hover:bg-[#242424] transition text-center">Create Collection</Link>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              ) : (
                <section className="rounded-2xl border border-dashed border-[#2f2f2f] bg-[#0b0b0d] px-6 py-16 min-h-[250px]">
                  {showArchivedMediaOnly ? (
                    <div className="mb-4 rounded-xl border border-[#2a2a2a] bg-[#111] px-4 py-3 text-sm text-[#bfbfbf] flex items-center justify-between">
                      <span>Archive view</span>
                      <button
                        type="button"
                        onClick={() => setShowArchivedMediaOnly(false)}
                        className="rounded-full border border-[#343434] px-3 py-1 text-xs text-white"
                      >
                        Close
                      </button>
                    </div>
                  ) : null}
                  <div className="columns-2 md:columns-3 xl:columns-4 gap-4 space-y-4">
                    {visibleAllMediaItems.map((item) => (
                      <div
                        key={item.id}
                        className="group break-inside-avoid rounded-2xl overflow-hidden border border-[#1f1f1f] bg-[#111] relative"
                        ref={openMediaCardMenuID === item.id ? mediaCardMenuRef : undefined}
                      >
                        {isOwner ? (
                          <>
                            <button
                              type="button"
                              aria-label="Media actions"
                              onClick={(event) => {
                                event.preventDefault();
                                event.stopPropagation();
                                setOpenMediaCardMenuID((current) => (current === item.id ? '' : item.id));
                              }}
                              className={`absolute right-3 top-3 z-10 h-8 w-8 rounded-full border border-[#3c3c3c] bg-[rgba(10,10,10,0.85)] text-white grid place-items-center transition-opacity ${openMediaCardMenuID === item.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                                }`}
                            >
                              <span className="material-symbols-rounded text-[16px]">more_horiz</span>
                            </button>
                            {openMediaCardMenuID === item.id ? (
                              <div className="absolute right-3 top-12 z-20 min-w-[190px] rounded-xl border border-[#2f2f2f] bg-[#0f0f10] p-2 shadow-[0_14px_30px_rgba(0,0,0,0.45)]">
                                <button
                                  type="button"
                                  onClick={(event) => {
                                    event.preventDefault();
                                    event.stopPropagation();
                                    void toggleArchiveMedia(item.id);
                                    setOpenMediaCardMenuID('');
                                  }}
                                  className="w-full rounded-lg px-3 py-2 text-left text-sm text-[#dfdfdf] hover:bg-[#1a1a1a]"
                                >
                                  {archivedMediaIDs.has(item.id) ? 'Remove from archive' : 'Archive media'}
                                </button>
                              </div>
                            ) : null}
                          </>
                        ) : null}

                        <Link
                          href={
                            item.collection_id
                              ? `/profile/${routeUserID}/media/${item.id}?source=collection&collectionId=${encodeURIComponent(item.collection_id)}`
                              : `/profile/${routeUserID}/media/${item.id}?source=country&countryCode=${encodeURIComponent((item.country_code || '').toUpperCase())}`
                          }
                          className="block"
                          onMouseEnter={onMediaCardMouseEnter}
                          onMouseLeave={onMediaCardMouseLeave}
                        >
                          {!loadedMediaPreviewIDs.has(item.id) ? (
                            <div className="pointer-events-none absolute inset-0 z-[2] grid place-items-center bg-[rgba(8,8,8,0.45)]">
                              <div className="media-plane-loader" aria-hidden="true">
                                <div className="media-plane-loader__ring" />
                                <div className="media-plane-loader__plane-wrap">
                                  <span className="media-plane-loader__trail" />
                                  <svg className="media-plane-loader__plane" viewBox="0 0 24 24" aria-hidden="true">
                                    <path d="M21 16v-2l-8-5V3.5A1.5 1.5 0 0 0 11.5 2 1.5 1.5 0 0 0 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5L21 16Z" fill="currentColor" />
                                  </svg>
                                </div>
                              </div>
                            </div>
                          ) : null}
                          {item.mime_type?.startsWith('video/') ? (
                            <>
                              <video
                                src={item.file_url}
                                muted
                                playsInline
                                preload="metadata"
                                onLoadedData={() => markMediaPreviewLoaded(item.id)}
                                className="w-full object-cover"
                              />
                              <span className="absolute top-3 right-12 h-8 w-8 rounded-full border border-[#3c3c3c] bg-[rgba(10,10,10,0.85)] text-white grid place-items-center">
                                <span className="material-symbols-rounded text-[18px]">play_arrow</span>
                              </span>
                            </>
                          ) : (
                            <img
                              src={getLowQualityMediaURL(item.file_url)}
                              alt="Uploaded media"
                              loading="lazy"
                              decoding="async"
                              onLoad={() => markMediaPreviewLoaded(item.id)}
                              onError={(event) => {
                                const target = event.currentTarget;
                                if (target.src !== item.file_url) {
                                  target.src = item.file_url;
                                  return;
                                }
                                markMediaPreviewLoaded(item.id);
                              }}
                              className="w-full object-cover"
                            />
                          )}
                        </Link>
                      </div>
                    ))}
                  </div>

                  {hasMoreAllMediaItems ? (
                    <div className="mt-6 flex justify-center">
                      <button
                        type="button"
                        onClick={() => void loadMoreAllMedia()}
                        className="rounded-full border border-[#343434] bg-[#111] px-5 py-2 text-sm text-white hover:bg-[#1a1a1a] transition"
                      >
                        {loadingMoreMedia ? 'Loading...' : 'View more'}
                      </button>
                    </div>
                  ) : null}
                </section>
              )}
            </section>
          )}

          {activeTab === 'countries' && (
            <section className="pb-16 space-y-8">
              {countriesForCards.length === 0 ? (
                <div className="flex items-center justify-center gap-2 text-[16px] tracking-[-0.41px]">
                  <span className="h-px flex-1 bg-[#1f1f1f]" />
                  <div className="flex items-center gap-1">
                    <span className="text-white font-medium">0</span>
                    <span className="text-[#606060]">/8</span>
                  </div>
                  <span className="text-white">Countries added</span>
                  <span className="material-symbols-rounded text-[#9a9a9a] text-[16px]">edit</span>
                  <span className="h-px flex-1 bg-[#1f1f1f]" />
                </div>
              ) : null}

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                {countriesForCards.length === 0 ? (
                  <div className="col-span-full rounded-2xl border border-dashed border-[#2b2b2b] bg-[#0e0e0e] p-10 md:p-16">
                    <div className="max-w-[600px] mx-auto flex flex-col items-center gap-6 text-center">
                      <div className="flex items-center gap-3">
                        {COUNTRIES_EMPTY_PREVIEW_IMAGES.map((src, idx) => (
                          <div key={src} className="w-[76px] h-[76px] md:w-[100px] md:h-[100px] rounded-[10px] overflow-hidden">
                            <img src={src} alt={`Country preview ${idx + 1}`} className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-white text-[24px] leading-[1.4] tracking-[-0.41px] font-semibold">Add your first country</h3>
                        <p className="text-[#a8a8a8] text-[16px] leading-[1.5] tracking-[-0.41px]">
                          Start with your favorite country - you can add the rest later.
                        </p>
                      </div>

                      {isOwner ? (
                        <button
                          onClick={openEditor}
                          className="w-[148px] bg-white text-black rounded-full px-5 py-2.5 text-[14px] font-medium tracking-[-0.408px] hover:bg-gray-200 transition"
                        >
                          Add Country
                        </button>
                      ) : null}
                    </div>
                  </div>
                ) : (
                  countriesForCards.map((code) => {
                    const mediaForCountry = groupedByCountry.get(code) || [];
                    const countryMeta = countryMetaByCode[code];
                    const thumb = mediaForCountry[0];
                    const flag = flags.find((f) => f.countryCode === code);
                    const thumbnailURL = countryMeta?.thumbnail_file_url || thumb?.file_url || '';
                    const countryName = flag?.countryName || code;

                    return (
                      <Link
                        key={code}
                        href={`/profile/${routeUserID}/country/${code.toLowerCase()}`}
                        className="relative aspect-square rounded-2xl overflow-hidden bg-[#101010] block"
                      >
                        <div className="absolute inset-0 bg-[#151515]">
                          {thumbnailURL ? <img src={thumbnailURL} alt={`${countryName} thumbnail`} loading="lazy" decoding="async" className="w-full h-full object-cover" /> : null}
                          <div className="absolute inset-0 bg-gradient-to-b from-transparent from-[70%] to-[rgba(0,0,0,0.5)]" />
                        </div>
                        <div className="relative h-full w-full flex items-end p-3">
                          <p
                            title={countryName}
                            className="text-white text-[24px] font-black leading-none tracking-[-0.408px] drop-shadow-[0_4px_12px_rgba(0,0,0,0.25)] truncate"
                          >
                            {countryName}
                          </p>
                        </div>
                      </Link>
                    );
                  })
                )}
              </div>
            </section>
          )}

          {activeTab === 'collections' && (
            <section className="w-full pb-8 md:pb-12 space-y-6">
              {isOwner ? (
                <div className="flex justify-end">
                  <Link
                    href={`/profile/${routeUserID}/collection/new`}
                    className="w-[180px] text-center bg-white text-black rounded-full px-5 py-2.5 text-[14px] font-medium tracking-[-0.408px] hover:bg-gray-200 transition"
                  >
                    Create Collection
                  </Link>
                </div>
              ) : null}

              {collections.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#2b2b2b] bg-[#0e0e0e] px-6 py-12 md:px-10 md:py-16">
                  <div className="max-w-[600px] mx-auto flex flex-col items-center gap-6 text-center">
                    <div className="flex items-center gap-3">
                      {COLLECTIONS_EMPTY_PREVIEW_IMAGES.map((src, idx) => (
                        <div key={src} className="w-[76px] h-[76px] md:w-[100px] md:h-[100px] rounded-[10px] overflow-hidden">
                          <img src={src} alt={`Collection preview ${idx + 1}`} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-white text-[24px] leading-[1.4] tracking-[-0.41px] font-semibold">Your collections</h3>
                      <p className="text-[#a8a8a8] text-[16px] leading-[1.5] tracking-[-0.41px] max-w-[560px]">
                        Group photos and videos by theme - not location. Examples: Street photography, cafes I loved, mountains and hikes, portraits, night walks.
                      </p>
                    </div>

                    {isOwner ? (
                      <Link
                        href={`/profile/${routeUserID}/collection/new`}
                        className="w-[160px] bg-white text-black rounded-full px-5 py-2.5 text-[14px] font-medium tracking-[-0.408px] hover:bg-gray-200 transition"
                      >
                        Create Collection
                      </Link>
                    ) : null}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {collections.map((collection) => {
                    const mediaForCollection = mediaItems.filter((item) => item.collection_id === collection.id);
                    const thumbnail = mediaForCollection[0]?.file_url || '';
                    const createdAt = new Date(collection.created_at);
                    const createdLabel = Number.isNaN(createdAt.getTime())
                      ? ''
                      : createdAt.toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      });
                    const countryNames = Array.from(
                      new Set(
                        mediaForCollection
                          .map((item) => (item.country_code || '').toUpperCase())
                          .filter(Boolean)
                          .map((code) => flags.find((f) => f.countryCode === code)?.countryName || code)
                      )
                    );
                    const visibleCountries = countryNames.slice(0, 3);
                    const hiddenCountriesCount = Math.max(0, countryNames.length - visibleCountries.length);

                    return (
                      <Link
                        key={collection.id}
                        href={`/profile/${routeUserID}/collection/${collection.id}`}
                        className="group block"
                      >
                        <div className="relative aspect-[1.22] rounded-2xl overflow-hidden bg-[#151515] border border-[#1f1f1f]">
                          {thumbnail ? <img src={thumbnail} alt={collection.title} className="w-full h-full object-cover" /> : null}
                          <button
                            type="button"
                            aria-label="Collection options"
                            className="absolute bottom-3 right-3 h-10 w-10 rounded-full border border-[#353535] bg-[rgba(17,17,17,0.9)] text-white grid place-items-center opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => e.preventDefault()}
                          >
                            <span className="material-symbols-rounded text-[20px]">more_horiz</span>
                          </button>
                        </div>
                        <div className="pt-2 px-1 space-y-1.5">
                          <p className="text-[#989898] text-[11px] leading-[1.4] tracking-[-0.3px]">{createdLabel || 'Recently added'}</p>
                          <p className="text-white text-[14px] leading-[1.35] tracking-[-0.5px] font-semibold line-clamp-1">{collection.title}</p>
                          <p className="text-[#989898] text-[12px] leading-[1.4] tracking-[-0.4px] line-clamp-1">{collection.description || 'No description yet.'}</p>

                          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                            {visibleCountries.map((country) => (
                              <span
                                key={`${collection.id}-${country}`}
                                className="inline-flex items-center rounded-full border border-[#353535] bg-[#1e1e1e] px-2 py-[3px] text-[10px] leading-none text-[#bdbdbd]"
                              >
                                {country}
                              </span>
                            ))}
                            {hiddenCountriesCount > 0 ? (
                              <span className="inline-flex items-center rounded-full border border-[#353535] bg-[#1e1e1e] px-2 py-[3px] text-[10px] leading-none text-[#bdbdbd]">
                                +{hiddenCountriesCount}
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {activeTab === 'about' && (
            hasAboutContent ? (
              <section className="grid xl:grid-cols-[1fr_360px] gap-6 items-start">
                <article className="group relative rounded-2xl border border-[#1f1f1f] p-6 bg-[#161616] space-y-6">
                  {isOwner ? (
                    <Link
                      href={`/profile/${routeUserID}/edit`}
                      aria-label="Edit about section"
                      className="absolute right-4 top-4 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-black opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                    >
                      <span className="material-symbols-rounded text-[18px]">edit</span>
                    </Link>
                  ) : null}
                  <div className="space-y-3">
                    <h3 className="text-[32px] text-2xl font-semibold tracking-[-0.5px]">About</h3>
                    <p className="text-[#b7b7b7] leading-7 text-sm md:text-base">
                      {profile.bio || 'No bio yet. Add your travel story from Edit profile.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {aboutPhotos.length > 0 ? (
                      aboutPhotos.map((src, idx) => (
                        <div key={`${src}-${idx}`} className="rounded-xl overflow-hidden border border-[#2b2b2b] bg-[#111] aspect-[1.06]">
                          <img src={src} alt={`About photo ${idx + 1}`} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                        </div>
                      ))
                    ) : (
                      <div className="col-span-full rounded-xl border border-dashed border-[#2b2b2b] bg-[#111] p-6 text-sm text-[#7c7c7c] text-center">
                        No photos added yet.
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-[28px] text-xl font-semibold tracking-[-0.5px]">My Interests</h4>
                    {aboutInterests.length > 0 ? (
                      <div className="flex flex-wrap gap-2.5">
                        {aboutInterests.map((interest) => (
                          <span key={interest} className="px-3.5 py-1.5 rounded-full border border-[#464646] bg-[#161616] text-[#d0d0d0] text-sm">
                            {interest}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[#7c7c7c] text-sm">No interests added yet.</p>
                    )}
                  </div>
                </article>

                <aside className="rounded-2xl border border-[#1f1f1f] p-6 bg-[#161616] space-y-6">
                  <div className="space-y-1 pb-4 border-b border-[#2a2a2a]">
                    <p className="text-[#7c7c7c] text-xs">Username</p>
                    <p className="text-white text-lg font-medium">{handle}</p>
                    <p className="text-[#5f5f5f] text-xs">travingat.com/{profile.username || ''}</p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[#7c7c7c] text-xs">Home land</p>
                    {homeland ? (
                      <div className="flex items-center gap-2 text-[#f0f0f0] text-sm">
                        {homelandFlag ? <img src={homelandFlag} alt="Homeland flag" className="w-5 h-3.5 rounded-sm object-cover" /> : null}
                        <span>{homeland}</span>
                      </div>
                    ) : (
                      <p className="text-[#8a8a8a] text-sm">Not set</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <p className="text-[#7c7c7c] text-xs">Currently in</p>
                    {currentlyIn ? (
                      <div className="flex items-center gap-2 text-[#f0f0f0] text-sm">
                        {currentlyInFlag ? <img src={currentlyInFlag} alt="Current location flag" className="w-5 h-3.5 rounded-sm object-cover" /> : null}
                        <span>{currentlyIn}</span>
                      </div>
                    ) : (
                      <p className="text-[#8a8a8a] text-sm">Not set</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <p className="text-[#7c7c7c] text-xs">Speaks</p>
                    {aboutLanguages.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {aboutLanguages.map((language) => (
                          <span key={language} className="px-3 py-1 rounded-full bg-[#1f1f1f] border border-[#3a3a3a] text-[#d8d8d8] text-xs">
                            {language}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[#8a8a8a] text-sm">No languages selected.</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <p className="text-[#7c7c7c] text-xs">Find me On</p>
                    {socialRows.length > 0 ? (
                      <div className="space-y-1.5">
                        {socialRows.map((item) => (
                          <p key={item.key} className="text-[#efefef] text-sm truncate">{item.label}</p>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[#8a8a8a] text-sm">No social links added.</p>
                    )}
                  </div>
                </aside>
              </section>
            ) : (
              <section className="w-full pb-8 md:pb-12">
                <div className="rounded-2xl border border-dashed border-[#2b2b2b] bg-[#0e0e0e] px-6 py-12 md:px-10 md:py-16">
                  <div className="max-w-[600px] mx-auto flex flex-col items-center gap-6 text-center">
                    <div className="space-y-2">
                      <h3 className="text-white text-[24px] leading-[1.4] tracking-[-0.41px] font-semibold">Tell your travel story</h3>
                      <p className="text-[#a8a8a8] text-[16px] leading-[1.5] tracking-[-0.41px] max-w-[560px]">
                        Add a short bio, your interests, languages, and links so people can understand your style and follow your journey.
                      </p>
                    </div>

                    {isOwner ? (
                      <button
                        onClick={openEditor}
                        className="w-[148px] bg-white text-black rounded-full px-5 py-2.5 text-[14px] font-medium tracking-[-0.408px] hover:bg-gray-200 transition"
                      >
                        Edit Profile
                      </button>
                    ) : null}
                  </div>
                </div>
              </section>
            )
          )}

          <footer className="pt-2 pb-4 md:pb-6">
            <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8 text-[12px] text-[#7c7c7c] tracking-[-0.3px]">
              <span>Help</span>
              <span>About</span>
              <span>Careers</span>
              <span>Blog</span>
              <span>Terms of Service</span>
              <span>Privacy Policy</span>
            </div>
          </footer>

          <div className="md:hidden fixed inset-x-0 bottom-0 z-40 border-t border-[#161616] bg-black px-3 pt-3 pb-5">
            <div className="flex items-center gap-2">
              <button className="flex-1 rounded-full bg-white text-black px-5 py-2.5 text-[16px] font-medium tracking-[-0.41px]">Follow</button>
              <button className="h-[43px] w-[43px] rounded-full border border-[#363636] bg-[#181818] grid place-items-center text-white" aria-label="More options">
                <span className="material-symbols-rounded text-[20px]">more_horiz</span>
              </button>
              <button className="flex-1 rounded-full border border-[#363636] bg-[#181818] text-white px-5 py-2.5 text-[16px] font-medium tracking-[-0.41px]">Connect</button>
            </div>
          </div>
        </main>
      </div>

      {showCountryEditor && (
        <div className="fixed inset-0 z-50 bg-black text-white overflow-hidden">
          <div className="max-w-[1488px] mx-auto px-6 md:px-10 py-8 h-screen flex flex-col gap-6">
            <div className="flex items-center justify-between gap-4">
              <button
                onClick={() => setShowCountryEditor(false)}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-[#363636] bg-[#181818] px-5 py-3 text-[14px] font-medium leading-[1.4] tracking-[-0.408px] text-white hover:bg-[#232323] transition"
              >
                <span className="material-symbols-rounded text-[16px] leading-none">arrow_back</span>
                Back
              </button>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-[#363636] bg-[#181818] px-5 py-3 text-[14px] font-medium leading-[1.4] tracking-[-0.408px] text-white hover:bg-[#232323] transition"
                >
                  <span className="material-symbols-rounded text-[18px] leading-none">cloud_upload</span>
                  Upload
                </button>
                <button
                  onClick={saveCountry}
                  disabled={savingCountry}
                  className="w-[140px] rounded-full bg-white px-6 py-3 text-[14px] font-medium leading-[1.4] tracking-[-0.408px] text-black hover:bg-gray-200 transition disabled:opacity-60"
                >
                  {savingCountry ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>

            <div className="max-w-[560px] mx-auto text-center space-y-4">
              <input
                value={countryInput}
                onChange={(e) => {
                  const value = e.target.value;
                  setCountryInput(value);
                  latestCountryInputRef.current = value;
                  setSelectedCountryCode('');
                  latestSelectedCountryCodeRef.current = '';
                  setLocationInput('');
                  setSelectedLocation(null);
                  setLocationSuggestions([]);
                  setShowLocationSuggestions(false);
                  setEditorError('');
                  setShowCountrySuggestions(true);
                }}
                onKeyDown={(e) => {
                  if (e.key !== 'Enter') return;
                  e.preventDefault();

                  const match = countrySuggestions.find(
                    (item) => item.countryName.toLowerCase() === countryInput.trim().toLowerCase()
                  ) || countrySuggestions[0];

                  if (!match) {
                    setCountryInput('');
                    latestCountryInputRef.current = '';
                    setSelectedCountryCode('');
                    latestSelectedCountryCodeRef.current = '';
                    setShowCountrySuggestions(false);
                    setLocationInput('');
                    setSelectedLocation(null);
                    setLocationSuggestions([]);
                    setShowLocationSuggestions(false);
                    setEditorError('Select a country from the suggestions list.');
                    return;
                  }

                  setCountryInput(match.countryName);
                  latestCountryInputRef.current = match.countryName;
                  setSelectedCountryCode(match.countryCode);
                  latestSelectedCountryCodeRef.current = match.countryCode;
                  setLocationInput('');
                  setSelectedLocation(null);
                  setLocationSuggestions([]);
                  setShowLocationSuggestions(false);
                  setEditorError('');
                  setShowCountrySuggestions(false);
                }}
                onFocus={() => setShowCountrySuggestions(true)}
                onBlur={() => {
                  // Delay closing so click on suggestion can register.
                  setTimeout(() => {
                    setShowCountrySuggestions(false);
                    const latestInput = latestCountryInputRef.current.trim();
                    const latestCode = latestSelectedCountryCodeRef.current;

                    if (!latestInput) return;
                    if (latestCode) return;

                    setCountryInput('');
                    latestCountryInputRef.current = '';
                    setSelectedCountryCode('');
                    latestSelectedCountryCodeRef.current = '';
                    setLocationInput('');
                    setSelectedLocation(null);
                    setLocationSuggestions([]);
                    setShowLocationSuggestions(false);
                    setEditorError('Select a country from the suggestions list.');
                  }, 120);
                }}
                placeholder="Country name"
                className="w-full bg-transparent border-b border-[#2b2b2b] text-[52px] font-semibold tracking-[-0.5px] text-center focus:outline-none"
              />
              {showCountrySuggestions && countrySuggestions.length > 0 && (
                <div className="mx-auto w-full max-w-md rounded-2xl border border-[#2a2a2a] bg-[#0f0f10] p-2 text-left max-h-56 overflow-y-auto">
                  {countrySuggestions.map((item) => (
                    <button
                      key={item.countryCode}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setCountryInput(item.countryName);
                        latestCountryInputRef.current = item.countryName;
                        setSelectedCountryCode(item.countryCode);
                        latestSelectedCountryCodeRef.current = item.countryCode;
                        setLocationInput('');
                        setSelectedLocation(null);
                        setLocationSuggestions([]);
                        setShowLocationSuggestions(false);
                        setEditorError('');
                        setShowCountrySuggestions(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-[#1a1a1a] transition"
                    >
                      <img src={item.path} alt={`${item.countryName} flag`} className="w-5 h-4 rounded-sm object-cover" />
                      <span className="text-sm text-white">{item.countryName}</span>
                      <span className="ml-auto text-xs text-[#9d9d9d]">{item.countryCode}</span>
                    </button>
                  ))}
                </div>
              )}
              <div className="flex items-center justify-center gap-2">
                <button onClick={() => setEditorTab('media')} className={`px-6 py-2 rounded-full text-sm ${editorTab === 'media' ? 'border border-white bg-[#1a1a1a]' : 'bg-[#171717] text-[#8d8d8d]'}`}>All media</button>
                <button onClick={() => setEditorTab('about')} className={`px-6 py-2 rounded-full text-sm ${editorTab === 'about' ? 'border border-white bg-[#1a1a1a]' : 'bg-[#171717] text-[#8d8d8d]'}`}>About</button>
              </div>
            </div>

            {editorError ? <p className="text-center text-red-400 text-sm">{editorError}</p> : null}

            {editorTab === 'media' && (
              <div className="grid xl:grid-cols-[1fr_290px] gap-5 flex-1 min-h-0">
                <section className="rounded-2xl border border-[#232323] bg-[#0d0d0d] p-5 min-h-0 h-full overflow-hidden flex flex-col">
                  {pendingUploads.length === 0 ? (
                    <div className="h-full min-h-[420px] flex flex-col items-center justify-center text-center gap-4">
                      <h3 className="text-[36px] tracking-[-0.5px] font-semibold">Add Photos / Videos</h3>
                      <p className="text-[#7c7c7c]">Upload photos and videos from this country.</p>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-8 py-2.5 rounded-full bg-white text-black text-sm font-medium"
                      >
                        Upload
                      </button>
                    </div>
                  ) : (
                    <div className="h-full min-h-0 overflow-y-auto pr-2">
                      <div className="columns-2 lg:columns-3 gap-4">
                        {pendingUploads.map((item) => (
                          <div
                            key={item.id}
                            className={`group relative mb-4 w-full break-inside-avoid rounded-2xl overflow-hidden border-2 ${selectedUploadID === item.id ? 'border-[#ffc857]' : 'border-transparent'}`}
                          >
                            <button type="button" onClick={() => setSelectedUploadID(item.id)} className="block w-full">
                              {(item.mimeType || '').startsWith('video/') ? (
                                <video
                                  src={item.preview}
                                  muted
                                  playsInline
                                  preload="metadata"
                                  className="w-full h-auto object-cover"
                                />
                              ) : (
                                <img src={item.preview} alt="Pending upload" loading="lazy" decoding="async" className="w-full h-auto object-cover" />
                              )}
                            </button>
                            <button
                              type="button"
                              aria-label="Remove uploaded media"
                              onClick={(e) => {
                                e.stopPropagation();
                                removePendingUpload(item.id);
                              }}
                              className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white opacity-0 transition group-hover:opacity-100 hover:bg-black/90"
                            >
                              <span className="material-symbols-rounded block text-[18px] leading-none">close</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </section>

                <aside className="rounded-2xl border border-[#232323] bg-[#0f0f10] p-4 space-y-5">
                  {selectedUpload ? (
                    (selectedUpload.mimeType || '').startsWith('video/') ? (
                      <video
                        src={selectedUpload.preview}
                        muted
                        playsInline
                        preload="metadata"
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    ) : (
                      <img src={selectedUpload.preview} alt="Selected media" className="w-12 h-12 rounded-lg object-cover" />
                    )
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-[#1b1b1b]" />
                  )}

                  <div className="space-y-2">
                    <p className="text-sm text-[#e9e9e9]">Description</p>
                    <textarea
                      value={aboutText}
                      onChange={(e) => setAboutText(e.target.value)}
                      rows={4}
                      placeholder="Write something about this moment..."
                      className="w-full bg-transparent border-b border-[#2a2a2a] text-sm text-[#cfcfcf] resize-none focus:outline-none"
                    />
                  </div>

                  <div className="pt-2 border-t border-[#1f1f1f]">
                    <p className="text-sm text-[#e9e9e9] mb-1">Add location</p>
                    <p className="text-xs text-[#727272]">Where in {countryInput || 'this country'} was this taken?</p>
                    <div className="mt-2 relative">
                      <input
                        value={locationInput}
                        onChange={(e) => {
                          setLocationInput(e.target.value);
                          setSelectedLocation(null);
                          setEditorError('');
                          setShowLocationSuggestions(true);
                        }}
                        onFocus={() => setShowLocationSuggestions(true)}
                        onBlur={() => {
                          setTimeout(() => {
                            setShowLocationSuggestions(false);
                            if (!locationInput.trim()) return;
                            if (selectedLocation) return;
                            setEditorError('Select a location from suggestions or clear the location field.');
                          }, 120);
                        }}
                        placeholder={selectedCountryCode ? 'Search city, area, landmark' : 'Select country first'}
                        disabled={!selectedCountryCode}
                        className="w-full rounded-xl border border-[#2a2a2a] bg-[#131313] px-3 py-2 text-sm text-[#e6e6e6] placeholder:text-[#6f6f6f] focus:outline-none disabled:opacity-50"
                      />

                      {showLocationSuggestions && selectedCountryCode && (
                        <div className="absolute z-30 mt-2 w-full rounded-xl border border-[#2a2a2a] bg-[#0f0f10] p-1 max-h-52 overflow-y-auto">
                          {isLoadingLocationSuggestions ? (
                            <p className="px-3 py-2 text-xs text-[#8a8a8a]">Searching locations...</p>
                          ) : locationSuggestions.length === 0 ? (
                            <p className="px-3 py-2 text-xs text-[#8a8a8a]">No locations found</p>
                          ) : (
                            locationSuggestions.map((item) => (
                              <button
                                key={item.place_id}
                                type="button"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  const lat = Number(item.lat);
                                  const lng = Number(item.lon);
                                  setLocationInput(item.display_name);
                                  setSelectedLocation({
                                    name: item.display_name,
                                    lat,
                                    lng,
                                  });
                                  setEditorError('');
                                  setShowLocationSuggestions(false);
                                }}
                                className="w-full rounded-lg px-3 py-2 text-left hover:bg-[#1b1b1b] transition"
                              >
                                <p className="text-xs text-[#e7e7e7] truncate">{item.display_name}</p>
                              </button>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3">
                    <span className="text-sm text-[#f0f0f0]">Set as thumbnail</span>
                    <button
                      onClick={() => {
                        if (selectedUpload) setSelectedUploadID(selectedUpload.id);
                      }}
                      className={`h-6 w-12 rounded-full transition ${selectedUpload ? 'bg-[#5952ff]' : 'bg-[#2e2e2e]'}`}
                    >
                      <span className={`block h-4 w-4 rounded-full bg-white transition ${selectedUpload ? 'translate-x-7' : 'translate-x-1'}`} />
                    </button>
                  </div>
                </aside>
              </div>
            )}

            {editorTab === 'about' && (
              <div className="grid lg:grid-cols-[1fr_320px] gap-5">
                <section className="rounded-2xl border border-[#232323] bg-[#0f0f10] p-5 min-h-[360px]">
                  <h3 className="text-[36px] font-semibold mb-4">About</h3>
                  <textarea
                    value={aboutText}
                    onChange={(e) => setAboutText(e.target.value)}
                    placeholder="Write about your time here..."
                    className="w-full min-h-[240px] bg-transparent text-[#cfcfcf] focus:outline-none resize-none"
                  />
                </section>

                <aside className="rounded-2xl border border-[#232323] bg-[#0f0f10] p-5 space-y-5 h-fit">
                  <div>
                    <p className="text-[24px] font-semibold mb-1">When did you visit?</p>
                    <p className="text-sm text-[#767676]">Add one or more visits to this country.</p>
                  </div>

                  <div className="flex gap-3">
                    <select value={visitMonth} onChange={(e) => setVisitMonth(e.target.value)} className="bg-[#171717] rounded-full px-4 py-2 text-sm">
                      <option value="">Month</option>
                      {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                    <select value={visitYear} onChange={(e) => setVisitYear(e.target.value)} className="bg-[#171717] rounded-full px-4 py-2 text-sm">
                      <option value="">Year</option>
                      {Array.from({ length: 40 }).map((_, i) => {
                        const year = String(new Date().getFullYear() - i);
                        return <option key={year} value={year}>{year}</option>;
                      })}
                    </select>
                  </div>

                  <button className="text-sm text-[#888] hover:text-white transition">+ Add another visit</button>
                </aside>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*"
              className="hidden"
              onChange={onPickFiles}
            />
          </div>
        </div>
      )}

      <input
        ref={avatarInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onSelectProfileAsset('avatar_url')}
      />

      <input
        ref={coverInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onSelectProfileAsset('cover_image_url')}
      />

      {uploadingProfileAsset ? (
        <div className="fixed inset-0 z-[85] bg-black/80 backdrop-blur-sm grid place-items-center px-6">
          <div className="w-full max-w-sm rounded-2xl border border-[#2a2a2a] bg-[#0e0e0f] p-6 text-center space-y-4">
            <div className="mx-auto h-10 w-10 rounded-full border-2 border-[#3a3a3a] border-t-white animate-spin" />
            <p className="text-white text-base font-medium">
              {uploadingProfileAsset === 'avatar' ? 'Uploading profile photo...' : 'Uploading cover photo...'}
            </p>
            <p className="text-sm text-[#b1b1b1]">Please wait while we save your image.</p>
          </div>
        </div>
      ) : null}

      {savingCountry && (
        <div className="fixed inset-0 z-[80] bg-black/90 backdrop-blur-sm grid place-items-center px-6">
          <div className="w-full max-w-md rounded-2xl border border-[#2a2a2a] bg-[#0e0e0f] p-6 space-y-4 text-center">
            <p className="text-lg font-semibold text-white">{UPLOAD_QUOTES[uploadQuoteIndex]}</p>
            <div className="w-full h-3 bg-[#222] rounded-full overflow-hidden">
              <div className="h-full bg-white transition-all duration-200" style={{ width: `${uploadProgress}%` }} />
            </div>
            <p className="text-sm text-[#d5d5d5]">{uploadProgress}%</p>
          </div>
        </div>
      )}
    </>
  );
}
