'use client';

import Image from 'next/image';
import { useState } from 'react';

export function TravelImage({
  src,
  alt,
  width = 1200,
  height = 800,
  className = '',
  priority = false,
  quality = 88,
}) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  if (src?.startsWith('blob:')) {
    return <img src={src} alt={alt} className={`transition-opacity duration-300 ${className}`} />;
  }

  if (errored || !src) {
    return (
      <div className={`bg-gray-100 flex items-center justify-center ${className}`}>
        <span className="text-gray-400 text-sm">Image unavailable</span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {!loaded && <div className="absolute inset-0 bg-gray-200 animate-pulse" />}
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        quality={quality}
        priority={priority}
        loading={priority ? 'eager' : 'lazy'}
        onLoad={() => setLoaded(true)}
        onError={() => setErrored(true)}
        className={`transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
      />
    </div>
  );
}
