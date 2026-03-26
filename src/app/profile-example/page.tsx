// Example: Profile page with country flag integration
'use client';

import { useState } from 'react';
import { CountryFlag, FlagSelector } from '@/components/CountryFlag';
import { useCountrySelection } from '@/hooks/useFlags';

interface ProfileFormData {
  name: string;
  email: string;
  bio: string;
  country: string;
}

export default function ProfileExample() {
  const { countryCode, flag, setCountry } = useCountrySelection('US');
  const [formData, setFormData] = useState<ProfileFormData>({
    name: '',
    email: '',
    bio: '',
    country: countryCode
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch('/api/flags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: '123', // Replace with actual user ID
          countryCode: formData.country,
          ...formData
        })
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Profile saved successfully!');
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      alert('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Edit Profile
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Country Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Country
            </label>
            <FlagSelector
              value={formData.country}
              onChange={(code) => {
                setFormData({ ...formData, country: code });
                setCountry(code);
              }}
              className="w-full"
            />
          </div>

          {/* Display Selected Flag */}
          {flag && (
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <CountryFlag countryCode={flag.countryCode} size="lg" />
              <div>
                <p className="font-medium text-gray-900">{flag.countryName}</p>
                <p className="text-sm text-gray-600">Country code: {flag.countryCode}</p>
              </div>
            </div>
          )}

          {/* Bio Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bio
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </form>

        {/* Example Usage Code */}
        <div className="mt-8 p-4 bg-gray-900 text-gray-100 rounded-lg overflow-x-auto">
          <p className="text-xs text-gray-400 mb-2">Example code:</p>
          <pre className="text-sm">
{`// Using the country hook
const { countryCode, flag, setCountry } = useCountrySelection('US');

// In your form
<FlagSelector
  value={formData.country}
  onChange={(code) => {
    setFormData({ ...formData, country: code });
    setCountry(code);
  }}
/>

// Display flag
{flag && (
  <CountryFlag countryCode={flag.countryCode} size="lg" />
)}`}
          </pre>
        </div>
      </div>
    </div>
  );
}
