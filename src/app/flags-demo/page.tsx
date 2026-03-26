'use client';

import { useState } from 'react';
import { CountryFlag, CountryFlagWithName, FlagSelector } from '@/components/CountryFlag';
import { getAllCountryCodes, searchFlagsByName } from '@/lib/flags';

export default function FlagsDemo() {
  const [selectedCountry, setSelectedCountry] = useState('US');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSize, setSelectedSize] = useState<'sm' | 'md' | 'lg' | 'xl'>('md');

  const searchResults = searchQuery ? searchFlagsByName(searchQuery) : [];
  const allCountries = getAllCountryCodes();

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🎌 Country Flags Demo
          </h1>
          <p className="text-lg text-gray-600">
            255 country flags from Figma - All sizes and styles
          </p>
        </div>

        {/* Flag Selector Section */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-6">Country Selector</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select a country:
              </label>
              <FlagSelector
                value={selectedCountry}
                onChange={setSelectedCountry}
                className="w-full max-w-md"
              />
            </div>
            
            {selectedCountry && (
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <CountryFlag countryCode={selectedCountry} size="lg" />
                <div>
                  <p className="font-medium text-gray-900">Selected: {selectedCountry}</p>
                  <CountryFlagWithName countryCode={selectedCountry} size="sm" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Size Demonstration */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-6">Flag Sizes</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select size:
              </label>
              <div className="flex gap-2">
                {(['sm', 'md', 'lg', 'xl'] as const).map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 rounded-md font-medium transition-colors ${
                      selectedSize === size
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {size.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['US', 'GB', 'FR', 'DE', 'JP', 'BR', 'IN', 'CN'].map((code) => (
                <div key={code} className="flex flex-col items-center gap-2 p-4 bg-gray-50 rounded-lg">
                  <CountryFlag countryCode={code} size={selectedSize} />
                  <span className="text-sm font-medium text-gray-700">{code}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Search Functionality */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-6">Search Flags</h2>
          <div className="space-y-4">
            <div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by country name or code..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {searchResults.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                {searchResults.slice(0, 12).map((flag) => (
                  <div
                    key={flag.countryCode}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => {
                      setSelectedCountry(flag.countryCode);
                      setSearchQuery('');
                    }}
                  >
                    <CountryFlag countryCode={flag.countryCode} size="md" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {flag.countryName}
                      </p>
                      <p className="text-sm text-gray-500">{flag.countryCode}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* All Flags Grid */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-semibold mb-6">
            All Available Flags ({allCountries.length})
          </h2>
          <div className="grid grid-cols-4 md:grid-cols-8 lg:grid-cols-12 gap-4">
            {allCountries.slice(0, 48).map((code) => (
              <div
                key={code}
                className="flex flex-col items-center gap-1 p-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                title={code}
                onClick={() => setSelectedCountry(code)}
              >
                <CountryFlag countryCode={code} size="sm" />
                <span className="text-xs text-gray-600">{code}</span>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500 mt-4 text-center">
            Showing first 48 flags. Total: {allCountries.length} available.
          </p>
        </div>

        {/* Usage Examples */}
        <div className="bg-white rounded-lg shadow-md p-8 mt-8">
          <h2 className="text-2xl font-semibold mb-6">Code Examples</h2>
          <div className="space-y-4">
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
              <pre className="text-sm">
{`// Basic usage
<CountryFlag countryCode="US" size="md" />

// With country name
<CountryFlagWithName countryCode="GB" size="lg" />

// Flag selector
<FlagSelector 
  value={country}
  onChange={setCountry}
/>`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
