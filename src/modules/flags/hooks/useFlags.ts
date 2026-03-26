// React hooks for working with flags
'use client';

import { useState, useEffect, useMemo } from 'react';
import { getFlagByCountryCode, searchFlagsByName, getAllCountryCodes, type FlagData } from '@/lib/flags';

/**
 * Hook to get a flag by country code
 */
export function useFlag(countryCode: string) {
  const flag = useMemo(() => {
    return getFlagByCountryCode(countryCode);
  }, [countryCode]);

  return flag;
}

/**
 * Hook for country selection state
 */
export function useCountrySelection(initialCountry?: string) {
  const [selectedCountry, setSelectedCountry] = useState(initialCountry || '');
  const flag = useFlag(selectedCountry);

  return {
    countryCode: selectedCountry,
    flag,
    setCountry: setSelectedCountry,
    clearCountry: () => setSelectedCountry('')
  };
}

/**
 * Hook for searching flags
 */
export function useFlagSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FlagData[]>([]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const searchResults = searchFlagsByName(query);
    setResults(searchResults);
  }, [query]);

  return {
    query,
    setQuery,
    results,
    clearSearch: () => setQuery('')
  };
}

/**
 * Hook to get all country codes
 */
export function useAllCountries() {
  const countries = useMemo(() => getAllCountryCodes(), []);
  return countries;
}

/**
 * Hook for multiple flag selection
 */
export function useMultiFlagSelection(initialCountries: string[] = []) {
  const [selectedCountries, setSelectedCountries] = useState<string[]>(initialCountries);

  const flags = useMemo(() => {
    return selectedCountries
      .map(code => getFlagByCountryCode(code))
      .filter((flag): flag is FlagData => flag !== undefined);
  }, [selectedCountries]);

  const addCountry = (countryCode: string) => {
    if (!selectedCountries.includes(countryCode)) {
      setSelectedCountries([...selectedCountries, countryCode]);
    }
  };

  const removeCountry = (countryCode: string) => {
    setSelectedCountries(selectedCountries.filter(code => code !== countryCode));
  };

  const toggleCountry = (countryCode: string) => {
    if (selectedCountries.includes(countryCode)) {
      removeCountry(countryCode);
    } else {
      addCountry(countryCode);
    }
  };

  return {
    selectedCountries,
    flags,
    addCountry,
    removeCountry,
    toggleCountry,
    clearAll: () => setSelectedCountries([])
  };
}

/**
 * Hook to fetch flag data from API
 */
export function useFlagAPI(countryCode: string) {
  const [flag, setFlag] = useState<FlagData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!countryCode) {
      setFlag(null);
      return;
    }

    setLoading(true);
    setError(null);

    fetch(`/api/flags?code=${countryCode}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
          setFlag(null);
        } else {
          setFlag(data);
        }
      })
      .catch(err => {
        setError(err.message);
        setFlag(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [countryCode]);

  return { flag, loading, error };
}
