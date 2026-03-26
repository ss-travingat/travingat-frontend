'use client';

import { CountryFlag } from '@/components/CountryFlag';
import Image from 'next/image';

export default function FlagTest() {
  return (
    <div className="min-h-screen bg-white p-8">
      <h1 className="text-3xl font-bold mb-8">Flag Rendering Test</h1>

      <div className="space-y-8">
        {/* Test individual flags */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Size Tests</h2>
          <div className="flex gap-4 items-end">
            <div>
              <p className="text-sm mb-2">Small (24×16)</p>
              <CountryFlag countryCode="US" size="sm" />
            </div>
            <div>
              <p className="text-sm mb-2">Medium (32×24)</p>
              <CountryFlag countryCode="US" size="md" />
            </div>
            <div>
              <p className="text-sm mb-2">Large (48×32)</p>
              <CountryFlag countryCode="US" size="lg" />
            </div>
            <div>
              <p className="text-sm mb-2">XL (64×48)</p>
              <CountryFlag countryCode="US" size="xl" />
            </div>
          </div>
        </section>

        {/* Test multiple flags */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Country Samples</h2>
          <div className="grid grid-cols-8 gap-4">
            {['US', 'GB', 'FR', 'DE', 'JP', 'IN', 'BR', 'CA',
              'AU', 'IT', 'ES', 'MX', 'CN', 'KR', 'RU', 'ZA'].map(code => (
                <div key={code} className="text-center">
                  <CountryFlag countryCode={code} size="lg" />
                  <p className="text-xs mt-2">{code}</p>
                </div>
              ))}
          </div>
        </section>

        {/* Direct image test */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Direct Image Test</h2>
          <div className="flex gap-4">
            <div>
              <p className="text-sm mb-2">US Flag (direct img)</p>
              <Image src="/assets/flags/US.svg" alt="US" width="48" height="32" />
            </div>
            <div>
              <p className="text-sm mb-2">GB Flag (direct img)</p>
              <Image src="/assets/flags/GB.svg" alt="GB" width="48" height="32" />
            </div>
            <div>
              <p className="text-sm mb-2">FR Flag (direct img)</p>
              <Image src="/assets/flags/FR.svg" alt="FR" width="48" height="32" />
            </div>
          </div>
        </section>

        {/* Path info */}
        <section className="bg-gray-50 p-4 rounded">
          <h2 className="text-xl font-semibold mb-2">Path Information</h2>
          <p className="text-sm text-gray-600">
            Flags location: <code className="bg-gray-200 px-2 py-1 rounded">public/assets/flags/</code>
          </p>
          <p className="text-sm text-gray-600 mt-2">
            Served at: <code className="bg-gray-200 px-2 py-1 rounded">/assets/flags/*.svg</code>
          </p>
        </section>
      </div>
    </div>
  );
}
