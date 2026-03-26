#!/bin/bash

# Quick setup script for Travingat flags

echo "🎌 Travingat Flags Setup"
echo "======================="
echo ""

# Check if FIGMA_TOKEN is set
if [ -z "$FIGMA_TOKEN" ]; then
    echo "⚠️  FIGMA_TOKEN not found!"
    echo ""
    echo "To get your Figma Personal Access Token:"
    echo "  1. Go to: https://www.figma.com/developers/api#access-tokens"
    echo "  2. Click 'Generate new token'"
    echo "  3. Copy the token"
    echo ""
    echo "Then run:"
    echo "  export FIGMA_TOKEN='your-token-here'"
    echo "  ./scripts/setup-flags.sh"
    echo ""
    exit 1
fi

echo "✓ FIGMA_TOKEN is set"
echo ""

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    echo "Please install Node.js from: https://nodejs.org/"
    exit 1
fi

echo "✓ Node.js found: $(node --version)"
echo ""

# Create directories
echo "📁 Creating directories..."
mkdir -p assets/flags
mkdir -p src/data
echo "✓ Directories created"
echo ""

# Run the export script
echo "🚀 Starting flag export..."
echo "This will download all 255 flag SVGs from Figma"
echo ""

node scripts/fetch-flags-batch.js

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Setup complete!"
    echo ""
    echo "Your flags are ready at:"
    echo "  - SVGs: assets/flags/"
    echo "  - Mapping: src/data/flags.json"
    echo ""
    echo "Try them out:"
    echo "  import { CountryFlag } from '@/components/CountryFlag';"
    echo "  <CountryFlag countryCode=\"US\" size=\"md\" />"
    echo ""
    echo "See FLAGS-GUIDE.md for complete documentation"
else
    echo ""
    echo "❌ Setup failed"
    echo "Check the error messages above and try again"
    exit 1
fi
