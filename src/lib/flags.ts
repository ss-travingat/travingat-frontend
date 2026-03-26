// Flag data types and utilities

export interface FlagData {
  countryCode: string;
  name: string;
  countryName: string;
  filename: string;
  path: string;
  nodeId: string;
}

// Import the complete flags data (255 countries)
import flagsData from '../data/flags.json';

export const flags: FlagData[] = flagsData;

/**
 * Get flag data by country code
 * @param countryCode - ISO 3166-1 alpha-2 country code (e.g., "US", "GB", "FR")
 * @returns Flag data or undefined if not found
 */
export function getFlagByCountryCode(countryCode: string): FlagData | undefined {
  return flags.find(flag => flag.countryCode === countryCode.toUpperCase());
}

/**
 * Get flag path by country code
 * @param countryCode - ISO 3166-1 alpha-2 country code
 * @returns Flag asset path or undefined if not found
 */
export function getFlagPath(countryCode: string): string | undefined {
  return getFlagByCountryCode(countryCode)?.path;
}

/**
 * Check if a country flag is available
 * @param countryCode - ISO 3166-1 alpha-2 country code
 * @returns True if flag is available
 */
export function hasFlag(countryCode: string): boolean {
  return getFlagByCountryCode(countryCode) !== undefined;
}

/**
 * Get all available country codes
 * @returns Array of all available country codes
 */
export function getAllCountryCodes(): string[] {
  return flags.map(flag => flag.countryCode).sort();
}

/**
 * Search flags by country name
 * @param query - Search query
 * @returns Array of matching flags
 */
export function searchFlagsByName(query: string): FlagData[] {
  const lowerQuery = query.toLowerCase();
  return flags.filter(flag => 
    flag.countryName.toLowerCase().includes(lowerQuery) ||
    flag.countryCode.toLowerCase().includes(lowerQuery)
  );
}
