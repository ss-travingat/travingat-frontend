'use client';

import { useImageUpload } from '@/hooks/useImageUpload';
import { TravelImage } from '@/components/TravelImage';

export default function UploadPage() {
  const { displayUrl, uploading, progress, error, upload } = useImageUpload();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // @ts-expect-error - useImageUpload is JS; country is valid at runtime
    await upload(file, { country: 'JP' });
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={uploading}
        className="mb-4"
      />

      {uploading && (
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {displayUrl && (
        <TravelImage
          src={displayUrl}
          alt="Travel photo"
          width={1200}
          height={800}
          className="rounded-xl w-full"

        />
      )}

      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </div>
  );
}
