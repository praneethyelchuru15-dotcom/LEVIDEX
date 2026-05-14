const fs = require('fs');
const path = require('path');

const ARTIFACTS_DIR = 'C:\\Users\\prane\\.gemini\\antigravity\\brain\\07be8adb-0f79-4638-9b46-8ab8400ab4e0';
const UPLOADS_DIR = path.join(__dirname, 'uploads');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR);
}

// Using the single Ceramic Disc image we successfully generated before the quota hit
const TEMP_BASE_IMAGE = 'cap_ceramic_disc_1778693074855.png';
const sourcePath = path.join(ARTIFACTS_DIR, TEMP_BASE_IMAGE);

const filenames = JSON.parse(fs.readFileSync('./capacitor_filenames.json', 'utf-8'));

let count = 0;
for (const filename of filenames) {
  const destPath = path.join(UPLOADS_DIR, filename);
  
  if (fs.existsSync(sourcePath)) {
    fs.copyFileSync(sourcePath, destPath);
    count++;
  } else {
    console.error('Source not found:', sourcePath);
  }
}

console.log(`Successfully mapped the temporary base image to ${count} new capacitor files in uploads/.`);
