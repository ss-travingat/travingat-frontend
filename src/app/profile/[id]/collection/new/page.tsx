'use client';

import { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
 import { apiFetchWithFallback } from '@/lib/api-client';
import { flags } from '@/lib/flags';
/* eslint-disable @next/next/no-img-element */

const UPLOAD_QUOTES = [
  'Preserving your memories...',
  'Pinning this moment to your map...',
  'Saving your travel story...',
  'A new memory is being added...',
  'Keeping this adventure safe...',
] as const;

type MeResponse = {
  user_id: string;
};

type ProfileResponse = {
  based_in?: string;
};

type MediaItem = {
  id: string;
  file_url: string;
  mime_type: string;
  country_code: string;
};

type Collection = {
  id: string;
  title: string;
};

type PendingFile = {
  id: string;
  file: File;
  preview: string;
  mimeType: string;
};

type DisplayCard = {
  key: string;
  id: string;
  url: string;
  selected: boolean;
  kind: 'pending' | 'existing';
};

function resolveUploadMimeType(file: File) {
  const provided = (file.type || '').toLowerCase().trim();
  if (provided) return provided;

  const name = (file.name || '').toLowerCase();
  if (name.endsWith('.jpg') || name.endsWith('.jpeg')) return 'image/jpeg';
  if (name.endsWith('.png')) return 'image/png';
  if (name.endsWith('.webp')) return 'image/webp';
  if (name.endsWith('.heic')) return 'image/heic';
  if (name.endsWith('.mp4')) return 'video/mp4';
  if (name.endsWith('.mov')) return 'video/quicktime';
  if (name.endsWith('.webm')) return 'video/webm';
  return 'application/octet-stream';
}

function resolveCountryCode(basedIn?: string) {
  const raw = (basedIn || '').trim();
  if (!raw) return 'US';

  const byCode = flags.find((f) => f.countryCode.toLowerCase() === raw.toLowerCase());
  if (byCode) return byCode.countryCode;

  const byName = flags.find((f) => f.countryName.toLowerCase() === raw.toLowerCase());
  if (byName) return byName.countryCode;

  return 'US';
}

async function uploadViaBackend(file: File, countryCode: string, collectionID: string) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('country_code', countryCode);
  formData.append('caption', '');
  formData.append('collection_id', collectionID);

  const res = await apiFetchWithFallback('/api/media/upload', {
    method: 'POST',
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Server upload fallback failed');
  }
}

export default function NewCollectionPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const routeUserID = params?.id || '';

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [activeTab, setActiveTab] = useState<'media' | 'about'>('media');
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [selectedMediaIDs, setSelectedMediaIDs] = useState<string[]>([]);
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [selectedPendingID, setSelectedPendingID] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [profileCountry, setProfileCountry] = useState('US');
  const [reorderMode, setReorderMode] = useState(false);
  const [cardOrder, setCardOrder] = useState<string[]>([]);
  const [draggingCardKey, setDraggingCardKey] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadMessage, setUploadMessage] = useState('');
  const [uploadQuoteIndex, setUploadQuoteIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const meRes = await apiFetchWithFallback('/api/auth/me');
        if (!meRes.ok) {
          setError('Please sign in to create a collection.');
          return;
        }

        const meData: MeResponse = await meRes.json();
        if (!meData.user_id || meData.user_id !== routeUserID) {
          setError('You can create collections only on your own profile.');
          return;
        }

        const [profileRes, mediaRes] = await Promise.all([
          apiFetchWithFallback('/api/profile/me'),
          apiFetchWithFallback('/api/media'),
        ]);

        const profileData: ProfileResponse = await profileRes.json();
        const mediaData = await mediaRes.json();

        if (!profileRes.ok) {
          throw new Error('Failed to load profile.');
        }

        if (!mediaRes.ok) {
          throw new Error(mediaData.error || 'Failed to load media.');
        }

        setProfileCountry(resolveCountryCode(profileData.based_in));
        setMediaItems(Array.isArray(mediaData.items) ? mediaData.items : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load collection form');
      }
    };

    load();
  }, [routeUserID]);

  const selectedMedia = useMemo(
    () => mediaItems.filter((item) => selectedMediaIDs.includes(item.id)),
    [mediaItems, selectedMediaIDs]
  );

  const selectedPending = pendingFiles.find((item) => item.id === selectedPendingID) || null;

  useEffect(() => {
    const availableKeys = [
      ...pendingFiles.map((item) => `pending:${item.id}`),
      ...mediaItems.map((item) => `existing:${item.id}`),
    ];

    setCardOrder((prev) => {
      const kept = prev.filter((key) => availableKeys.includes(key));
      const missing = availableKeys.filter((key) => !kept.includes(key));
      return [...kept, ...missing];
    });
  }, [mediaItems, pendingFiles]);

  useEffect(() => {
    if (!saving) {
      setUploadQuoteIndex(0);
      return;
    }

    const timer = window.setInterval(() => {
      setUploadQuoteIndex((prev) => (prev + 1) % UPLOAD_QUOTES.length);
    }, 2000);

    return () => window.clearInterval(timer);
  }, [saving]);

  const displayCards = useMemo<DisplayCard[]>(() => {
    const pending: DisplayCard[] = pendingFiles.map((item) => ({
      key: `pending:${item.id}`,
      id: item.id,
      url: item.preview,
      selected: selectedPendingID === item.id,
      kind: 'pending',
    }));

    const existing: DisplayCard[] = mediaItems.map((item) => ({
      key: `existing:${item.id}`,
      id: item.id,
      url: item.file_url,
      selected: selectedMediaIDs.includes(item.id),
      kind: 'existing',
    }));

    const all = [...pending, ...existing];
    const byKey = new Map(all.map((item) => [item.key, item]));
    const ordered = cardOrder
      .map((key) => byKey.get(key))
      .filter((item): item is DisplayCard => Boolean(item));
    const remaining = all.filter((item) => !cardOrder.includes(item.key));

    return [...ordered, ...remaining];
  }, [cardOrder, mediaItems, pendingFiles, selectedMediaIDs, selectedPendingID]);

  const reorderCards = (targetKey: string) => {
    if (!reorderMode || !draggingCardKey || draggingCardKey === targetKey) return;

    setCardOrder((prev) => {
      const base = prev.length > 0 ? [...prev] : displayCards.map((item) => item.key);
      const from = base.indexOf(draggingCardKey);
      const to = base.indexOf(targetKey);
      if (from < 0 || to < 0) return prev;

      const [moved] = base.splice(from, 1);
      base.splice(to, 0, moved);
      return base;
    });

    setDraggingCardKey('');
  };

  const toggleMedia = (mediaID: string) => {
    setSelectedMediaIDs((prev) =>
      prev.includes(mediaID) ? prev.filter((id) => id !== mediaID) : [...prev, mediaID]
    );
  };

  const onPickFiles = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const items = files.map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      file,
      preview: URL.createObjectURL(file),
      mimeType: resolveUploadMimeType(file),
    }));

    setPendingFiles((prev) => {
      const next = [...prev, ...items];
      if (!selectedPendingID && next[0]) {
        setSelectedPendingID(next[0].id);
      }
      return next;
    });

    e.target.value = '';
  };

  const saveCollection = async () => {
    if (!title.trim()) {
      setError('Collection name is required.');
      return;
    }

    const selectedExistingMedia = mediaItems.filter((item) => selectedMediaIDs.includes(item.id));
    const hasImageInPending = pendingFiles.some((item) => (item.mimeType || '').startsWith('image/'));
    const hasImageInSelectedExisting = selectedExistingMedia.some((item) => (item.mime_type || '').startsWith('image/'));
    if (!hasImageInPending && !hasImageInSelectedExisting) {
      setError('Add at least one image before creating a collection.');
      return;
    }

    setError('');
    setSaving(true);
    setUploadProgress(0);
    setUploadMessage('Preparing upload...');

    try {
      const createRes = await apiFetchWithFallback('/api/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          is_public: true,
        }),
      });

      const createData = await createRes.json() as Collection & { error?: string };
      if (!createRes.ok) {
        throw new Error(createData.error || 'Failed to create collection');
      }

      for (const mediaID of selectedMediaIDs) {
        const attachRes = await apiFetchWithFallback(`/api/collections/${createData.id}/media`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ media_id: mediaID }),
        });

        if (!attachRes.ok) {
          const attachData = await attachRes.json();
          throw new Error(attachData.error || 'Failed to attach selected media');
        }
      }

      const totalSize = pendingFiles.reduce((sum, item) => sum + item.file.size, 0);
      const uploadedByID: Record<string, number> = {};

      for (let index = 0; index < pendingFiles.length; index += 1) {
        const item = pendingFiles[index];
        setUploadMessage(`Uploading ${index + 1} of ${pendingFiles.length}...`);

        await uploadViaBackend(item.file, profileCountry, createData.id);
        uploadedByID[item.id] = item.file.size;
        const uploadedTotal = Object.values(uploadedByID).reduce((sum, bytes) => sum + bytes, 0);
        const progress = totalSize > 0 ? Math.round((uploadedTotal / totalSize) * 100) : 0;
        setUploadProgress(Math.min(progress, 99));
      }

      setUploadProgress(100);
      setUploadMessage('Upload complete. Redirecting...');

      router.push(`/profile/${routeUserID}/collection/${createData.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save collection');
    } finally {
      setSaving(false);
      setUploadMessage('');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-[1680px] mx-auto px-6 md:px-10 xl:px-24 py-8 min-h-screen flex flex-col gap-6">
        <div className="flex items-center justify-between gap-4">
          <Link
            href={`/profile/${routeUserID}`}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-[#363636] bg-[#181818] px-5 py-3 text-[14px] font-medium text-white hover:bg-[#232323] transition"
          >
            <span className="material-symbols-rounded text-[16px]">arrow_back</span>
            Back
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={() => inputRef.current?.click()}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-[#363636] bg-[#181818] px-5 py-3 text-[14px] font-medium text-white hover:bg-[#232323] transition"
            >
              <span className="material-symbols-rounded text-[18px]">cloud_upload</span>
              Upload
            </button>
            <button
              onClick={saveCollection}
              disabled={saving}
              className="w-[140px] rounded-full bg-white px-6 py-3 text-[14px] font-medium text-black hover:bg-gray-200 transition disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        <div className="w-[600px] max-w-full mx-auto text-center space-y-4">
          <input
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setError('');
            }}
            placeholder="Collection name"
            className="w-full bg-transparent border-b border-[#2b2b2b] pb-1 text-[48px] leading-[1.2] font-semibold tracking-[-0.41px] text-center focus:outline-none"
          />
        </div>

        {error ? <p className="text-center text-red-400 text-sm">{error}</p> : null}

        {activeTab === 'media' ? (
          <div className="space-y-10 pb-24">
            <div className="grid grid-cols-[238px_1fr_238px] items-center w-full">
              <button
                type="button"
                onClick={() => setReorderMode((prev) => !prev)}
                className={`flex items-center gap-1.5 transition ${reorderMode ? 'text-white' : 'text-[#c2c2c2] hover:text-white'}`}
              >
                <span className="material-symbols-rounded text-[18px]">reorder</span>
                <span className="text-[16px] tracking-[-0.4px]">Reorder</span>
                <span className="material-symbols-rounded text-[18px] rotate-90 text-[#9f9f9f]">chevron_right</span>
              </button>

              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setActiveTab('media')}
                  className="px-6 py-2.5 rounded-[200px] text-[16px] border border-white bg-[#1d1d1d] text-white"
                >
                  All media
                </button>
                <button
                  onClick={() => setActiveTab('about')}
                  className="px-6 py-2.5 rounded-[999px] text-[16px] bg-[#161616] text-[#a8a8a8]"
                >
                  About
                </button>
              </div>

              <div />
            </div>

            <div className="flex items-start justify-center gap-6 rounded-2xl w-full">
              <section className="flex-1 h-[720px] overflow-y-auto pb-24">
                {displayCards.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center gap-4 rounded-2xl border border-dashed border-[#2b2b2b] bg-[#0d0d0d]">
                    <h3 className="text-[36px] tracking-[-0.5px] font-semibold">Add Photos / Videos</h3>
                    <p className="text-[#7c7c7c]">Upload files or choose from your existing profile media.</p>
                    <button
                      onClick={() => inputRef.current?.click()}
                      className="px-8 py-2.5 rounded-full bg-white text-black text-sm font-medium"
                    >
                      Upload
                    </button>
                  </div>
                ) : (
                  <div className="columns-2 lg:columns-3 xl:columns-4 gap-5">
                    {displayCards.map((item) => (
                      <div
                        key={item.key}
                        draggable={reorderMode}
                        onDragStart={() => {
                          if (!reorderMode) return;
                          setDraggingCardKey(item.key);
                        }}
                        onDragOver={(e) => {
                          if (!reorderMode || !draggingCardKey || draggingCardKey === item.key) return;
                          e.preventDefault();
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          reorderCards(item.key);
                        }}
                        onDragEnd={() => setDraggingCardKey('')}
                        onClick={() => {
                          if (item.kind === 'pending') {
                            setSelectedPendingID(item.id);
                            return;
                          }
                          toggleMedia(item.id);
                        }}
                        className={`group relative mb-5 w-full break-inside-avoid rounded-2xl overflow-hidden border-[3px] ${item.selected ? 'border-[#fda221]' : 'border-transparent'} ${reorderMode ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'}`}
                      >
                        <img src={item.url} alt="Collection media" className="w-full h-auto object-cover" />
                        {item.kind === 'existing' ? (
                          <span className={`absolute right-2 top-2 inline-flex h-6 w-6 items-center justify-center rounded-full border transition-opacity ${item.selected ? 'opacity-100 bg-[#ffc857] border-[#ffc857] text-black' : 'opacity-0 group-hover:opacity-100 bg-black/60 border-[#666] text-white'}`}>
                            {item.selected ? '✓' : '✕'}
                          </span>
                        ) : null}
                        {reorderMode ? (
                          <span className="absolute left-2 top-2 inline-flex h-6 w-6 items-center justify-center rounded-full border border-[#3e3e3e] bg-black/60 text-white">
                            <span className="material-symbols-rounded text-[14px]">drag_indicator</span>
                          </span>
                        ) : null}
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <aside className="bg-[#111] border-2 border-[#2a2a2a] rounded-2xl p-5 w-[320px] h-[720px] flex flex-col gap-5 shrink-0">
                {selectedPending ? (
                  <img src={selectedPending.preview} alt="Selected pending" className="w-[72px] h-[72px] rounded-lg object-cover" />
                ) : selectedMedia[0] ? (
                  <img src={selectedMedia[0].file_url} alt="Selected media" className="w-[72px] h-[72px] rounded-lg object-cover" />
                ) : (
                  <div className="w-[72px] h-[72px] rounded-lg bg-[#1b1b1b] border border-[#202020]" />
                )}

                <div className="space-y-2">
                  <p className="text-[16px] text-white tracking-[-0.4px]">Description</p>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Write something about this moment..."
                    className="w-full h-[160px] bg-transparent text-[16px] text-[#696969] tracking-[-0.4px] resize-none focus:outline-none"
                  />
                </div>

                <div className="h-px w-full bg-[#2a2a2a]" />

                <div className="flex items-center justify-between">
                  <div className="space-y-1.5">
                    <p className="text-[16px] text-white tracking-[-0.4px]">Add location</p>
                    <p className="text-[14px] text-[#696969] tracking-[-0.4px]">Where was this taken?</p>
                  </div>
                  <span className="material-symbols-rounded text-[#9f9f9f]">arrow_forward_ios</span>
                </div>

                <div className="h-px w-full bg-[#2a2a2a]" />

                <div className="flex items-center justify-between">
                  <span className="text-[16px] text-white tracking-[-0.4px]">Set as thumbnail</span>
                  <button className="h-6 w-12 rounded-full bg-[#5a45f9] p-[2px] flex justify-end">
                    <span className="block h-5 w-6 rounded-full bg-white" />
                  </button>
                </div>
              </aside>
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-[1fr_320px] gap-5">
            <section className="rounded-2xl border border-[#232323] bg-[#0f0f10] p-5 min-h-[360px]">
              <h3 className="text-[36px] font-semibold mb-4">About</h3>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Write about this collection..."
                className="w-full min-h-[240px] bg-transparent text-[#cfcfcf] focus:outline-none resize-none"
              />
            </section>

            <aside className="rounded-2xl border border-[#232323] bg-[#0f0f10] p-5 space-y-5 h-fit">
              <p className="text-[#9a9a9a] text-sm">Media selected: {selectedMediaIDs.length + pendingFiles.length}</p>
              <p className="text-[#9a9a9a] text-sm">Uploads use your profile base country ({profileCountry}) by default.</p>
            </aside>
          </div>
        )}

        <footer className="pt-4 pb-4 md:pb-6">
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8 text-[12px] text-[#7c7c7c] tracking-[-0.3px]">
            <span>Help</span>
            <span>About</span>
            <span>Careers</span>
            <span>Blog</span>
            <span>Terms of Service</span>
            <span>Privacy Policy</span>
          </div>
        </footer>

        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*,video/*"
          className="hidden"
          onChange={onPickFiles}
        />

        {saving ? (
          <div className="fixed inset-0 z-[80] bg-black/90 backdrop-blur-sm grid place-items-center px-6">
            <div className="w-full max-w-md rounded-2xl border border-[#2a2a2a] bg-[#0e0e0f] p-6 space-y-4 text-center">
              <p className="text-lg font-semibold text-white">{UPLOAD_QUOTES[uploadQuoteIndex]}</p>
              {uploadMessage ? <p className="text-sm text-[#d5d5d5]">{uploadMessage}</p> : null}
              <div className="w-full h-3 bg-[#222] rounded-full overflow-hidden">
                <div className="h-full bg-white transition-all duration-200" style={{ width: `${uploadProgress}%` }} />
              </div>
              <p className="text-sm text-[#d5d5d5]">{uploadProgress}%</p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
