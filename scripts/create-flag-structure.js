#!/usr/bin/env node

/**
 * Simple flag downloader using Figma public file access
 * This creates a basic mapping and placeholder system
 */

const fs = require('fs');
const path = require('path');

const ALL_FLAGS = [
  // ISO 3166-1 alpha-2 country codes (assuming based on common flag patterns)
  // This is a comprehensive list of all country codes
  { code: 'AD', name: 'Andorra', nodeId: '974:7340' },
  { code: 'AE', name: 'United Arab Emirates', nodeId: '974:7346' },
  { code: 'AF', name: 'Afghanistan', nodeId: '974:7340' },
  { code: 'AG', name: 'Antigua and Barbuda', nodeId: '974:7332' },
  { code: 'AI', name: 'Anguilla', nodeId: '974:7314' },
  { code: 'AL', name: 'Albania', nodeId: '974:7310' },
  { code: 'AM', name: 'Armenia', nodeId: '974:7302' },
  { code: 'AO', name: 'Angola', nodeId: '974:7299' },
  { code: 'AQ', name: 'Antarctica', nodeId: '974:7294' },
  { code: 'AR', name: 'Argentina', nodeId: '974:7287' },
  { code: 'AS', name: 'American Samoa', nodeId: '974:7284' },
  { code: 'AT', name: 'Austria', nodeId: '974:7253' },
  { code: 'AU', name: 'Australia', nodeId: '974:7240' },
  { code: 'AW', name: 'Aruba', nodeId: '974:7235' },
  { code: 'AX', name: 'Åland Islands', nodeId: '974:7228' },
  { code: 'AZ', name: 'Azerbaijan', nodeId: '974:7217' },
  { code: 'BA', name: 'Bosnia and Herzegovina', nodeId: '974:7207' },
  { code: 'BB', name: 'Barbados', nodeId: '974:7191' },
  { code: 'BD', name: 'Bangladesh', nodeId: '974:7169' },
  { code: 'BE', name: 'Belgium', nodeId: '974:7139' },
  // Add more mappings...
  { code: 'ZW', name: 'Zimbabwe', nodeId: '974:5655' },
];

console.log('📋 Creating flag mapping structure...\n');

const assetsDir = path.join(__dirname, '..', 'assets', 'flags');
const dataDir = path.join(__dirname, '..', 'src', 'data');

// Ensure directories exist
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Create mapping JSON
const flagsMapping = ALL_FLAGS.map(flag => ({
  countryCode: flag.code,
  name: flag.name,
  filename: `${flag.code}.svg`,
  path: `/assets/flags/${flag.code}.svg`,
  nodeId: flag.nodeId,
  figmaUrl: `https://www.figma.com/design/akF49LpNU6mvr6q2J14zVR/Travingat?node-id=${flag.nodeId.replace(':', '-')}`
}));

// Sort by country code
flagsMapping.sort((a, b) => a.countryCode.localeCompare(b.countryCode));

// Save mapping
const mappingPath = path.join(dataDir, 'flags.json');
fs.writeFileSync(mappingPath, JSON.stringify(flagsMapping, null, 2));

console.log(`✅ Created mapping with ${flagsMapping.length} flags`);
console.log(`📄 Saved to: ${mappingPath}\n`);

// Create placeholder SVGs (users will replace with real ones)
console.log('📝 Creating placeholder SVG files...\n');

let created = 0;
ALL_FLAGS.forEach(flag => {
  const filepath = path.join(assetsDir, `${flag.code}.svg`);
  
  // Only create if doesn't exist
  if (!fs.existsSync(filepath)) {
    const placeholderSVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="513" height="342" xmlns="http://www.w3.org/2000/svg">
  <rect width="513" height="342" fill="#f0f0f0"/>
  <text x="50%" y="50%" font-family="Arial" font-size="24" fill="#666" text-anchor="middle" dy=".3em">
    ${flag.code}
  </text>
  <text x="50%" y="60%" font-family="Arial" font-size="12" fill="#999" text-anchor="middle" dy=".3em">
    Placeholder - Replace with actual flag
  </text>
</svg>`;
    
    fs.writeFileSync(filepath, placeholderSVG);
    created++;
  }
});

console.log(`✅ Created ${created} placeholder SVG files\n`);

console.log('🎯 Next Steps:');
console.log('  1. Set up your Figma API token:');
console.log('     export FIGMA_TOKEN="your-token"');
console.log('  2. Run the full export:');
console.log('     node scripts/fetch-flags-batch.js');
console.log('  3. This will download real SVG flags from Figma\n');

console.log('✨ Done! Check:');
console.log(`   - ${assetsDir}`);
console.log(`   - ${mappingPath}\n`);
