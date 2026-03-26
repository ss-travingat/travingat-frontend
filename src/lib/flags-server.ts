// Server-side utilities for working with flags
import flags from '@/data/flags-sample.json';
import type { FlagData } from '@/lib/flags';

/**
 * Validate if a country code exists
 */
export function isValidCountryCode(code: string): boolean {
  return flags.some(flag => flag.countryCode === code.toUpperCase());
}

/**
 * Get flag data by country code (server-side)
 */
export function getFlagData(countryCode: string): FlagData | null {
  const flag = flags.find(f => f.countryCode === countryCode.toUpperCase());
  return flag || null;
}

/**
 * Get multiple flags by country codes
 */
export function getMultipleFlags(countryCodes: string[]): FlagData[] {
  return countryCodes
    .map(code => getFlagData(code))
    .filter((flag): flag is FlagData => flag !== null);
}

/**
 * Get flags by region (you can extend this with region data)
 */
export function getFlagsByRegion(region: string): FlagData[] {
  // This is a placeholder - you can add region mappings
  const regionMap: Record<string, string[]> = {
    'north-america': ['US', 'CA', 'MX'],
    'europe': ['GB', 'FR', 'DE', 'IT', 'ES'],
    'asia': ['JP', 'CN', 'IN', 'KR', 'SG'],
    // Add more regions as needed
  };

  const codes = regionMap[region.toLowerCase()] || [];
  return getMultipleFlags(codes);
}

/**
 * Get popular/featured flags
 */
export function getFeaturedFlags(): FlagData[] {
  const featured = ['US', 'GB', 'FR', 'DE', 'JP', 'AU', 'CA', 'BR', 'IN', 'CN'];
  return getMultipleFlags(featured);
}

/**
 * Validate and sanitize country code input
 */
export function sanitizeCountryCode(input: string): string | null {
  const cleaned = input.trim().toUpperCase();
  
  if (!/^[A-Z]{2}$/.test(cleaned)) {
    return null;
  }
  
  if (!isValidCountryCode(cleaned)) {
    return null;
  }
  
  return cleaned;
}

/**
 * Get country name from code
 */
export function getCountryName(countryCode: string): string | null {
  const flag = getFlagData(countryCode);
  return flag?.countryName || null;
}

/**
 * Batch validate country codes
 */
export function validateCountryCodes(codes: string[]): {
  valid: string[];
  invalid: string[];
} {
  const valid: string[] = [];
  const invalid: string[] = [];
  
  codes.forEach(code => {
    const sanitized = sanitizeCountryCode(code);
    if (sanitized) {
      valid.push(sanitized);
    } else {
      invalid.push(code);
    }
  });
  
  return { valid, invalid };
}

/**
 * Get flag statistics
 */
export function getFlagStats() {
  return {
    total: flags.length,
    regions: Object.keys({
      'north-america': 1,
      'europe': 1,
      'asia': 1,
      // Add more
    }).length,
    featured: getFeaturedFlags().length
  };
}
