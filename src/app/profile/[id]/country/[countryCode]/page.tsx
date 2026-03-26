'use client';

import { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { apiFetch } from '@/lib/auth-client';
import { flags } from '@/lib/flags';
import { ReportSheet, ShareSheet, ShareVariant } from '@/components/ProfileActionSheets';

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
  mime_type: string;
  caption: string;
  created_at: string;
};

type CountryMeta = {
  country_code: string;
  description: string;
  thumbnail_media_id?: string;
  thumbnail_file_url: string;
};

const isUUIDLike = (value: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);

export default function CountryDetailPage() {
  const params = useParams<{ id: string; countryCode: string }>();
  const routeUserID = params?.id || '';
  const routeCountryCode = (params?.countryCode || '').toUpperCase();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [allMedia, setAllMedia] = useState<MediaItem[]>([]);
  const [isOwner, setIsOwner] = useState(false);
  const [countryMeta, setCountryMeta] = useState<CountryMeta | null>(null);
  const [countryDescription, setCountryDescription] = useState('');
  const [descriptionDraft, setDescriptionDraft] = useState('');
  const [savingDescription, setSavingDescription] = useState(false);
  const [updatingMenuForMediaID, setUpdatingMenuForMediaID] = useState('');
  const [editingMedia, setEditingMedia] = useState<MediaItem | null>(null);
  const [captionDraft, setCaptionDraft] = useState('');
  const [savingCaption, setSavingCaption] = useState(false);
  const [openMenuMediaID, setOpenMenuMediaID] = useState('');
  const [favoriteMediaIDs, setFavoriteMediaIDs] = useState<Set<string>>(new Set());
  const [shareState, setShareState] = useState<{
    open: boolean;
    variant: ShareVariant;
    title: string;
    previewUrl: string;
    countryFlagUrl?: string;
    shareUrl: string;
  }>({
    open: false,
    variant: 'media',
    title: '',
    previewUrl: '',
    shareUrl: '',
  });
  const [reportState, setReportState] = useState<{ open: boolean; label: string }>({ open: false, label: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        if (!isUUIDLike(routeUserID)) {
          setError('Profile not found');
          return;
        }

        if (!routeCountryCode) {
          setError('Country not found');
          return;
        }

        let owner = false;
        try {
          const meRes = await apiFetch(`${API_URL}/api/auth/me`);
          if (meRes.ok) {
            const meData = await meRes.json();
            owner = meData.user_id === routeUserID;
          }
        } catch {
          owner = false;
        }

        const [profileRes, mediaRes, countryMetaRes] = await Promise.all([
          fetch(`${API_URL}/api/public/profile/id/${routeUserID}`),
          owner ? apiFetch(`${API_URL}/api/media`) : fetch(`${API_URL}/api/public/media/user/${routeUserID}`),
          owner
            ? apiFetch(`${API_URL}/api/media/country-meta`)
            : fetch(`${API_URL}/api/public/media/user/${routeUserID}/country-meta`),
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
        const filtered = mediaItems.filter(
          (item) => (item.country_code || '').toUpperCase() === routeCountryCode
        );

        const metaItems: CountryMeta[] = Array.isArray(countryMetaData.items) ? countryMetaData.items : [];
        const countryMeta = metaItems.find(
          (item) => (item.country_code || '').toUpperCase() === routeCountryCode
        );

        setProfile(profileData);
        setIsOwner(owner);
        setAllMedia(filtered);
        setCountryMeta(countryMeta || null);
        setCountryDescription(countryMeta?.description || '');
        setDescriptionDraft(countryMeta?.description || '');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Network error. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [routeCountryCode, routeUserID]);

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
    if (typeof window === 'undefined') return;
    const raw = window.localStorage.getItem(`travingat:favorites:${routeUserID}`);
    if (!raw) return;
    try {
      const ids: string[] = JSON.parse(raw);
      if (Array.isArray(ids)) setFavoriteMediaIDs(new Set(ids));
    } catch {
      // Ignore malformed storage and continue with empty state.
    }
  }, [routeUserID]);

  const persistFavoriteIDs = (next: Set<string>) => {
    setFavoriteMediaIDs(next);
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(`travingat:favorites:${routeUserID}`, JSON.stringify(Array.from(next)));
  };

  const toggleFavorite = (mediaID: string) => {
    const next = new Set(favoriteMediaIDs);
    if (next.has(mediaID)) {
      next.delete(mediaID);
    } else {
      next.add(mediaID);
    }
    persistFavoriteIDs(next);
    setOpenMenuMediaID('');
  };

  const openShareForMedia = (item: MediaItem) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const shareUrl = `${origin}/profile/${routeUserID}/media/${item.id}?source=country&countryCode=${encodeURIComponent(routeCountryCode)}`;
    setShareState({
      open: true,
      variant: 'media',
      title: item.caption?.trim() || 'Share moment',
      previewUrl: item.file_url,
      shareUrl,
    });
    setOpenMenuMediaID('');
  };

  const openShareForCountry = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const shareUrl = `${origin}/profile/${routeUserID}/country/${routeCountryCode.toLowerCase()}`;
    const firstMedia = allMedia[0];
    setShareState({
      open: true,
      variant: 'country',
      title: `Share ${countryName}`,
      previewUrl: countryMeta?.thumbnail_file_url || firstMedia?.file_url || profile?.avatar_url || '',
      countryFlagUrl: countryFlag?.path,
      shareUrl,
    });
  };

  const openReport = (label: string) => {
    setReportState({ open: true, label });
    setOpenMenuMediaID('');
  };

  const uploadMoreMedia = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('country_code', routeCountryCode);

        const uploadRes = await apiFetch(`${API_URL}/api/media/upload`, {
          method: 'POST',
          body: formData,
        });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) {
          throw new Error(uploadData.error || 'Failed to upload media');
        }

        const createdMedia = uploadData as MediaItem;
        setAllMedia((prev) => [createdMedia, ...prev]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload media');
    } finally {
      event.target.value = '';
    }
  };

  const saveCountryDescription = async () => {
    if (!isOwner) return;
    setSavingDescription(true);
    setError('');

    try {
      const res = await apiFetch(`${API_URL}/api/media/country-meta`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          country_code: routeCountryCode,
          description: descriptionDraft,
          thumbnail_media_id: countryMeta?.thumbnail_media_id || null,
          thumbnail_file_url: countryMeta?.thumbnail_file_url || '',
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update country description');
      }

      setCountryDescription(descriptionDraft);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update country description');
    } finally {
      setSavingDescription(false);
    }
  };

  const removeMedia = async (mediaID: string) => {
    if (!isOwner) return;
    setUpdatingMenuForMediaID(mediaID);
    setError('');

    try {
      const res = await apiFetch(`${API_URL}/api/media/${mediaID}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete media');
      }

      setAllMedia((prev) => prev.filter((item) => item.id !== mediaID));
      if (countryMeta?.thumbnail_media_id === mediaID) {
        setCountryMeta((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            thumbnail_media_id: undefined,
            thumbnail_file_url: '',
          };
        });
      }
      setOpenMenuMediaID('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete media');
    } finally {
      setUpdatingMenuForMediaID('');
    }
  };

  const saveCaption = async () => {
    if (!editingMedia) return;

    setSavingCaption(true);
    setError('');
    try {
      const res = await apiFetch(`${API_URL}/api/media/${editingMedia.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caption: captionDraft }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update description');
      }

      setAllMedia((prev) => prev.map((item) => (item.id === editingMedia.id ? { ...item, caption: captionDraft } : item)));
      setEditingMedia(null);
      setCaptionDraft('');
      setOpenMenuMediaID('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update description');
    } finally {
      setSavingCaption(false);
    }
  };

  const countryFlag = flags.find((flag) => flag.countryCode === routeCountryCode);
  const countryName = countryFlag?.countryName || routeCountryCode;

  const media = allMedia;

  const lastUpdatedLabel = useMemo(() => {
    if (allMedia.length === 0) return 'No updates yet';

    const latest = allMedia.reduce((acc, item) => {
      const currentTs = Date.parse(item.created_at || '');
      const accTs = Date.parse(acc.created_at || '');
      if (!Number.isFinite(currentTs)) return acc;
      if (!Number.isFinite(accTs) || currentTs > accTs) return item;
      return acc;
    }, allMedia[0]);

    const parsed = Date.parse(latest.created_at || '');
    if (!Number.isFinite(parsed)) return 'No updates yet';

    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(parsed));
  }, [allMedia]);

  const visitedLabel = useMemo(() => {
    const buckets = new Set<string>();
    for (const item of allMedia) {
      const parsed = Date.parse(item.created_at || '');
      if (!Number.isFinite(parsed)) continue;
      const formatted = new Intl.DateTimeFormat('en-GB', {
        month: 'short',
        year: 'numeric',
      }).format(new Date(parsed));
      buckets.add(formatted);
    }

    const values = Array.from(buckets);
    if (values.length === 0) return 'No visits recorded yet';
    return `Visited: ${values.join(', ')}`;
  }, [allMedia]);

  if (loading) {
    return <div className="min-h-screen bg-black text-white grid place-items-center">Loading country...</div>;
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-black text-white grid place-items-center px-6">
        <div className="text-center space-y-4">
          <p>{error || 'Country not found'}</p>
          <Link href={`/profile/${routeUserID}`} className="underline text-gray-300 hover:text-white">Back to profile</Link>
        </div>
      </div>
    );
  }

  const displayName = profile.display_name || profile.username;

  return (
    <div className="min-h-screen bg-black text-white lg:h-screen lg:overflow-hidden">
      <div className="mx-auto flex h-full w-full max-w-[1800px] flex-col gap-8 px-4 py-6 md:px-8 lg:flex-row lg:items-start lg:gap-10 lg:px-10 lg:py-10 xl:px-12">
        <main className="min-h-0 flex-1 lg:h-full lg:overflow-y-auto lg:pr-2">
          {media.length === 0 ? (
            <section className="grid h-[50vh] place-items-center rounded-2xl border border-dashed border-[#2b2b2b] bg-[#0e0e0e] px-6 text-center text-[#8e8e8e]">
              No media found for this country.
            </section>
          ) : (
            <section className="columns-2 gap-4 space-y-4 md:columns-3 xl:columns-4 2xl:columns-5">
              {media.map((item) => (
                <div key={item.id} className="group relative break-inside-avoid" ref={openMenuMediaID === item.id ? menuRef : undefined}>
                  <Link
                    href={`/profile/${routeUserID}/media/${item.id}?source=country&countryCode=${encodeURIComponent(routeCountryCode)}`}
                    className="relative block overflow-hidden rounded-2xl bg-[#111]"
                  >
                    {item.mime_type.startsWith('video/') ? (
                      <video src={item.file_url} preload="metadata" className="w-full object-cover transition duration-300 group-hover:scale-[1.02]" />
                    ) : (
                      <img
                        src={item.file_url}
                        alt={`${countryName} media`}
                        loading="lazy"
                        decoding="async"
                        className="w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                      />
                    )}
                  </Link>

                  <>
                    <button
                      type="button"
                      aria-label="Media options"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setOpenMenuMediaID((current) => (current === item.id ? '' : item.id));
                      }}
                      className="absolute bottom-3 right-3 h-10 w-10 rounded-full border border-[#353535] bg-[rgba(17,17,17,0.9)] text-white grid place-items-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <span className="material-symbols-rounded text-[20px]">more_horiz</span>
                    </button>

                    {openMenuMediaID === item.id ? (
                      <div className="absolute bottom-16 right-3 z-30 min-w-[220px] rounded-2xl border border-[#2f2f2f] bg-[#0d0d0e] p-2 shadow-[0_16px_36px_rgba(0,0,0,0.45)]">
                        <button
                          type="button"
                          onClick={() => openShareForMedia(item)}
                          className="w-full rounded-xl px-3 py-2 text-left text-sm text-[#dfdfdf] hover:bg-[#1a1a1a]"
                        >
                          Share media
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleFavorite(item.id)}
                          className="w-full rounded-xl px-3 py-2 text-left text-sm text-[#dfdfdf] hover:bg-[#1a1a1a]"
                        >
                          {favoriteMediaIDs.has(item.id) ? 'Remove favorite' : 'Add to favorites'}
                        </button>
                        <button
                          type="button"
                          onClick={() => openReport('media')}
                          className="w-full rounded-xl px-3 py-2 text-left text-sm text-[#dfdfdf] hover:bg-[#1a1a1a]"
                        >
                          Report media
                        </button>
                        {isOwner ? (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingMedia(item);
                                setCaptionDraft(item.caption || '');
                              }}
                              className="w-full rounded-xl px-3 py-2 text-left text-sm text-[#dfdfdf] hover:bg-[#1a1a1a]"
                            >
                              Edit description
                            </button>
                            <button
                              type="button"
                              disabled={updatingMenuForMediaID === item.id}
                              onClick={() => removeMedia(item.id)}
                              className="w-full rounded-xl px-3 py-2 text-left text-sm text-[#ffb1b1] hover:bg-[#1a1a1a] disabled:opacity-60"
                            >
                              {updatingMenuForMediaID === item.id ? 'Deleting...' : 'Delete media'}
                            </button>
                          </>
                        ) : null}
                      </div>
                    ) : null}
                  </>
                </div>
              ))}
            </section>
          )}
        </main>

        <aside className="w-full shrink-0 rounded-2xl border border-[#2a2a2a] bg-[#111] p-6 sm:p-8 lg:h-full lg:w-[380px] lg:max-w-[380px] lg:overflow-y-auto">
          <div className="mb-8 flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={displayName} className="h-14 w-14 rounded-xl object-cover" />
              ) : (
                <span className="h-14 w-14 rounded-xl bg-[#2a2a2a]" />
              )}
              <div>
                <p className="text-sm text-[#a8a8a8]">@{profile.username || displayName}</p>
                <p className="text-base font-semibold text-white">{displayName}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={openShareForCountry}
                className="rounded-full border border-[#363636] bg-[#181818] px-4 py-2 text-xs font-medium text-[#ececec] hover:bg-[#202020]"
              >
                Share
              </button>
              <Link
                href={`/profile/${routeUserID}`}
                className="rounded-full border border-[#363636] bg-[#181818] px-4 py-2 text-xs font-medium text-[#ececec] hover:bg-[#202020]"
              >
                Back
              </Link>
            </div>
          </div>

          <section className="space-y-4">
            <div className="flex items-center gap-3">
              {countryFlag ? (
                <img src={countryFlag.path} alt={`${countryName} flag`} className="h-6 w-9 rounded-[4px] object-cover" />
              ) : null}
              <h1 className="text-[28px] font-semibold leading-tight tracking-[-0.4px] text-[#ededed]">{countryName}</h1>
            </div>

            <p className="text-sm text-[#7a7a7a]">{visitedLabel}</p>

            <p className="text-sm text-[#b3b3b3]">
              {countryDescription || `${countryName} through my lens. Moments, places, and details captured on the road.`}
            </p>

            {isOwner ? (
              <div className="space-y-2 rounded-xl border border-[#252525] bg-[#171717] p-3">
                <p className="text-xs uppercase tracking-[0.08em] text-[#7d7d7d]">Modify country</p>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-full border border-[#363636] bg-[#181818] px-3 py-2 text-xs font-medium text-[#ececec] hover:bg-[#202020]"
                  >
                    Add more images/videos
                  </button>
                  <button
                    type="button"
                    onClick={saveCountryDescription}
                    disabled={savingDescription}
                    className="rounded-full bg-white px-3 py-2 text-xs font-medium text-black hover:bg-[#ececec] disabled:opacity-60"
                  >
                    {savingDescription ? 'Saving...' : 'Save country description'}
                  </button>
                </div>
                <textarea
                  value={descriptionDraft}
                  onChange={(e) => setDescriptionDraft(e.target.value)}
                  rows={3}
                  placeholder="Write a summary about this country"
                  className="w-full rounded-xl border border-[#2a2a2a] bg-[#121212] px-3 py-2 text-sm text-[#d0d0d0] focus:outline-none"
                />
              </div>
            ) : null}

            <div className="rounded-xl border border-[#252525] bg-[#171717] p-4">
              <p className="text-xs uppercase tracking-[0.08em] text-[#7d7d7d]">Stats</p>
              <div className="mt-3 space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[#a9a9a9]">Media</span>
                  <span className="font-medium text-[#efefef]">{allMedia.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#a9a9a9]">Last updated</span>
                  <span className="font-medium text-[#efefef]">{lastUpdatedLabel}</span>
                </div>
              </div>
            </div>
          </section>
        </aside>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        className="hidden"
        onChange={uploadMoreMedia}
      />

      {editingMedia ? (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm grid place-items-center px-4">
          <div className="w-full max-w-md rounded-2xl border border-[#2a2a2a] bg-[#0f0f10] p-5 space-y-4">
            <h3 className="text-lg font-semibold text-white">Edit image description</h3>
            <textarea
              value={captionDraft}
              onChange={(e) => setCaptionDraft(e.target.value)}
              rows={5}
              placeholder="Describe this media"
              className="w-full rounded-xl border border-[#2a2a2a] bg-[#141414] px-3 py-2 text-sm text-[#d0d0d0] focus:outline-none"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setEditingMedia(null);
                  setCaptionDraft('');
                }}
                className="rounded-full border border-[#363636] bg-[#181818] px-4 py-2 text-sm text-[#ececec] hover:bg-[#202020]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveCaption}
                disabled={savingCaption}
                className="rounded-full bg-white px-4 py-2 text-sm text-black hover:bg-[#ececec] disabled:opacity-60"
              >
                {savingCaption ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {profile ? (
        <ShareSheet
          open={shareState.open}
          onClose={() => setShareState((prev) => ({ ...prev, open: false }))}
          variant={shareState.variant}
          title={shareState.title}
          ownerName={displayName}
          ownerHandle={profile.username || displayName}
          previewUrl={shareState.previewUrl}
          ownerAvatarUrl={profile.avatar_url}
          countryFlagUrl={shareState.countryFlagUrl}
          shareUrl={shareState.shareUrl}
        />
      ) : null}

      <ReportSheet
        open={reportState.open}
        onClose={() => setReportState((prev) => ({ ...prev, open: false }))}
        targetLabel={reportState.label}
        onSubmit={(reason) => {
          if (typeof window === 'undefined') return;
          const raw = window.localStorage.getItem('travingat:reports') || '[]';
          let reports: Array<{ label: string; reason: string; at: string }> = [];
          try {
            reports = JSON.parse(raw);
          } catch {
            reports = [];
          }
          reports.push({ label: reportState.label, reason, at: new Date().toISOString() });
          window.localStorage.setItem('travingat:reports', JSON.stringify(reports));
        }}
      />
    </div>
  );
}
