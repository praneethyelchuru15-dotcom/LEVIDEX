const https = require('https');
const fs = require('fs');
const path = require('path');

const batchFile = path.join(__dirname, 'components_batch.json');
const TARGET_DIR = path.join(__dirname, '../ElectroGuide/assets/images/components');

if (!fs.existsSync(TARGET_DIR)) {
  fs.mkdirSync(TARGET_DIR, { recursive: true });
}

const components = JSON.parse(fs.readFileSync(batchFile, 'utf8'));

async function downloadPlaceholder(file, rawText) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(TARGET_DIR, file);
    // Escape text for the URL
    const safeText = encodeURIComponent(rawText.substring(0, 15));
    // Dark slate background with white bold text placeholder
    const url = `https://placehold.co/400x400/1e293b/ffffff.png?text=${safeText}`;
    
    // Skip if it already exists so we don't spam the server
    if (fs.existsSync(filePath)) {
        console.log(`⏩ Skipping ${file} (Already exists)`);
        return resolve();
    }

    const fileStream = fs.createWriteStream(filePath);
    
    https.get(url, { headers: { 'User-Agent': 'Node' } }, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        https.get(response.headers.location, { headers: { 'User-Agent': 'Node' } }, (res) => {
          res.pipe(fileStream);
          fileStream.on('finish', () => { fileStream.close(); resolve(); });
        });
      } else {
        response.pipe(fileStream);
        fileStream.on('finish', () => { fileStream.close(); resolve(); });
      }
    }).on('error', (err) => {
      fs.unlink(filePath, () => {});
      reject(err);
    });
  });
}

async function run() {
  console.log(`🎨 Generating ${components.length} Dynamic Hardware Placeholders...`);
  for (const component of components) {
    if(!component.imageKey) continue;
    const displayName = component.name.split(' ')[0].replace(/[^a-zA-Z0-9]/g, ''); // Get simple prefix like "Thermistor" or "ADXL335"
    
    try {
      await downloadPlaceholder(component.imageKey, component.name);
    } catch (e) {
      console.error(`❌ Failed on ${component.imageKey}:`, e.message);
    }
  }
  console.log("✅ All pristine high-res placeholders successfully drawn!");
}

run();
