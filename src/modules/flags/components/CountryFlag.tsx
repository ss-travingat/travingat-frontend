'use client';

import Image from 'next/image';
import { getAllCountryCodes, getFlagByCountryCode } from '@/lib/flags';

export interface CountryFlagProps {
  countryCode: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  alt?: string;
}

const sizeMap = {
  sm: { width: 24, height: 16 },
  md: { width: 32, height: 24 },
  lg: { width: 48, height: 32 },
  xl: { width: 64, height: 48 },
};

/**
 * CountryFlag component - Displays a country flag SVG
 *
 * @example
 * ```tsx
 * <CountryFlag countryCode="US" size="md" />
 * <CountryFlag countryCode="GB" size="lg" className="rounded" />
 * ```
 */
export function CountryFlag({
  countryCode,
  size = 'md',
  className = '',
  alt
}: CountryFlagProps) {
  const flag = getFlagByCountryCode(countryCode);
  const dimensions = sizeMap[size];

  if (!flag) {
    // Fallback for missing flags
    return (
      <div
        className={`inline-flex items-center justify-center bg-gray-200 text-gray-600 text-xs font-semibold ${className}`}
        style={{ width: dimensions.width, height: dimensions.height }}
        title={`Flag for ${countryCode} not found`}
      >
        {countryCode}
      </div>
    );
  }

  return (
    <Image
      src={flag.path}
      alt={alt || `${flag.countryName} flag`}
      width={dimensions.width}
      height={dimensions.height}
      className={`inline-block ${className}`}
      title={flag.countryName}
    />
  );
}

/**
 * CountryFlagWithName component - Displays flag with country name
 */
export function CountryFlagWithName({
  countryCode,
  size = 'md',
  className = ''
}: Omit<CountryFlagProps, 'alt'>) {
  const flag = getFlagByCountryCode(countryCode);

  if (!flag) {
    return <span className={className}>{countryCode}</span>;
  }

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <CountryFlag countryCode={countryCode} size={size} />
      <span>{flag.countryName}</span>
    </div>
  );
}

/**
 * FlagSelector component - Dropdown to select a country flag
 */
export interface FlagSelectorProps {
  value: string;
  onChange: (countryCode: string) => void;
  className?: string;
  placeholder?: string;
}

export function FlagSelector({
  value,
  onChange,
  className = '',
  placeholder = 'Select a country...'
}: FlagSelectorProps) {
  const countryCodes = getAllCountryCodes();

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`border rounded px-3 py-2 ${className}`}
    >
      <option value="">{placeholder}</option>
      {countryCodes.map((code: string) => {
        const flag = getFlagByCountryCode(code);
        return (
          <option key={code} value={code}>
            {flag?.countryName || code} ({code})
          </option>
        );
      })}
    </select>
  );
}
