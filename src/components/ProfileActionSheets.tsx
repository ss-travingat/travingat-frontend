'use client';

/* eslint-disable @next/next/no-img-element */
import { useEffect, useMemo, useState } from 'react';

const SOCIAL_ICONS = {
  whatsapp: 'https://www.figma.com/api/mcp/asset/2b00b727-1918-4b60-9f66-d011a348b1b8',
  messenger: 'https://www.figma.com/api/mcp/asset/afc0c273-a1cb-440c-9595-77be023ad179',
  facebook: 'https://www.figma.com/api/mcp/asset/c4233452-693d-4e8d-a5a4-25353b648a84',
  instagram: 'https://www.figma.com/api/mcp/asset/836728e4-3aba-4d31-b4de-b75cbcd71b52',
  x: 'https://www.figma.com/api/mcp/asset/7f5aed9a-5152-499b-ac26-44cb52674e6b',
} as const;

export type ShareVariant = 'country' | 'collection' | 'media';

type ShareSheetProps = {
  open: boolean;
  onClose: () => void;
  variant: ShareVariant;
  title: string;
  ownerName: string;
  ownerHandle: string;
  previewUrl: string;
  ownerAvatarUrl?: string;
  countryFlagUrl?: string;
  shareUrl: string;
};

type ReportSheetProps = {
  open: boolean;
  onClose: () => void;
  targetLabel: string;
  onSubmit?: (reason: string) => void;
};

function buildShareLinks(shareUrl: string, title: string) {
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedText = encodeURIComponent(title);

  return {
    whatsapp: `https://wa.me/?text=${encodeURIComponent(`${title} ${shareUrl}`)}`,
    messenger: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    instagram: '',
    x: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
  };
}

export function ShareSheet({
  open,
  onClose,
  variant,
  title,
  ownerName,
  ownerHandle,
  previewUrl,
  ownerAvatarUrl,
  countryFlagUrl,
  shareUrl,
}: ShareSheetProps) {
  const [copyState, setCopyState] = useState<'idle' | 'done'>('idle');

  useEffect(() => {
    if (!open) return;

    const onEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', onEsc);
    return () => document.removeEventListener('keydown', onEsc);
  }, [open, onClose]);

  const shareLinks = useMemo(() => buildShareLinks(shareUrl, title), [shareUrl, title]);

  if (!open) return null;

  const openShareWindow = (url: string) => {
    if (!url) {
      navigator.clipboard.writeText(shareUrl).catch(() => undefined);
      return;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-[110] bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="absolute inset-x-0 bottom-0 rounded-t-3xl border border-[#2a2a2a] bg-[#161616] p-5 shadow-[20px_20px_20px_0px_rgba(0,0,0,0.25)] md:left-1/2 md:top-1/2 md:inset-x-auto md:bottom-auto md:w-[400px] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-2xl md:p-8" onClick={(event) => event.stopPropagation()}>
        <div className="space-y-6">
          <div className="space-y-5 text-center">
            {variant === 'collection' ? (
              <div className="space-y-4">
                <div className="relative h-[220px] w-full overflow-hidden rounded-2xl bg-[#222]">
                  <img src={previewUrl} alt={title} className="h-full w-full object-cover" />
                  {ownerAvatarUrl ? (
                    <img
                      src={ownerAvatarUrl}
                      alt={ownerName}
                      className="absolute -bottom-3 left-1/2 h-14 w-14 -translate-x-1/2 rounded-xl border-2 border-[#161616] object-cover"
                    />
                  ) : null}
                </div>
                <p className="text-[32px] leading-8 font-medium text-white">{title}</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative mx-auto w-[200px] pb-8">
                  <div className="h-[194px] w-[200px] overflow-hidden rounded-xl bg-[#222]">
                    <img src={previewUrl} alt={title} className="h-full w-full object-cover" />
                  </div>
                  {ownerAvatarUrl ? (
                    <img
                      src={ownerAvatarUrl}
                      alt={ownerName}
                      className="absolute bottom-0 left-1/2 h-[60px] w-[60px] -translate-x-1/2 rounded-xl border-2 border-[#161616] object-cover"
                    />
                  ) : null}
                </div>

                <div className="flex items-center justify-center gap-2">
                  <p className="text-[34px] leading-8 font-medium text-white">{title}</p>
                  {variant === 'country' && countryFlagUrl ? (
                    <img src={countryFlagUrl} alt="Country flag" className="h-4 w-6 rounded-[2px] object-cover" />
                  ) : null}
                </div>
              </div>
            )}

            <div>
              <p className="text-white text-base font-medium">{ownerName}</p>
              <p className="text-[#989898] text-sm">@{ownerHandle}</p>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-3">
            <button type="button" onClick={() => openShareWindow(shareLinks.whatsapp)} className="flex h-[52px] items-center justify-center rounded-xl bg-[#2a2a2a]">
              <img src={SOCIAL_ICONS.whatsapp} alt="Share on WhatsApp" className="h-8 w-8 object-contain" />
            </button>
            <button type="button" onClick={() => openShareWindow(shareLinks.messenger)} className="flex h-[52px] items-center justify-center rounded-xl bg-[#2a2a2a]">
              <img src={SOCIAL_ICONS.messenger} alt="Share on Messenger" className="h-8 w-8 object-contain" />
            </button>
            <button type="button" onClick={() => openShareWindow(shareLinks.facebook)} className="flex h-[52px] items-center justify-center rounded-xl bg-[#2a2a2a]">
              <img src={SOCIAL_ICONS.facebook} alt="Share on Facebook" className="h-8 w-8 object-contain" />
            </button>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(shareUrl).catch(() => undefined);
                setCopyState('done');
                window.setTimeout(() => setCopyState('idle'), 1200);
              }}
              className="flex h-[52px] items-center justify-center rounded-xl bg-[#2a2a2a]"
            >
              <img src={SOCIAL_ICONS.instagram} alt="Copy for Instagram" className="h-8 w-8 object-contain" />
            </button>
            <button type="button" onClick={() => openShareWindow(shareLinks.x)} className="flex h-[52px] items-center justify-center rounded-xl bg-[#2a2a2a]">
              <img src={SOCIAL_ICONS.x} alt="Share on X" className="h-8 w-8 object-contain" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(shareUrl).catch(() => undefined);
              setCopyState('done');
              window.setTimeout(() => setCopyState('idle'), 1200);
            }}
            className="w-full rounded-full bg-white px-4 py-2.5 text-sm font-medium text-black"
          >
            {copyState === 'done' ? 'Copied' : 'Copy Link'}
          </button>
          <button type="button" onClick={onClose} className="w-full rounded-full border border-[#2a2a2a] px-4 py-2.5 text-sm text-[#d0d0d0] md:hidden">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export function ReportSheet({ open, onClose, targetLabel, onSubmit }: ReportSheetProps) {
  const [reason, setReason] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleClose = () => {
    setReason('');
    setSubmitted(false);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[120] bg-black/70 backdrop-blur-sm" onClick={handleClose}>
      <div className="absolute inset-x-0 bottom-0 rounded-t-3xl border border-[#2a2a2a] bg-[#161616] p-5 md:left-1/2 md:top-1/2 md:inset-x-auto md:bottom-auto md:w-[420px] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-2xl md:p-6" onClick={(event) => event.stopPropagation()}>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Report {targetLabel}</h3>
          <p className="text-sm text-[#9d9d9d]">Tell us what is wrong with this content.</p>
          <textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            rows={5}
            placeholder="Write your report reason"
            className="w-full rounded-xl border border-[#2a2a2a] bg-[#121212] px-3 py-2 text-sm text-[#e1e1e1] focus:outline-none"
          />
          {submitted ? <p className="text-sm text-[#86efac]">Report sent. Thank you.</p> : null}
          <div className="flex gap-2">
            <button type="button" onClick={handleClose} className="flex-1 rounded-full border border-[#2a2a2a] px-4 py-2.5 text-sm text-[#d0d0d0]">
              Cancel
            </button>
            <button
              type="button"
              disabled={!reason.trim()}
              onClick={() => {
                onSubmit?.(reason.trim());
                setSubmitted(true);
                window.setTimeout(handleClose, 800);
              }}
              className="flex-1 rounded-full bg-white px-4 py-2.5 text-sm font-medium text-black disabled:opacity-50"
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
