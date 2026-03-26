const https = require('https');
const fs = require('fs');
const path = require('path');

// Configuration
const FILE_KEY = 'akF49LpNU6mvr6q2J14zVR';
const FIGMA_TOKEN = process.env.FIGMA_TOKEN; // Set this in your environment

// All node IDs
const nodeIds = [
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

// Function to make HTTPS request
function httpsRequest(url, options) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ data, statusCode: res.statusCode });
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

// Function to download file
function downloadFile(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filepath, () => {});
      reject(err);
    });
  });
}

// Main function
async function exportFlags() {
  if (!FIGMA_TOKEN) {
    console.error('Error: FIGMA_TOKEN environment variable is not set.');
    console.error('Please set it with: export FIGMA_TOKEN=your_token_here');
    console.error('Get your token from: https://www.figma.com/developers/api#access-tokens');
    process.exit(1);
  }

  const outputDir = path.join(__dirname, '..', 'assets', 'flags');
  const flagsMapping = [];

  console.log(`Starting export of ${nodeIds.length} flags...`);

  // Step 1: Get metadata for all nodes
  console.log('\nStep 1: Fetching metadata...');
  const nodeIdsParam = nodeIds.map(id => id.replace(':', '%3A')).join(',');
  
  try {
    const metadataUrl = `https://api.figma.com/v1/files/${FILE_KEY}/nodes?ids=${nodeIdsParam}`;
    const response = await httpsRequest(metadataUrl, {
      headers: { 'X-Figma-Token': FIGMA_TOKEN }
    });
    
    const metadata = JSON.parse(response.data);
    console.log(`✓ Fetched metadata for ${Object.keys(metadata.nodes).length} nodes`);

    // Extract flag names
    const flagData = {};
    for (const [nodeId, node] of Object.entries(metadata.nodes)) {
      const name = node.document?.name || 'Unknown';
      const countryCode = name.replace('flag/', '').toUpperCase();
      flagData[nodeId] = {
        nodeId: nodeId,
        name: name,
        countryCode: countryCode,
        filename: `${countryCode}.svg`
      };
    }

    // Step 2: Export SVGs
    console.log('\nStep 2: Requesting SVG exports from Figma...');
    const exportUrl = `https://api.figma.com/v1/images/${FILE_KEY}?ids=${nodeIdsParam}&format=svg`;
    const exportResponse = await httpsRequest(exportUrl, {
      headers: { 'X-Figma-Token': FIGMA_TOKEN }
    });
    
    const exportData = JSON.parse(exportResponse.data);
    console.log(`✓ Received ${Object.keys(exportData.images).length} export URLs`);

    // Step 3: Download all SVGs
    console.log('\nStep 3: Downloading SVG files...');
    let downloadCount = 0;
    
    for (const [nodeId, svgUrl] of Object.entries(exportData.images)) {
      if (!svgUrl) {
        console.warn(`⚠ No export URL for ${nodeId}`);
        continue;
      }

      const flag = flagData[nodeId];
      if (!flag) {
        console.warn(`⚠ No metadata for ${nodeId}`);
        continue;
      }

      const filepath = path.join(outputDir, flag.filename);
      
      try {
        await downloadFile(svgUrl, filepath);
        downloadCount++;
        
        flagsMapping.push({
          countryCode: flag.countryCode,
          name: flag.name,
          filename: flag.filename,
          nodeId: flag.nodeId
        });
        
        if (downloadCount % 10 === 0) {
          console.log(`  Downloaded ${downloadCount}/${Object.keys(exportData.images).length}...`);
        }
      } catch (err) {
        console.error(`✗ Failed to download ${flag.filename}:`, err.message);
      }
    }

    console.log(`✓ Downloaded ${downloadCount} SVG files`);

    // Step 4: Save mapping JSON
    console.log('\nStep 4: Creating flags mapping JSON...');
    const mappingPath = path.join(__dirname, '..', 'src', 'data', 'flags.json');
    
    // Sort by country code
    flagsMapping.sort((a, b) => a.countryCode.localeCompare(b.countryCode));
    
    fs.writeFileSync(mappingPath, JSON.stringify(flagsMapping, null, 2));
    console.log(`✓ Saved flags mapping to ${mappingPath}`);

    console.log(`\n✓ Export complete! ${downloadCount} flags exported.`);
    console.log(`  SVGs: ${outputDir}`);
    console.log(`  Mapping: ${mappingPath}`);

  } catch (error) {
    console.error('Error:', error.message);
    if (error.message.includes('401') || error.message.includes('403')) {
      console.error('\nAuthentication failed. Please check your FIGMA_TOKEN.');
    }
    process.exit(1);
  }
}

// Run the script
exportFlags();
