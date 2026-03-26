'use client';

import { useState, useCallback } from 'react';
import { compressImage } from '@/lib/compressImage';
import { apiFetch } from '@/lib/auth-client';
import { API_URL } from '@/lib/api-client';

function normalizeCountryCode(country) {
  if (!country) return 'US';
  const trimmed = String(country).trim();
  if (trimmed.length === 2) return trimmed.toUpperCase();
  return 'US';
}

export function useImageUpload() {
  const [preview, setPreview] = useState(null);
  const [r2Url, setR2Url] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  const upload = useCallback(async (file, { country, mediaType = 'media' } = {}) => {
    if (!file) return;

    setError(null);
    setProgress(0);

    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);
    setUploading(true);

    try {
      setProgress(10);
      const compressed = await compressImage(file);
      setProgress(40);

      const contentType = compressed.type || 'image/webp';
      const extension = contentType === 'image/png' ? 'png' : contentType === 'image/jpeg' ? 'jpg' : 'webp';
      const fileName = `${mediaType}-${Date.now()}.${extension}`;

      const res = await apiFetch(`${API_URL}/api/media/upload-url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          country: normalizeCountryCode(country),
          mediaType,
          contentType,
          fileSize: compressed.size,
          country_code: normalizeCountryCode(country),
          mime_type: contentType,
          size_bytes: compressed.size,
          file_name: fileName,
        }),
      });

      if (!res.ok) throw new Error('Failed to get presigned URL');
      const data = await res.json();
      const presignedUrl = data.presignedUrl || data.upload_url;
      const fileUrl = data.fileUrl || data.file_url;
      setProgress(50);

      const uploadRes = await fetch(presignedUrl, {
        method: 'PUT',
        body: compressed,
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });

      if (!uploadRes.ok) throw new Error('R2 upload failed');
      setProgress(100);

      setR2Url(fileUrl);
      URL.revokeObjectURL(localPreview);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  }, []);

  const reset = useCallback(() => {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setR2Url(null);
    setProgress(0);
    setError(null);
  }, [preview]);

  return {
    preview,
    r2Url,
    displayUrl: r2Url || preview,
    uploading,
    progress,
    error,
    upload,
    reset,
  };
}
