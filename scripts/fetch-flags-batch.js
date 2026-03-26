#!/usr/bin/env node

/**
 * Batch script to fetch all flag metadata using Figma API
 *
 * Usage:
 *   1. Get a Figma Personal Access Token from: https://www.figma.com/developers/api#access-tokens
 *   2. Set the token: export FIGMA_TOKEN="your-token-here"
 *   3. Run: node scripts/fetch-flags-batch.js
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const FILE_KEY = 'akF49LpNU6mvr6q2J14zVR';
const FIGMA_TOKEN = process.env.FIGMA_TOKEN || process.env.FIGMA_ACCESS_TOKEN;

const ALL_NODE_IDS = [
  "974:5655", "974:7346", "974:7340", "974:7332", "974:7314", "974:7310", "974:7302", "974:7299", "974:7294", "974:7287",
  "974:7284", "974:7253", "974:7240", "974:7235", "974:7228", "974:7217", "974:7207", "974:7191", "974:7169", "974:7139",
  "974:7134", "974:7113", "974:7107", "974:7102", "974:7089", "974:7086", "974:7075", "974:7070", "974:7065", "974:7057",
  "974:7052", "974:7045", "974:7033", "974:7025", "974:7018", "974:7014", "974:7010", "974:7005", "974:6961", "974:6917",
  "974:6886", "974:6882", "974:6853", "974:6870", "974:7220", "974:6817", "974:6813", "974:5806", "974:6808", "974:6770",
  "974:6694", "974:7093", "974:6690", "974:6678", "974:6712", "974:6990", "974:6669", "974:7002", "974:6718", "974:6665",
  "974:5954", "974:6662", "974:6658", "974:6723", "974:6654", "974:6613", "974:6586", "974:5840", "974:6575", "974:6932",
  "974:6957", "974:6554", "974:6538", "974:5784", "974:6530", "974:6515", "974:6045", "974:6497", "974:6029", "974:6481",
  "974:6842", "974:6477", "974:6463", "974:6762", "974:6453", "974:6435", "974:6127", "974:6595", "974:7178", "974:6432",
  "974:6427", "974:6397", "974:7145", "974:6486", "974:6392", "974:6492", "974:6382", "974:7128", "974:6375", "974:6010",
  "974:6794", "974:6358", "974:5993", "974:6825", "974:6353", "974:6334", "974:5964", "974:6329", "974:6325", "974:6308",
  "974:7038", "974:6295", "974:6247", "974:6911", "974:6203", "974:6196", "974:6301", "974:6609", "974:5869", "974:6190",
  "974:6914", "974:6605", "974:6133", "974:6186", "974:6650", "974:6178", "974:6545", "974:7260", "974:6149", "974:6283",
  "974:6122", "974:6116", "974:6274", "974:6113", "974:7224", "974:6422", "974:5770", "974:7159", "974:6051", "974:6416",
  "974:5829", "974:6107", "974:6099", "974:6733", "974:6314", "974:6412", "974:5809", "974:6087", "974:6243", "974:5755",
  "974:6501", "974:5798", "974:6082", "974:6172", "974:6785", "974:6077", "974:6789", "974:6065", "974:6018", "974:6071",
  "974:6799", "974:5998", "974:5720", "974:6838", "974:5667", "974:6054", "974:6262", "974:6975", "974:6166", "974:6095",
  "974:6567", "974:6407", "974:5814", "974:7149", "974:6022", "974:7270", "974:5881", "974:6159", "974:6154", "974:6626",
  "974:5990", "974:7117", "974:6468", "974:7061", "974:6059", "974:6739", "974:7322", "974:6320", "974:6254", "974:5948",
  "974:5920", "974:7351", "974:6708", "974:5899", "974:6969", "974:5892", "974:5886", "974:6642", "974:7364", "974:6781",
  "974:5984", "974:5971", "974:5693", "974:7082", "974:6339", "974:5680", "974:6270", "974:7232", "974:6589", "974:6520",
  "974:5833", "974:6258", "974:7165", "974:5760", "974:6878", "974:5820", "974:5977", "974:6445", "974:5689", "974:5709",
  "974:5703", "974:6449", "974:6104", "974:5836", "974:5791", "974:6902", "974:7203", "974:6925", "974:6600", "974:6006",
  "974:5903", "974:5765", "974:7154", "974:5940", "974:6438", "974:5698", "974:6945", "974:6217", "974:6821", "974:6874",
  "974:6401", "974:5737", "974:5846", "974:6363", "974:6457", "974:5717", "974:7264", "974:5875", "974:6562", "974:6952",
  "974:5778", "974:6278", "974:5673", "974:6620", "974:5864"
];

function apiRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${parsed.error || data}`));
          }
        } catch (e) {
          console.error(e);
          reject(new Error(`Failed to parse response: ${data.substring(0, 200)}`));
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

function downloadFile(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}`));
        return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filepath, () => { });
      reject(err);
    });
  });
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  if (!FIGMA_TOKEN) {
    console.error('❌ Error: FIGMA_TOKEN environment variable is not set.\n');
    console.error('To get your Figma Personal Access Token:');
    console.error('  1. Go to https://www.figma.com/developers/api#access-tokens');
    console.error('  2. Click "Get personal access token"');
    console.error('  3. Generate a new token');
    console.error('  4. Run: export FIGMA_TOKEN="your-token-here"\n');
    process.exit(1);
  }

  const assetsDir = path.join(__dirname, '..', 'assets', 'flags');
  const dataDir = path.join(__dirname, '..', 'src', 'data');

  // Ensure directories exist
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  console.log(`🚀 Starting flag export for ${ALL_NODE_IDS.length} flags...\n`);

  try {
    // Step 1: Fetch metadata in batches (Figma API limits to ~50 nodes per request)
    console.log('📋 Step 1: Fetching metadata...');
    const BATCH_SIZE = 50;
    const flagsMetadata = [];

    for (let i = 0; i < ALL_NODE_IDS.length; i += BATCH_SIZE) {
      const batch = ALL_NODE_IDS.slice(i, i + BATCH_SIZE);
      const nodeIdsParam = batch.map(id => id.replace(':', '%3A')).join(',');
      const url = `https://api.figma.com/v1/files/${FILE_KEY}/nodes?ids=${nodeIdsParam}`;

      console.log(`  Fetching batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(ALL_NODE_IDS.length / BATCH_SIZE)}...`);

      const response = await apiRequest(url, {
        headers: { 'X-Figma-Token': FIGMA_TOKEN }
      });

      for (const [nodeId, node] of Object.entries(response.nodes || {})) {
        const name = node.document?.name || 'Unknown';
        const countryCode = name.replace('flag/', '').toUpperCase();
        flagsMetadata.push({
          nodeId: nodeId,
          name: name,
          countryCode: countryCode
        });
      }

      // Rate limiting
      if (i + BATCH_SIZE < ALL_NODE_IDS.length) {
        await sleep(100);
      }
    }

    console.log(`✅ Fetched metadata for ${flagsMetadata.length} flags\n`);

    // Step 2: Export SVGs in batches
    console.log('🎨 Step 2: Requesting SVG exports...');
    const exports = {};

    for (let i = 0; i < ALL_NODE_IDS.length; i += BATCH_SIZE) {
      const batch = ALL_NODE_IDS.slice(i, i + BATCH_SIZE);
      const nodeIdsParam = batch.map(id => id.replace(':', '%3A')).join(',');
      const url = `https://api.figma.com/v1/images/${FILE_KEY}?ids=${nodeIdsParam}&format=svg`;

      console.log(`  Requesting batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(ALL_NODE_IDS.length / BATCH_SIZE)}...`);

      const response = await apiRequest(url, {
        headers: { 'X-Figma-Token': FIGMA_TOKEN }
      });

      Object.assign(exports, response.images || {});

      // Rate limiting
      if (i + BATCH_SIZE < ALL_NODE_IDS.length) {
        await sleep(100);
      }
    }

    console.log(`✅ Received ${Object.keys(exports).length} SVG export URLs\n`);

    // Step 3: Download all SVGs
    console.log('⬇️  Step 3: Downloading SVG files...');
    const flagsData = [];
    let successCount = 0;
    let failCount = 0;

    for (const flag of flagsMetadata) {
      const nodeId = flag.nodeId;
      const svgUrl = exports[nodeId];

      if (!svgUrl) {
        console.warn(`  ⚠️  No export URL for ${flag.countryCode} (${nodeId})`);
        failCount++;
        continue;
      }

      const filename = `${flag.countryCode}.svg`;
      const filepath = path.join(assetsDir, filename);

      try {
        await downloadFile(svgUrl, filepath);
        successCount++;

        flagsData.push({
          countryCode: flag.countryCode,
          name: flag.name,
          filename: filename,
          path: `/assets/flags/${filename}`,
          nodeId: nodeId
        });

        if (successCount % 25 === 0) {
          console.log(`  Progress: ${successCount}/${flagsMetadata.length} downloaded...`);
        }

        // Rate limiting for downloads
        await sleep(50);
      } catch (err) {
        console.error(`  ❌ Failed to download ${flag.countryCode}: ${err.message}`);
        failCount++;
      }
    }

    console.log(`✅ Downloaded ${successCount} SVG files (${failCount} failed)\n`);

    // Step 4: Create JSON mapping file
    console.log('💾 Step 4: Creating flags mapping...');
    flagsData.sort((a, b) => a.countryCode.localeCompare(b.countryCode));

    const mappingPath = path.join(dataDir, 'flags.json');
    fs.writeFileSync(mappingPath, JSON.stringify(flagsData, null, 2));
    console.log(`✅ Saved ${flagsData.length} flag mappings to flags.json\n`);

    // Summary
    console.log('🎉 Export complete!\n');
    console.log(`Summary:`);
    console.log(`  ✅ ${successCount} flags exported successfully`);
    console.log(`  ❌ ${failCount} flags failed`);
    console.log(`  📁 SVGs saved to: ${assetsDir}`);
    console.log(`  📄 Mapping saved to: ${mappingPath}\n`);

  } catch (error) {
    console.error('\n❌ Error:', error.message);

    if (error.message.includes('401') || error.message.includes('403')) {
      console.error('\n🔐 Authentication failed. Please check your FIGMA_TOKEN.');
    } else if (error.message.includes('404')) {
      console.error('\n📁 File not found. Please verify the FILE_KEY is correct.');
    }

    process.exit(1);
  }
}

// Run
main();
