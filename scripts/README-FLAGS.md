# Flag Assets Export

This directory contains scripts to export all 255 country flags from Figma as SVG files.

## Quick Setup

### Step 1: Get Your Figma Access Token

1. Go to [Figma Account Settings](https://www.figma.com/developers/api#access-tokens)
2. Scroll to "Personal Access Tokens"
3. Click "Generate new token"
4. Give it a name like "Travingat Flags Export"
5. Copy the token (it will only be shown once!)

### Step 2: Set the Token

**macOS/Linux:**
```bash
export FIGMA_TOKEN="your-token-here"
```

**Or add to your shell profile** (`~/.zshrc` or `~/.bash_profile`):
```bash
echo 'export FIGMA_TOKEN="your-token-here"' >> ~/.zshrc
source ~/.zshrc
```

### Step 3: Run the Export Script

```bash
cd travingat
node scripts/fetch-flags-batch.js
```

## What This Does

The script will:

1. **Fetch metadata** for all 255 flag nodes from Figma
   - Gets the country code from the flag name (e.g., "flag/US" → "US")

2. **Request SVG exports** from Figma's API
   - Exports all flags in SVG format for perfect scalability

3. **Download all SVG files** to `assets/flags/`
   - Files are named by country code (e.g., `US.svg`, `GB.svg`)

4. **Create a JSON mapping** at `src/data/flags.json`
   - Maps country codes to flag files for easy backend integration

## Output Structure

### SVG Files
```
assets/flags/
  ├── AE.svg   (United Arab Emirates)
  ├── AF.svg   (Afghanistan)
  ├── US.svg   (United States)
  ├── ZW.svg   (Zimbabwe)
  └── ...
```

### JSON Mapping
```json
[
  {
    "countryCode": "AE",
    "name": "flag/AE",
    "filename": "AE.svg",
    "path": "/assets/flags/AE.svg",
    "nodeId": "974:7346"
  },
  ...
]
```

## Using the Flags in Your Backend

### Import the mapping:

```typescript
import flags from '@/data/flags.json';

// Get flag by country code
const getFlag = (countryCode: string) => {
  return flags.find(f => f.countryCode === countryCode);
};

// Usage
const usFlag = getFlag('US');
console.log(usFlag.path); // "/assets/flags/US.svg"
```

### In Next.js components:

```tsx
import Image from 'next/image';

export function CountryFlag({ countryCode }: { countryCode: string }) {
  return (
    <Image
      src={`/assets/flags/${countryCode}.svg`}
      alt={`${countryCode} flag`}
      width={32}
      height={24}
    />
  );
}
```

## Troubleshooting

### "FIGMA_TOKEN is not set"
- Make sure you've exported the token in your current terminal session
- Or add it permanently to your shell profile

### "Authentication failed"
- Your token may be invalid or expired
- Generate a new token from Figma settings

### "Failed to download"
- Check your internet connection
- The script includes rate limiting, but if Figma's API is slow, it may timeout
- You can re-run the script; it will overwrite existing files

## Alternative Method (Manual)

If you prefer not to use the API:

1. Open the Figma file: https://www.figma.com/design/akF49LpNU6mvr6q2J14zVR/Travingat
2. Select all flag components
3. Right-click → "Copy as SVG"
4. Use the export menu to bulk export
5. Manually organize and create the JSON mapping

## Notes

- The script includes rate limiting to respect Figma's API limits
- SVG files are scalable and have small file sizes
- All 255 flags will be exported (all country codes)
- The mapping JSON is sorted alphabetically by country code
