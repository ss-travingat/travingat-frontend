# Country Flags Implementation Guide

This guide explains how to set up and use the 255 country flags from Figma in your Travingat application.

## 📋 Overview

We've created a complete infrastructure to export and use all 255 country flag SVGs from your Figma design file:

- **Scripts** to automate flag export from Figma
- **TypeScript utilities** for flag data management  
- **React components** for displaying flags
- **JSON mapping** for backend integration

## 🚀 Quick Start

### Step 1: Export Flags from Figma

1. **Get your Figma Personal Access Token:**
   - Visit: https://www.figma.com/developers/api#access-tokens
   - Generate a new token
   - Copy the token (shown once!)

2. **Set the token in your environment:**
   ```bash
   export FIGMA_TOKEN="your-figma-token-here"
   ```

3. **Run the export script:**
   ```bash
   cd travingat
   node scripts/fetch-flags-batch.js
   ```

   This will:
   - Fetch metadata for all 255 flags
   - Export SVGs from Figma
   - Save them to `assets/flags/`
   - Create `src/data/flags.json` mapping

## 📁 File Structure

```
travingat/
├── assets/flags/           # SVG flag files
│   ├── AE.svg
│   ├── AF.svg
│   ├── US.svg
│   └── ...                 # 255 total
│
├── src/
│   ├── components/
│   │   └── CountryFlag.tsx # React flag component
│   │
│   ├── data/
│   │   ├── flags.json      # Complete mapping (generated)
│   │   ├── flags-sample.json # Sample data
│   │   └── flag-node-ids.ts  # All Figma node IDs
│   │
│   └── lib/
│       └── flags.ts        # Flag utilities
│
└── scripts/
    ├── fetch-flags-batch.js    # Main export script
    ├── export-flags.js         # Alternative export script
    └── README-FLAGS.md         # Script documentation
```

## 💻 Usage Examples

### 1. Display a Flag (React/Next.js)

```tsx
import { CountryFlag } from '@/components/CountryFlag';

export function UserProfile({ user }) {
  return (
    <div>
      <CountryFlag countryCode={user.country} size="md" />
      <span>{user.name}</span>
    </div>
  );
}
```

### 2. Flag with Country Name

```tsx
import { CountryFlagWithName } from '@/components/CountryFlag';

<CountryFlagWithName countryCode="US" size="lg" />
// Displays: [🇺🇸 flag] United States
```

### 3. Get Flag Data (Utilities)

```ts
import { getFlagByCountryCode, getFlagPath } from '@/lib/flags';

// Get complete flag data
const flag = getFlagByCountryCode('GB');
console.log(flag);
// {
//   countryCode: "GB",
//   countryName: "United Kingdom",
//   path: "/assets/flags/GB.svg",
//   ...
// }

// Get just the path
const path = getFlagPath('FR'); // "/assets/flags/FR.svg"
```

### 4. Search Flags

```ts
import { searchFlagsByName } from '@/lib/flags';

const results = searchFlagsByName('united');
// Returns flags for: United States, United Kingdom, United Arab Emirates
```

### 5. Flag Selector Component

```tsx
import { FlagSelector } from '@/components/CountryFlag';
import { useState } from 'react';

export function ProfileForm() {
  const [country, setCountry] = useState('');
  
  return (
    <FlagSelector 
      value={country}
      onChange={setCountry}
      placeholder="Select your country"
    />
  );
}
```

### 6. Backend Usage (API Routes)

```ts
// app/api/profile/route.ts
import flags from '@/data/flags.json';

export async function POST(request: Request) {
  const { countryCode } = await request.json();
  
  const flag = flags.find(f => f.countryCode === countryCode);
  
  if (!flag) {
    return Response.json({ error: 'Invalid country code' }, { status: 400 });
  }
  
  // Save profile with flag data
  await db.profile.create({
    ...data,
    countryCode,
    flagUrl: flag.path
  });
  
  return Response.json({ success: true });
}
```

## 🎨 Component Props

### `CountryFlag`

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `countryCode` | `string` | required | ISO 3166-1 alpha-2 code (e.g., "US") |
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | Flag size |
| `className` | `string` | `''` | Additional CSS classes |
| `alt` | `string` | Auto-generated | Alt text for accessibility |

**Sizes:**
- `sm`: 24×16px
- `md`: 32×24px  
- `lg`: 48×32px
- `xl`: 64×48px

### `CountryFlagWithName`

Same as `CountryFlag` but displays country name alongside the flag.

### `FlagSelector`

| Prop | Type | Description |
|------|------|-------------|
| `value` | `string` | Currently selected country code |
| `onChange` | `(code: string) => void` | Callback when selection changes |
| `className` | `string` | Additional CSS classes |
| `placeholder` | `string` | Placeholder text |

## 🔧 Utility Functions

### `getFlagByCountryCode(countryCode: string): FlagData | undefined`
Returns complete flag data for a country code.

### `getFlagPath(countryCode: string): string | undefined`
Returns the asset path for a flag.

### `hasFlag(countryCode: string): boolean`
Checks if a flag is available.

### `getAllCountryCodes(): string[]`
Returns all available country codes, sorted alphabetically.

### `searchFlagsByName(query: string): FlagData[]`
Searches flags by country name or code.

## 📊 Flag Data Structure

Each flag in `flags.json` has this structure:

```json
{
  "countryCode": "US",
  "name": "flag/US",
  "countryName": "United States",
  "filename": "US.svg",
  "path": "/assets/flags/US.svg",
  "nodeId": "974:1234"
}
```

## 🛠️ Customization

### Custom Flag Sizes

```tsx
<Image
  src="/assets/flags/US.svg"
  alt="US Flag"
  width={100}
  height={75}
  className="rounded-md shadow-lg"
/>
```

### Styled Flag Component

```tsx
function CircularFlag({ countryCode }: { countryCode: string }) {
  return (
    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow">
      <CountryFlag 
        countryCode={countryCode} 
        size="md" 
        className="w-full h-full object-cover"
      />
    </div>
  );
}
```

## 🔍 Troubleshooting

### "Flag not found" display

If a flag is missing, the component shows a gray box with the country code. To fix:

1. Ensure the SVG exists in `assets/flags/`
2. Check that `flags.json` includes the country code
3. Re-run the export script if needed

### TypeScript errors

If you see import errors, ensure you have the proper types:

```bash
# Add to tsconfig.json compilerOptions if needed:
{
  "resolveJsonModule": true,
  "esModuleInterop": true
}
```

### Large bundle size

SVG flags are small (typically 1-5KB each), but if you want to optimize:

```tsx
// Lazy load flags
const CountryFlag = dynamic(() => import('@/components/CountryFlag'), {
  loading: () => <div className="w-8 h-6 bg-gray-200 animate-pulse" />
});
```

## 📦 What's Included

### ✅ Ready to Use
- Complete TypeScript utilities
- React components with TypeScript types
- Sample flag data
- Export automation scripts
- Comprehensive documentation

### ⏳ Needs Setup
- Run the export script once to download all 255 flags
- Set up your Figma API token

## 🎯 Next Steps

1. **Export the flags:**
   ```bash
   export FIGMA_TOKEN="your-token"
   node scripts/fetch-flags-batch.js
   ```

2. **Use in your components:**
   ```tsx
   import { CountryFlag } from '@/components/CountryFlag';
   <CountryFlag countryCode="US" size="md" />
   ```

3. **Integrate with your backend:**
   ```ts
   import flags from '@/data/flags.json';
   ```

## 📚 Additional Resources

- [Figma API Documentation](https://www.figma.com/developers/api)
- [ISO 3166-1 Country Codes](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2)
- [Next.js Image Optimization](https://nextjs.org/docs/pages/building-your-application/optimizing/images)

## 🤝 Support

If you encounter any issues:

1. Check that your Figma token is valid
2. Ensure you have internet connectivity
3. Verify the Figma file ID is correct: `akF49LpNU6mvr6q2J14zVR`
4. Re-run the export script

---

**Ready to use!** 🎉 Once you run the export script, all 255 flags will be available in your application.
