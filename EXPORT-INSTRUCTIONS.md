# 🚀 Quick Export Instructions

## Get Your Figma Token (2 minutes)

1. **Visit Figma Settings**: https://www.figma.com/developers/api#access-tokens
2. **Click** "Get personal access token" or "Generate new token"
3. **Copy** the generated token (it looks like: `figd_...`)

## Export All 255 Flags (1 minute)

### Option A: Using the setup script (easiest)
```bash
cd /Users/vishnu/Downloads/Travingat\ MCP/travingat
export FIGMA_TOKEN="your-token-here"
./scripts/setup-flags.sh
```

### Option B: Direct command
```bash
cd /Users/vishnu/Downloads/Travingat\ MCP/travingat
export FIGMA_TOKEN="your-token-here"
npm run export-flags
```

## What Happens Next?

The script will:
1. ✅ Create directories (`public/assets/flags/`)
2. ✅ Download all 255 flag SVGs from Figma
3. ✅ Generate `src/data/flags.json` with complete metadata
4. ⏱️ Take about 2-3 minutes (with rate limiting to respect Figma's API)

## Verify Export

```bash
# Check that 255 SVG files were downloaded
ls public/assets/flags/ | wc -l

# Should output: 255
```

## Alternative: Let Me Try for You

If you paste your Figma token here, I can run the export command for you. Your token will only be used for this one-time export and won't be stored.

---

**Need help?** Check the [FLAGS-QUICKSTART.md](./FLAGS-QUICKSTART.md) or [README-FLAGS.md](./README-FLAGS.md) for more details
