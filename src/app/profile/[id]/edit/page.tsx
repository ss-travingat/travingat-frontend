'use client';

import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/auth-client';
import { flags } from '@/lib/flags';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

type Profile = {
  user_id: string;
  username: string;
  display_name: string;
  based_in: string;
  homeland: string;
  currently_in: string;
  countries_traveled: number;
  bio: string;
  avatar_url: string;
  cover_image_url: string;
  interests: string[];
  languages: string[];
  photo_urls: string[];
  social_links: SocialLinks;
};

type SocialLinks = {
  instagram: string;
  facebook: string;
  x: string;
  linkedin: string;
  youtube: string;
};

type MeResponse = {
  user_id: string;
};

type UploadedMedia = {
  file_url: string;
};

type ModalKey =
	| 'username'
  | 'display_name'
  | 'based_in'
  | 'about'
  | 'photos'
  | 'interests'
  | 'languages'
  | 'homeland'
  | 'currently_in'
  | 'social'
  | null;

const EMPTY_SOCIAL_LINKS: SocialLinks = {
  instagram: '',
  facebook: '',
  x: '',
  linkedin: '',
  youtube: '',
};

const INTEREST_GROUPS: Array<{ title: string; items: string[] }> = [
  { title: 'Travel Style', items: ['Slow Travel', 'Digital Nomad Life', 'Backpacking', 'Luxury Stays', 'Weekend Trips', 'Nature Retreats'] },
  { title: 'Intent & Mindset', items: ['Personal Growth', 'Solitude & Reflection', 'Cultural Exchange', 'Learning & Curiosity', 'Long Conversations'] },
  { title: 'Activities & Experiences', items: ['Photography', 'Long Walks', 'Hiking', 'Cycling', 'Surfing', 'Water Adventures'] },
  { title: 'Food & Lifestyle', items: ['Cafe Hopping', 'Street Food', 'Food Exploration', 'Local Markets'] },
  { title: 'Creative & Professional', items: ['Design', 'Writing', 'Filmmaking', 'Music & Sound', 'Content Creation'] },
  { title: 'Destinations', items: ['Cities & Architecture', 'Nature & Landscapes', 'Beaches', 'Mountains', 'Small Town Life'] },
  { title: 'Language & Culture', items: ['Language Exchange', 'Multilingual Living', 'History & Culture', 'Art & Museums'] },
];

const LANGUAGE_OPTIONS = [
  'Afar',
  'Afrikaans',
  'Akan',
  'Albanian',
  'Amharic',
  'Arabic',
  'Aragonese',
  'Armenian',
  'Assamese',
  'Avaric',
  'Avestan',
  'Aymara',
  'Azerbaijani',
  'Bambara',
  'Bashkir',
  'Basque',
  'Belarusian',
  'Bengali',
  'Bihari',
  'Bislama',
  'Bosnian',
  'Breton',
  'Bulgarian',
  'Burmese',
  'Catalan',
  'Cebuano',
  'Chamorro',
  'Chechen',
  'Chichewa',
  'Chinese',
  'Church Slavonic',
  'Chuvash',
  'Cornish',
  'Corsican',
  'Cree',
  'Croatian',
  'Czech',
  'Danish',
  'Divehi',
  'Dutch',
  'Dzongkha',
  'English',
  'Esperanto',
  'Estonian',
  'Ewe',
  'Faroese',
  'Fijian',
  'Finnish',
  'French',
  'Fulah',
  'Galician',
  'Georgian',
  'German',
  'Greek',
  'Guarani',
  'Gujarati',
  'Haitian Creole',
  'Hausa',
  'Hebrew',
  'Herero',
  'Hindi',
  'Hiri Motu',
  'Hungarian',
  'Icelandic',
  'Ido',
  'Igbo',
  'Indonesian',
  'Interlingua',
  'Interlingue',
  'Inuktitut',
  'Inupiaq',
  'Irish',
  'Italian',
  'Japanese',
  'Javanese',
  'Kalaallisut',
  'Kannada',
  'Kanuri',
  'Kashmiri',
  'Kazakh',
  'Khmer',
  'Kikuyu',
  'Kinyarwanda',
  'Kirghiz',
  'Komi',
  'Kongo',
  'Korean',
  'Kurdish',
  'Lao',
  'Latin',
  'Latvian',
  'Limburgish',
  'Lingala',
  'Lithuanian',
  'Luxembourgish',
  'Macedonian',
  'Malagasy',
  'Malay',
  'Malayalam',
  'Maltese',
  'Manx',
  'Maori',
  'Marathi',
  'Marshallese',
  'Mongolian',
  'Nauru',
  'Navajo',
  'Ndonga',
  'Nepali',
  'North Ndebele',
  'Northern Sami',
  'Norwegian',
  'Norwegian Bokmal',
  'Norwegian Nynorsk',
  'Occitan',
  'Ojibwa',
  'Oriya',
  'Oromo',
  'Ossetian',
  'Pali',
  'Pashto',
  'Persian',
  'Polish',
  'Portuguese',
  'Punjabi',
  'Quechua',
  'Romanian',
  'Romansh',
  'Rundi',
  'Russian',
  'Samoan',
  'Sango',
  'Sanskrit',
  'Sardinian',
  'Scottish Gaelic',
  'Serbian',
  'Shona',
  'Sindhi',
  'Sinhala',
  'Slovak',
  'Slovenian',
  'Somali',
  'South Ndebele',
  'Southern Sotho',
  'Spanish',
  'Sundanese',
  'Swahili',
  'Swati',
  'Swedish',
  'Tagalog',
  'Tahitian',
  'Tajik',
  'Tamil',
  'Tatar',
  'Telugu',
  'Thai',
  'Tibetan',
  'Tigrinya',
  'Tonga',
  'Tsonga',
  'Tswana',
  'Turkish',
  'Turkmen',
  'Twi',
  'Uighur',
  'Ukrainian',
  'Urdu',
  'Uzbek',
  'Venda',
  'Vietnamese',
  'Volapuk',
  'Walloon',
  'Welsh',
  'Western Frisian',
  'Wolof',
  'Xhosa',
  'Yiddish',
  'Yoruba',
  'Zhuang',
  'Zulu',
  'American Sign Language',
  'British Sign Language',
  'International Sign',
];

const COUNTRY_OPTIONS = Array.from(new Set(flags.map((f) => f.countryName))).sort((a, b) => a.localeCompare(b));

function ModalShell({
  title,
  subtitle,
  onDismiss,
  children,
}: {
  title: string;
  subtitle: string;
  onDismiss: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-[80] bg-black/75 px-4 py-6 md:px-10 md:py-10" onClick={onDismiss}>
      <div
        className="max-w-[780px] mx-auto bg-[#1a1a1a] rounded-[20px] p-6 md:p-8 h-full max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-3 mb-8 relative pr-10">
          <h2 className="text-[30px] md:text-[36px] leading-tight font-semibold tracking-[-0.5px]">{title}</h2>
          <p className="text-[#6a6a6a] text-[15px] md:text-[16px]">{subtitle}</p>
          <button
            type="button"
            onClick={onDismiss}
            className="absolute right-0 top-0 text-[#6a6a6a] hover:text-white text-3xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="flex-1 min-h-0">{children}</div>
      </div>
    </div>
  );
}

async function uploadProfileImage(file: File, countryCode: string, caption = '') {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('country_code', countryCode || 'US');
  if (caption) {
    formData.append('caption', caption);
  }

  const res = await apiFetch(`${API_URL}/api/media/upload`, {
    method: 'POST',
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to upload image');
  }

  return (data as UploadedMedia).file_url;
}

export default function EditProfileByIDPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const routeUserID = params?.id || '';

  const [form, setForm] = useState<Profile>({
    user_id: '',
    username: '',
    display_name: '',
    based_in: '',
    homeland: '',
    currently_in: '',
    countries_traveled: 0,
    bio: '',
    avatar_url: '',
    cover_image_url: '',
    interests: [],
    languages: [],
    photo_urls: ['', '', '', ''],
    social_links: EMPTY_SOCIAL_LINKS,
  });
  const [photoSlots, setPhotoSlots] = useState<string[]>(['', '', '', '']);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activePhotoSlot, setActivePhotoSlot] = useState<number | null>(null);
  const [activeModal, setActiveModal] = useState<ModalKey>(null);

  const [displayNameDraft, setDisplayNameDraft] = useState('');
  const [usernameDraft, setUsernameDraft] = useState('');
  const [basedInDraft, setBasedInDraft] = useState('');
  const [aboutDraft, setAboutDraft] = useState('');
  const [homelandDraft, setHomelandDraft] = useState('');
  const [currentlyInDraft, setCurrentlyInDraft] = useState('');
  const [interestsDraft, setInterestsDraft] = useState<string[]>([]);
  const [languagesDraft, setLanguagesDraft] = useState<string[]>([]);
  const [socialDraft, setSocialDraft] = useState<SocialLinks>(EMPTY_SOCIAL_LINKS);
  const [customTagDraft, setCustomTagDraft] = useState('');
  const [languageSearch, setLanguageSearch] = useState('');
  const [homelandSearch, setHomelandSearch] = useState('');
  const [currentlyInSearch, setCurrentlyInSearch] = useState('');

  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const heroInputRef = useRef<HTMLInputElement | null>(null);
  const photosInputRef = useRef<HTMLInputElement | null>(null);
  const activePhotoSlotRef = useRef<number | null>(null);

  useEffect(() => {
    activePhotoSlotRef.current = activePhotoSlot;
  }, [activePhotoSlot]);

  const countryCode = useMemo(() => {
    const based = (form.based_in || '').trim();
    if (!based) return 'US';
    if (based.length === 2) {
      const byCode = flags.find((f) => f.countryCode.toLowerCase() === based.toLowerCase());
      if (byCode) return byCode.countryCode;
    }
    const byName = flags.find((f) => f.countryName.toLowerCase() === based.toLowerCase());
    if (byName) return byName.countryCode;
    return 'US';
  }, [form.based_in]);

  useEffect(() => {
    const load = async () => {
      try {
        const meRes = await apiFetch(`${API_URL}/api/auth/me`);

        if (meRes.status === 401) {
          window.location.href = '/signin';
          return;
        }

        const meData: MeResponse = await meRes.json();
        if (!meRes.ok || !meData.user_id) {
          setError('Failed to load user session.');
          return;
        }

        if (!routeUserID || meData.user_id !== routeUserID) {
          router.replace(`/profile/${meData.user_id}/edit`);
          return;
        }

        const res = await apiFetch(`${API_URL}/api/profile/me`);
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || 'Failed to load profile');
          return;
        }

        setForm({
          user_id: data.user_id || '',
          username: data.username || '',
          display_name: data.display_name || '',
          based_in: data.based_in || '',
          homeland: data.homeland || '',
          currently_in: data.currently_in || '',
          countries_traveled: Number(data.countries_traveled || 0),
          bio: data.bio || '',
          avatar_url: data.avatar_url || '',
          cover_image_url: data.cover_image_url || '',
          interests: Array.isArray(data.interests) ? data.interests : [],
          languages: Array.isArray(data.languages) ? data.languages : [],
          photo_urls: Array.isArray(data.photo_urls) ? data.photo_urls : ['', '', '', ''],
          social_links: {
            instagram: data.social_links?.instagram || '',
            facebook: data.social_links?.facebook || '',
            x: data.social_links?.x || '',
            linkedin: data.social_links?.linkedin || '',
            youtube: data.social_links?.youtube || '',
          },
        });
        setPhotoSlots(Array.from({ length: 4 }, (_, idx) => data.photo_urls?.[idx] || ''));
      } catch {
        setError('Network error. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [routeUserID, router]);

  const uploadProfileAsset = async (file: File, target: 'avatar_url' | 'cover_image_url') => {
    const caption = target === 'avatar_url' ? 'profile_avatar' : 'profile_cover';
    const uploadedURL = await uploadProfileImage(file, countryCode, caption);
    const nextState: Profile = {
      ...form,
      [target]: uploadedURL,
    };
    setForm(nextState);
    await persistProfile(nextState, false);
  };

  const onProfileAssetSelect =
    (target: 'avatar_url' | 'cover_image_url') =>
    async (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setSaving(true);
      setError('');
      try {
        await uploadProfileAsset(file, target);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Upload failed');
      } finally {
        setSaving(false);
        e.target.value = '';
      }
    };

  const onPhotosSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const slotIndex = activePhotoSlotRef.current ?? activePhotoSlot;
    if (!file || slotIndex === null) return;

    setSaving(true);
    setError('');

    try {
      const uploadedURL = await uploadProfileImage(file, countryCode);
      setPhotoSlots((prev) => {
        const next = [...prev];
        next[slotIndex] = uploadedURL;
        setForm((current) => ({ ...current, photo_urls: next }));
        return next;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setSaving(false);
      setActivePhotoSlot(null);
      activePhotoSlotRef.current = null;
      e.target.value = '';
    }
  };

  const normalizeBasedIn = (value: string) => {
    const raw = value.trim();
    if (!raw) return '';

    if (raw.length === 2) {
      const byCode = flags.find((f) => f.countryCode.toLowerCase() === raw.toLowerCase());
      if (byCode) return byCode.countryCode;
    }

    const byName = flags.find((f) => f.countryName.toLowerCase() === raw.toLowerCase());
    if (byName) return byName.countryCode;

    return '';
  };

  const buildUpdatePayload = (state: Profile) => ({
    username: (state.username || '').trim().toLowerCase(),
    display_name: state.display_name.trim(),
    based_in: normalizeBasedIn(state.based_in),
    homeland: state.homeland.trim(),
    currently_in: state.currently_in.trim(),
    countries_traveled: state.countries_traveled,
    bio: state.bio.trim(),
    avatar_url: state.avatar_url,
    cover_image_url: state.cover_image_url,
    interests: (state.interests || []).slice(0, 10),
    languages: (state.languages || []).slice(0, 10),
    photo_urls: (state.photo_urls || []).slice(0, 4),
    social_links: {
      instagram: state.social_links?.instagram || '',
      facebook: state.social_links?.facebook || '',
      x: state.social_links?.x || '',
      linkedin: state.social_links?.linkedin || '',
      youtube: state.social_links?.youtube || '',
    },
  });

  const persistProfile = async (nextState: Profile, redirectAfterSave = false) => {
    if (!nextState.display_name.trim()) {
      setError('Display name is required.');
      return false;
    }
    if (!nextState.username.trim()) {
      setError('Username is required.');
      return false;
    }

    setSaving(true);
    setError('');

    try {
      const res = await apiFetch(`${API_URL}/api/profile/me`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildUpdatePayload(nextState)),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to save profile');
        return false;
      }

      setForm(nextState);
      setPhotoSlots(Array.from({ length: 4 }, (_, idx) => nextState.photo_urls?.[idx] || ''));

      if (redirectAfterSave) {
        router.push(`/profile/${routeUserID}`);
      }

      return true;
    } catch {
      setError('Network error. Please try again.');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const savePatch = async (patch: Partial<Profile>) => {
    const nextState: Profile = {
      ...form,
      ...patch,
      social_links: {
        ...EMPTY_SOCIAL_LINKS,
        ...(form.social_links || EMPTY_SOCIAL_LINKS),
        ...(patch.social_links || {}),
      },
      photo_urls: patch.photo_urls || form.photo_urls,
      interests: patch.interests || form.interests,
      languages: patch.languages || form.languages,
    };

    const ok = await persistProfile(nextState, false);
    if (ok) {
      setActiveModal(null);
    }
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await persistProfile(form, true);
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

  const openModal = (modal: Exclude<ModalKey, null>) => {
    setCustomTagDraft('');
    setError('');

    if (modal === 'display_name') {
      setDisplayNameDraft(form.display_name);
    }
    if (modal === 'username') {
      setUsernameDraft(form.username);
    }
    if (modal === 'based_in') {
      setBasedInDraft(form.based_in);
    }
    if (modal === 'about') {
      setAboutDraft(form.bio);
    }
    if (modal === 'homeland') {
      setHomelandDraft(form.homeland);
      setHomelandSearch(form.homeland);
    }
    if (modal === 'currently_in') {
      setCurrentlyInDraft(form.currently_in);
      setCurrentlyInSearch(form.currently_in);
    }
    if (modal === 'interests') {
      setInterestsDraft(form.interests || []);
    }
    if (modal === 'languages') {
      setLanguagesDraft(form.languages || []);
      setLanguageSearch('');
    }
    if (modal === 'social') {
      setSocialDraft({ ...EMPTY_SOCIAL_LINKS, ...(form.social_links || EMPTY_SOCIAL_LINKS) });
    }

    setActiveModal(modal);
  };

  const sectionRow = (title: string, subtitle: string, value: string, onClick: () => void) => (
    <div className="py-1">
      <button type="button" onClick={onClick} className="w-full flex items-center justify-between text-left">
        <div className="space-y-1 pr-4">
          <p className="text-[24px] font-semibold tracking-[-0.5px]">{title}</p>
          <p className="text-[#656565] text-[16px]">{subtitle}</p>
          {value ? <p className="text-[#cfcfcf] text-sm pt-2 line-clamp-1">{value}</p> : null}
        </div>
        <span className="text-[#656565] text-xl">›</span>
      </button>
      <div className="h-px bg-[#252525] mt-8" />
    </div>
  );

  const socialCount = Object.values(form.social_links || EMPTY_SOCIAL_LINKS).filter(Boolean).length;
  const normalizedLanguageSearch = languageSearch.trim();
  const normalizedLanguageSearchLower = normalizedLanguageSearch.toLowerCase();
  const filteredLanguages = LANGUAGE_OPTIONS.filter((item) => item.toLowerCase().includes(normalizedLanguageSearchLower));
  const languageExistsInOptions = LANGUAGE_OPTIONS.some((item) => item.toLowerCase() === normalizedLanguageSearchLower);
  const languageAlreadySelected = languagesDraft.some((item) => item.toLowerCase() === normalizedLanguageSearchLower);
  const canAddCustomLanguage = Boolean(normalizedLanguageSearch) && !languageExistsInOptions && !languageAlreadySelected;
  const filteredHomeland = COUNTRY_OPTIONS.filter((item) => item.toLowerCase().includes(homelandSearch.trim().toLowerCase())).slice(0, 8);
  const filteredCurrentlyIn = COUNTRY_OPTIONS.filter((item) => item.toLowerCase().includes(currentlyInSearch.trim().toLowerCase())).slice(0, 8);

  return (
    <div className="min-h-screen bg-black text-white px-6 md:px-24">
      <form onSubmit={onSubmit} className="max-w-[1488px] mx-auto">
        <header className="py-8 flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.push(`/profile/${routeUserID}`)}
            className="bg-[#181818] border border-[#363636] rounded-full px-5 py-3 text-sm font-medium"
          >
            Back
          </button>

          <button
            type="submit"
            disabled={saving}
            className="bg-white text-black rounded-full px-6 py-3 text-sm font-medium w-[140px] disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </header>

        <section className="pb-24">
          {error ? <p className="text-red-400 text-sm mb-6">{error}</p> : null}

          <div className="flex flex-col xl:flex-row gap-10 items-start justify-center w-full">
            <aside className="w-full xl:w-[360px] bg-[#0e0e0e] border-2 border-[#1a1a1a] rounded-[20px] p-8 space-y-8">
              <div className="relative w-[120px] h-[120px] rounded-[20px] overflow-hidden">
                {form.avatar_url ? (
                  <img
                    src={form.avatar_url}
                    alt="Profile avatar"
                    loading="eager"
                    decoding="async"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-[#1f1f1f]" />
                )}
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  className="absolute bottom-2 right-2 bg-white text-black rounded-full text-[11px] px-2 py-1"
                >
                  Edit
                </button>
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <p className="text-[#757575] text-[14px]">Display name</p>
                  <button
                    type="button"
                    onClick={() => openModal('display_name')}
                    className="w-full text-left bg-transparent text-white text-[32px] font-semibold tracking-[-0.5px] leading-tight"
                  >
                    {form.display_name || 'Add display name'}
                  </button>
                </div>

                <div className="h-px bg-[#252525]" />

                <div className="space-y-2">
                  <p className="text-[#757575] text-[14px]">Username</p>
                  <button
                    type="button"
                    onClick={() => openModal('username')}
                    className="w-full text-left bg-transparent text-white text-[32px] font-semibold tracking-[-0.5px] leading-tight"
                  >
                    {form.username || 'Add username'}
                  </button>
                </div>

                <div className="h-px bg-[#252525]" />

                <div className="space-y-2">
                  <p className="text-[#757575] text-[14px]">Based in</p>
                  <button
                    type="button"
                    onClick={() => openModal('based_in')}
                    className="w-full text-left bg-transparent text-white text-[22px] font-medium"
                  >
                    {form.based_in || 'Add base country'}
                  </button>
                </div>

                <div className="h-px bg-[#252525]" />

                <div className="space-y-3">
                  <p className="text-[#757575] text-[14px]">Hero Photo</p>
                  <div className="relative rounded-[20px] overflow-hidden aspect-square">
                      {form.cover_image_url ? (
                        <img src={form.cover_image_url} alt="Hero" loading="eager" decoding="async" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-[#1f1f1f]" />
                      )}
                    <button
                      type="button"
                      onClick={() => heroInputRef.current?.click()}
                      className="absolute bottom-3 right-3 bg-white text-black rounded-full text-[11px] px-2 py-1"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            </aside>

            <div className="w-full max-w-[720px] py-1 space-y-8">
              <div className="space-y-4">
                <h1 className="text-[32px] md:text-[40px] tracking-[-0.5px] leading-tight font-semibold">Edit Profile</h1>
                <p className="text-[#656565] text-[16px] leading-6 max-w-[600px]">
                  This is your space to express who you are, what you love, and how you move through the world. Let others discover your journey.
                </p>
              </div>

              {sectionRow('About', 'Write something about you.', form.bio, () => openModal('about'))}

              <div className="space-y-5">
                <div>
                  <p className="text-[24px] font-semibold tracking-[-0.5px]">Photos</p>
                  <p className="text-[#656565] text-[16px] mt-1">Add 4 photos that reflect who you are.</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {photoSlots.map((photo, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => {
                        setActivePhotoSlot(index);
                        activePhotoSlotRef.current = index;
                        openModal('photos');
                      }}
                      className="aspect-square bg-[#1a1a1a] border border-[#252525] rounded-[12px] overflow-hidden flex items-center justify-center"
                    >
                      {photo ? (
                        <img src={photo} alt={`Photo slot ${index + 1}`} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[#656565] text-sm">Add Photo</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-px bg-[#252525]" />

              {sectionRow(
                'Interests',
                'Pick some interests that you enjoy and that you want to show on your profile.',
                (form.interests || []).join(', '),
                () => openModal('interests')
              )}

              {sectionRow(
                'Languages you speak',
                'Choose the languages you are comfortable speaking while traveling.',
                (form.languages || []).join(', '),
                () => openModal('languages')
              )}

              {sectionRow('Homeland', 'Where you live mostly or your birth place.', form.homeland, () => openModal('homeland'))}

              {sectionRow('Currently in', 'Your current location you are travelling.', form.currently_in, () => openModal('currently_in'))}

              {sectionRow(
                'Find me on',
                'Your social links where your friends and followers can connect with you.',
                socialCount ? `${socialCount} links added` : '',
                () => openModal('social')
              )}
            </div>
          </div>

          <footer className="pt-12 pb-8 flex items-center justify-center gap-8 text-[#7c7c7c] text-[12px]">
            <span>Help</span>
            <span>About</span>
            <span>Careers</span>
            <span>Blog</span>
            <span>Terms of Service</span>
            <span>Privacy Policy</span>
          </footer>
        </section>

        <input
          ref={avatarInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onProfileAssetSelect('avatar_url')}
        />

        <input
          ref={heroInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onProfileAssetSelect('cover_image_url')}
        />

        <input
          ref={photosInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onPhotosSelect}
        />
      </form>

      {activeModal === 'display_name' && (
        <ModalShell
          title="Display Name"
          subtitle="Use your preferred name as it appears on your profile."
          onDismiss={() => setActiveModal(null)}
        >
          <div className="h-full flex flex-col">
            <input
              value={displayNameDraft}
              onChange={(e) => setDisplayNameDraft(e.target.value)}
              placeholder="Enter your display name"
              className="w-full bg-[#111] border border-[#2a2a2a] rounded-2xl px-5 py-4 text-lg focus:outline-none"
            />
            <div className="mt-auto pt-8 flex justify-end">
              <button
                type="button"
                onClick={() => savePatch({ display_name: displayNameDraft.trim() })}
                className="bg-white text-black rounded-full px-8 py-2.5 text-[30px]text-sm font-medium min-w-[120px]"
              >
                Save
              </button>
            </div>
          </div>
        </ModalShell>
      )}

      {activeModal === 'username' && (
        <ModalShell
          title="Username"
          subtitle="Choose a unique username (letters and numbers only)."
          onDismiss={() => setActiveModal(null)}
        >
          <div className="h-full flex flex-col">
            <input
              value={usernameDraft}
              onChange={(e) => setUsernameDraft(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 20))}
              placeholder="Enter your username"
              className="w-full bg-[#111] border border-[#2a2a2a] rounded-2xl px-5 py-4 text-lg focus:outline-none"
            />
            <p className="text-[#656565] text-sm mt-2">3-20 characters, lowercase letters and numbers only.</p>
            <div className="mt-auto pt-8 flex justify-end">
              <button
                type="button"
                onClick={() => savePatch({ username: usernameDraft.trim().toLowerCase() })}
                className="bg-white text-black rounded-full px-8 py-2.5 text-sm font-medium min-w-[120px]"
              >
                Save
              </button>
            </div>
          </div>
        </ModalShell>
      )}

      {activeModal === 'based_in' && (
        <ModalShell
          title="Based In"
          subtitle="Set your home base as a country code like US, IN, FR."
          onDismiss={() => setActiveModal(null)}
        >
          <div className="h-full flex flex-col">
            <input
              value={basedInDraft}
              onChange={(e) => setBasedInDraft(e.target.value)}
              maxLength={2}
              placeholder="US"
              className="w-full bg-[#111] border border-[#2a2a2a] rounded-2xl px-5 py-4 text-lg uppercase focus:outline-none"
            />
            <div className="mt-auto pt-8 flex justify-end">
              <button
                type="button"
                onClick={() => savePatch({ based_in: basedInDraft.trim().toUpperCase() })}
                className="bg-white text-black rounded-full px-8 py-2.5 text-sm font-medium min-w-[120px]"
              >
                Save
              </button>
            </div>
          </div>
        </ModalShell>
      )}

      {activeModal === 'about' && (
        <ModalShell
          title="About"
          subtitle="Tell people who you are and what your journey is about."
          onDismiss={() => setActiveModal(null)}
        >
          <div className="h-full flex flex-col">
            <textarea
              value={aboutDraft}
              onChange={(e) => setAboutDraft(e.target.value.slice(0, 500))}
              placeholder="Write about yourself..."
              rows={7}
              className="w-full bg-[#111] border border-[#2a2a2a] rounded-2xl px-5 py-4 text-[28px]text-base leading-6 focus:outline-none min-h-[190px]"
            />
            <p className="text-right text-[#656565] mt-2">{aboutDraft.length}/500</p>
            <div className="mt-auto pt-8 flex justify-end">
              <button
                type="button"
                onClick={() => savePatch({ bio: aboutDraft.trim() })}
                className="bg-white text-black rounded-full px-8 py-2.5 text-sm font-medium min-w-[120px]"
              >
                Save
              </button>
            </div>
          </div>
        </ModalShell>
      )}

      {activeModal === 'photos' && (
        <ModalShell
          title="Photos"
          subtitle="Add up to 4 photos. Click a tile to upload or replace."
          onDismiss={() => setActiveModal(null)}
        >
          <div className="h-full min-h-0 flex flex-col">
            {error ? <p className="text-red-400 text-sm mb-3">{error}</p> : null}
            {saving ? <p className="text-[#a8a8a8] text-sm mb-3">Uploading photo...</p> : null}
            <div className="grid grid-cols-2 gap-4 overflow-y-auto pr-1 flex-1 min-h-0 content-start">
              {photoSlots.map((photo, index) => (
                <div key={index} className="space-y-3">
                  <button
                    type="button"
                    onClick={() => {
                      setActivePhotoSlot(index);
                      activePhotoSlotRef.current = index;
                      photosInputRef.current?.click();
                    }}
                    disabled={saving}
                    className="w-full aspect-square rounded-2xl border border-[#2a2a2a] bg-[#141414] overflow-hidden flex items-center justify-center disabled:opacity-60"
                  >
                    {photo ? (
                      <img src={photo} alt={`Photo ${index + 1}`} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[#7a7a7a]">Add Photo {index + 1}</span>
                    )}
                  </button>
                  {photo ? (
                    <button
                      type="button"
                      onClick={() => {
                        setPhotoSlots((prev) => {
                          const next = [...prev];
                          next[index] = '';
                          setForm((p) => ({ ...p, photo_urls: next }));
                          return next;
                        });
                      }}
                      disabled={saving}
                      className="text-sm text-[#bdbdbd] hover:text-white disabled:opacity-60"
                    >
                      Remove
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
            <div className="pt-6 flex justify-end shrink-0">
              <button
                type="button"
                disabled={saving}
                onClick={() => savePatch({ photo_urls: photoSlots })}
                className="bg-white text-black rounded-full px-8 py-2.5 text-sm font-medium min-w-[120px] disabled:opacity-60"
              >
                Save
              </button>
            </div>
          </div>
        </ModalShell>
      )}

      {activeModal === 'interests' && (
        <ModalShell
          title="Interests"
          subtitle="Pick some interests that you enjoy and that you want to show on your profile."
          onDismiss={() => setActiveModal(null)}
        >
          <div className="h-full flex flex-col">
            <div className="overflow-y-auto pr-1 space-y-9">
              {INTEREST_GROUPS.map((group) => (
                <div key={group.title} className="space-y-4">
                  <p className="text-[34px]text-[32px]text-2xl font-semibold tracking-[-0.5px]">{group.title}</p>
                  <div className="flex flex-wrap gap-2.5">
                    {group.items.map((item) => {
                      const active = interestsDraft.includes(item);
                      return (
                        <button
                          key={item}
                          type="button"
                          onClick={() => {
                            setInterestsDraft((prev) => {
                              if (prev.includes(item)) return prev.filter((v) => v !== item);
                              if (prev.length >= 10) return prev;
                              return [...prev, item];
                            });
                          }}
                          className={`px-4 py-2 rounded-full border text-[28px]text-sm ${active ? 'bg-white text-black border-white' : 'bg-transparent text-[#a8a8a8] border-[#3a3a3a]'}`}
                        >
                          {item}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-[#2a2a2a] flex items-center justify-between">
              <p className="text-[#f1f1f1]">{interestsDraft.length}/10 Selected</p>
              <button
                type="button"
                onClick={() => savePatch({ interests: interestsDraft.slice(0, 10) })}
                className="bg-white text-black rounded-full px-8 py-2.5 text-sm font-medium min-w-[120px]"
              >
                Save
              </button>
            </div>
          </div>
        </ModalShell>
      )}

      {activeModal === 'languages' && (
        <ModalShell
          title="Languages You Speak"
          subtitle="Choose the languages you're comfortable speaking while traveling."
          onDismiss={() => setActiveModal(null)}
        >
          <div className="h-full flex flex-col">
            <input
              value={languageSearch}
              onChange={(e) => setLanguageSearch(e.target.value)}
              placeholder="Search for a language"
              className="w-full bg-[#111] border border-[#2a2a2a] rounded-2xl px-5 py-3.5 text-[20px]text-lg focus:outline-none"
            />

            <div className="mt-6 border-y border-[#2a2a2a] overflow-y-auto">
              {canAddCustomLanguage ? (
                <button
                  type="button"
                  onClick={() => {
                    setLanguagesDraft((prev) => {
                      if (prev.length >= 10) return prev;
                      return [...prev, normalizedLanguageSearch];
                    });
                    setLanguageSearch('');
                  }}
                  className="w-full py-4 border-b border-[#2a2a2a] flex items-center justify-between text-left"
                >
                  <span className="text-white text-[22px]text-lg">Add "{normalizedLanguageSearch}"</span>
                  <span className="w-7 h-7 rounded-lg border border-[#4a4a4a] inline-flex items-center justify-center text-[#d7d7d7]">+</span>
                </button>
              ) : null}

              {filteredLanguages.map((item) => {
                const active = languagesDraft.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      setLanguagesDraft((prev) => {
                        if (prev.includes(item)) return prev.filter((v) => v !== item);
                        if (prev.length >= 10) return prev;
                        return [...prev, item];
                      });
                    }}
                    className="w-full py-4 border-b border-[#2a2a2a] flex items-center justify-between text-left"
                  >
                    <span className="text-white text-[22px]text-lg">{item}</span>
                    <span className={`w-7 h-7 rounded-lg border ${active ? 'bg-white border-white text-black' : 'border-[#4a4a4a]'} inline-flex items-center justify-center`}>
                      {active ? '✓' : ''}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-auto pt-8 flex justify-end">
              <button
                type="button"
                onClick={() => savePatch({ languages: languagesDraft.slice(0, 10) })}
                className="bg-white text-black rounded-full px-8 py-2.5 text-sm font-medium min-w-[120px]"
              >
                Save
              </button>
            </div>
          </div>
        </ModalShell>
      )}

      {activeModal === 'homeland' && (
        <ModalShell
          title="Homeland"
          subtitle="Where you live mostly or your birth place."
          onDismiss={() => setActiveModal(null)}
        >
          <div className="h-full flex flex-col">
            <input
              value={homelandSearch}
              onChange={(e) => {
                setHomelandSearch(e.target.value);
                setHomelandDraft(e.target.value);
              }}
              placeholder="Search for a city or country"
              className="w-full bg-[#111] border border-[#2a2a2a] rounded-2xl px-5 py-3.5 text-[20px]text-lg focus:outline-none"
            />

            <div className="mt-6 border-b border-[#2a2a2a] overflow-y-auto flex-1">
              {(homelandSearch.trim() ? filteredHomeland : [homelandDraft || '']).filter(Boolean).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    setHomelandDraft(item);
                    setHomelandSearch(item);
                  }}
                  className="w-full text-left py-4 text-white text-[22px]text-lg"
                >
                  {item}
                </button>
              ))}
            </div>

            <div className="mt-8 flex justify-end">
              <button
                type="button"
                onClick={() => savePatch({ homeland: homelandDraft.trim() })}
                className="bg-white text-black rounded-full px-8 py-2.5 text-sm font-medium min-w-[120px]"
              >
                Save
              </button>
            </div>
          </div>
        </ModalShell>
      )}

      {activeModal === 'currently_in' && (
        <ModalShell
          title="Currently In"
          subtitle="Share your current location while travelling."
          onDismiss={() => setActiveModal(null)}
        >
          <div className="h-full flex flex-col">
            <input
              value={currentlyInSearch}
              onChange={(e) => {
                setCurrentlyInSearch(e.target.value);
                setCurrentlyInDraft(e.target.value);
              }}
              placeholder="Search for a city or country"
              className="w-full bg-[#111] border border-[#2a2a2a] rounded-2xl px-5 py-3.5 text-[20px]text-lg focus:outline-none"
            />

            <div className="mt-6 border-b border-[#2a2a2a] overflow-y-auto flex-1">
              {(currentlyInSearch.trim() ? filteredCurrentlyIn : [currentlyInDraft || '']).filter(Boolean).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    setCurrentlyInDraft(item);
                    setCurrentlyInSearch(item);
                  }}
                  className="w-full text-left py-4 text-white text-[22px]text-lg"
                >
                  {item}
                </button>
              ))}
            </div>

            <div className="mt-8 flex justify-end">
              <button
                type="button"
                onClick={() => savePatch({ currently_in: currentlyInDraft.trim() })}
                className="bg-white text-black rounded-full px-8 py-2.5 text-sm font-medium min-w-[120px]"
              >
                Save
              </button>
            </div>
          </div>
        </ModalShell>
      )}

      {activeModal === 'social' && (
        <ModalShell
          title="Find Me On"
          subtitle="Add social links where travelers can connect with you."
          onDismiss={() => setActiveModal(null)}
        >
          <div className="h-full flex flex-col">
            <div className="space-y-5 overflow-y-auto pr-1">
              {[
                ['instagram', 'Instagram', '◎'],
                ['facebook', 'Facebook', 'f'],
                ['x', 'X', '𝕏'],
                ['linkedin', 'Linkedin', 'in'],
                ['youtube', 'YouTube', '▶'],
              ].map(([key, label, icon]) => (
                <div key={key}>
                  <p className="text-[30px]text-[32px]text-2xl mb-2">{label}</p>
                  <div className="w-full bg-[#111] border border-[#2a2a2a] rounded-2xl px-5 py-3.5 flex items-center gap-3">
                    <span className="text-[#f0f0f0] text-lg w-5 text-center">{icon}</span>
                    <input
                      value={socialDraft[key as keyof SocialLinks]}
                      onChange={(e) => {
                        const value = e.target.value;
                        setSocialDraft((prev) => ({ ...prev, [key]: value }));
                      }}
                      placeholder="Add link"
                      className="flex-1 bg-transparent text-sm text-white placeholder:text-[#7c7c7c] focus:outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-auto pt-8 flex justify-end">
              <button
                type="button"
                onClick={() => savePatch({ social_links: socialDraft })}
                className="bg-white text-black rounded-full px-8 py-2.5 text-sm font-medium min-w-[120px]"
              >
                Save
              </button>
            </div>
          </div>
        </ModalShell>
      )}
    </div>
  );
}
