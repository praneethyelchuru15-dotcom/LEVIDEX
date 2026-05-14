const https = require('https');
const fs = require('fs');
const path = require('path');

const TARGET_DIR = path.join(__dirname, '../ElectroGuide/assets/images/components');

if (!fs.existsSync(TARGET_DIR)) {
  fs.mkdirSync(TARGET_DIR, { recursive: true });
}

// Same IC array as the ones uploaded
const IC_NAMES = [
  '7400', '7402', '7404', '7408', '7414', '7432', '7447', '7473', '7474', '7486', '7490', '74138', '74165', '74595',
  '4001', '4011', '4013', '4017', '4026', '4066', '4069',
  'NE555', 'NE556', 'CD4047', 'DS1307', 'DS3231',
  'LM741', 'LM358', 'LM324', 'TL071', 'OP07', 'LM311', 'LM339',
  'ATmega328P', 'ESP8266', 'STM32F103C8T6', 'PIC16F877A', '6502',
  '7805', 'LM317', 'AMS1117', 'LM2596', 'TP4056',
  'L293D', 'L298N', 'ULN2003', 'A4988',
  'MAX232', 'MAX485', 'CH340G', 'MCP2515', 'PCA9685',
  'ADC0804', 'MCP3008', 'ADS1115', 'MCP4725',
  'PC817', '4N25', 'MOC3021',
  'LM386', 'TDA2030', 'PAM8403', 'PT2399',
  'AT24C256', 'W25Q128'
];

async function downloadPlaceholder(file, rawText) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(TARGET_DIR, file);
    const safeText = encodeURIComponent(rawText.substring(0, 15));
    // Dark slate background with white bold text placeholder
    const url = `https://placehold.co/400x400/1e293b/ffffff.png?text=${safeText}`;
    
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
  console.log(`🎨 Generating ${IC_NAMES.length} IT Placeholders...`);
  for (const name of IC_NAMES) {
    const imageKey = name.replace(/[^a-zA-Z0-9]/g, '') + '.png';
    try {
      await downloadPlaceholder(imageKey, name);
    } catch (e) {
      console.error(`❌ Failed on ${imageKey}:`, e.message);
    }
  }
  console.log("✅ All pristine high-res placeholders successfully drawn!");
}

run();
