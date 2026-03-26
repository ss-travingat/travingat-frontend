# 🎌 Travingat Flags - Complete Implementation

## ✅ Status: Ready to Use

All infrastructure is in place to export and use 255 country flags from Figma as SVGs.

## 🚀 Quick Start (3 Minutes)

### 1. Get Figma Token
```bash
# Visit: https://www.figma.com/developers/api#access-tokens
# Generate a new token and copy it
```

### 2. Export All Flags
```bash
export FIGMA_TOKEN="your-token-here"
npm run export-flags
```

That's it! All 255 flags will be downloaded.

## 📂 What's Included

### ✅ Components (`src/components/`)
- **CountryFlag.tsx** - Three React components:
  - `<CountryFlag />` - Display flags with size options
  - `<CountryFlagWithName />` - Flag with country name
  - `<FlagSelector />` - Country dropdown

### ✅ Utilities (`src/lib/`)
- **flags.ts** - Client-side utilities:
  - `getFlagByCountryCode()`, `getFlagPath()`, `hasFlag()`
  - `getAllCountryCodes()`, `searchFlagsByName()`
- **flags-server.ts** - Server-side utilities:
  - `isValidCountryCode()`, `getFlagData()`
  - `getMultipleFlags()`, `sanitizeCountryCode()`

### ✅ Hooks (`src/hooks/`)
- **useFlags.ts** - React hooks:
  - `useFlag()`, `useCountrySelection()`
  - `useFlagSearch()`, `useMultiFlagSelection()`
  - `useFlagAPI()`

### ✅ API Routes (`src/app/api/`)
- **flags/route.ts** - REST API for flags:
  - GET `/api/flags` - Get all flags
  - GET `/api/flags?code=US` - Get specific flag
  - GET `/api/flags?search=united` - Search flags
  - POST `/api/flags` - Save profile with country

### ✅ Demo Pages (`src/app/`)
- **flags-demo/** - Complete demo page with all features
- **profile-example/** - Example profile form with country selector

### ✅ Scripts (`scripts/`)
- **fetch-flags-batch.js** - Export all 255 flags from Figma
- **setup-flags.sh** - One-command setup script
- **README-FLAGS.md** - Detailed documentation

### ✅ Documentation
- **FLAGS-GUIDE.md** - Complete usage guide
- **FLAGS-QUICKSTART.md** - Quick reference
- **IMPLEMENTATION-SUMMARY.md** - Overview

## 💻 Usage Examples

### Display a Flag
```tsx
import { CountryFlag } from '@/components/CountryFlag';

<CountryFlag countryCode="US" size="md" />
<CountryFlag countryCode="GB" size="lg" className="rounded shadow" />
```

### Flag with Country Name
```tsx
import { CountryFlagWithName } from '@/components/CountryFlag';

<CountryFlagWithName countryCode="FR" size="md" />
// Displays: [🇫🇷] France
```

### Country Selector
```tsx
import { FlagSelector } from '@/components/CountryFlag';

const [country, setCountry] = useState('');

<FlagSelector 
  value={country}
  onChange={setCountry}
  placeholder="Select your country"
/>
```

### Using Hooks
```tsx
import { useCountrySelection, useFlagSearch } from '@/hooks/useFlags';

// Country selection
const { countryCode, flag, setCountry } = useCountrySelection('US');

// Search functionality
const { query, setQuery, results } = useFlagSearch();
```

### Server-Side
```tsx
import { getFlagData, isValidCountryCode } from '@/lib/flags-server';

// In API route or server component
const flag = getFlagData('US');
const isValid = isValidCountryCode(userInput);
```

### API Usage
```typescript
// Fetch all flags
const response = await fetch('/api/flags');
const flags = await response.json();

// Get specific flag
const response = await fetch('/api/flags?code=US');
const flag = await response.json();

// Search flags
const response = await fetch('/api/flags?search=united');
const results = await response.json();

// Save profile with country
const response = await fetch('/api/flags', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: '123',
    countryCode: 'US',
    name: 'John Doe'
  })
});
```

## 📊 Flag Sizes

- **sm**: 24×16px - For inline text
- **md**: 32×24px - Default, balanced size
- **lg**: 48×32px - For prominent display
- **xl**: 64×48px - Hero sections

## 🎨 Customization

### Styled Flags
```tsx
// Circular flag
<div className="w-12 h-12 rounded-full overflow-hidden">
  <CountryFlag countryCode="JP" size="md" />
</div>

// With shadow and border
<CountryFlag 
  countryCode="BR" 
  size="lg" 
  className="rounded-md shadow-lg border-2 border-white"
/>

// Greyscale
<CountryFlag 
  countryCode="IN" 
  size="md" 
  className="grayscale hover:grayscale-0 transition"
/>
```

### Multiple Selection
```tsx
import { useMultiFlagSelection } from '@/hooks/useFlags';

const { selectedCountries, flags, toggleCountry } = useMultiFlagSelection(['US', 'GB']);

<div className="flex gap-2">
  {flags.map(flag => (
    <button key={flag.countryCode} onClick={() => toggleCountry(flag.countryCode)}>
      <CountryFlag countryCode={flag.countryCode} size="md" />
    </button>
  ))}
</div>
```

## 🔍 Demo Pages

After setup, visit:
- `/flags-demo` - Interactive demo with all features
- `/profile-example` - Example profile form with country selector

## 📦 NPM Scripts

```bash
# Export all flags from Figma
npm run export-flags

# Or use the setup script
npm run setup-flags
```

## 🛠️ Backend Integration

### Database Schema Example
```typescript
// User profile with country
interface UserProfile {
  id: string;
  name: string;
  email: string;
  countryCode: string;      // e.g., "US"
  countryName: string;      // e.g., "United States"
  flagPath: string;         // e.g., "/assets/flags/US.svg"
  createdAt: Date;
  updatedAt: Date;
}
```

### Validation Example
```typescript
import { isValidCountryCode, sanitizeCountryCode } from '@/lib/flags-server';

// Validate user input
const userInput = req.body.country;
const countryCode = sanitizeCountryCode(userInput);

if (!countryCode) {
  return res.status(400).json({ error: 'Invalid country code' });
}

// Save to database
await db.profile.update({
  where: { userId },
  data: { countryCode }
});
```

## 🔄 After Export

Once you run the export script, you'll have:
```
public/assets/flags/    → 255 SVG files (AE.svg, AF.svg, ..., ZW.svg)
src/data/flags.json     → Complete mapping with metadata
```

The `flags-sample.json` will be replaced with the complete `flags.json` containing all 255 countries.

## 📝 TypeScript Types

```typescript
interface FlagData {
  countryCode: string;      // ISO 3166-1 alpha-2 code
  name: string;             // Figma node name
  countryName: string;      // Full country name
  filename: string;         // SVG filename
  path: string;             // Asset path
  nodeId: string;           // Figma node ID
}
```

## 🎯 Next Steps

1. **Run the export** (if not done):
   ```bash
   export FIGMA_TOKEN="your-token"
   npm run export-flags
   ```

2. **Test the demo**:
   ```bash
   npm run dev
   # Visit http://localhost:3000/flags-demo
   ```

3. **Integrate into your app**:
   - Use `<CountryFlag />` in profile components
   - Add `<FlagSelector />` to forms
   - Use hooks for state management

## 📚 Full Documentation

- [FLAGS-GUIDE.md](./FLAGS-GUIDE.md) - Complete guide with examples
- [FLAGS-QUICKSTART.md](./FLAGS-QUICKSTART.md) - Quick reference
- [scripts/README-FLAGS.md](./scripts/README-FLAGS.md) - Script docs

## 🤝 Support

If you encounter issues:
1. Verify FIGMA_TOKEN is set correctly
2. Check internet connectivity
3. Re-run the export script
4. Check the logs for specific errors

---

**Ready to use!** 🎉 All infrastructure is in place. Just export the flags and start using them.
