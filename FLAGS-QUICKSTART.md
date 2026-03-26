# 🎌 Travingat Flags - Quick Reference

## One-Line Setup

```bash
export FIGMA_TOKEN="your-token" && node scripts/fetch-flags-batch.js
```

## Get Figma Token
https://www.figma.com/developers/api#access-tokens

## File Locations

```
assets/flags/          → Flag SVG files (255 countries)
src/data/flags.json    → Flag metadata & mapping
src/components/CountryFlag.tsx  → React components
src/lib/flags.ts       → Utility functions
```

## Quick Examples

### Display a flag
```tsx
import { CountryFlag } from '@/components/CountryFlag';
<CountryFlag countryCode="US" size="md" />
```

### Get flag data
```ts
import { getFlagByCountryCode } from '@/lib/flags';
const flag = getFlagByCountryCode('GB');
```

### Backend usage
```ts
import flags from '@/data/flags.json';
const flag = flags.find(f => f.countryCode === 'US');
```

## Sizes
- `sm`: 24×16px
- `md`: 32×24px  
- `lg`: 48×32px
- `xl`: 64×48px

## See Full Documentation
→ [FLAGS-GUIDE.md](./FLAGS-GUIDE.md)
