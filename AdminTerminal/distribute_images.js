const fs = require('fs');
const path = require('path');

const UPLOADS_DIR = path.join(__dirname, 'uploads');
const DASHBOARD_IMG_DIR = path.join(__dirname, '../AdminDashboard/images/components');
const APP_IMG_DIR = path.join(__dirname, '../ElectroGuide/assets/images/components');

// Ensure directories exist
if (!fs.existsSync(DASHBOARD_IMG_DIR)) {
  fs.mkdirSync(DASHBOARD_IMG_DIR, { recursive: true });
}
if (!fs.existsSync(APP_IMG_DIR)) {
  fs.mkdirSync(APP_IMG_DIR, { recursive: true });
}

// Copy files
const files = fs.readdirSync(UPLOADS_DIR);
let count = 0;

for (const file of files) {
  if (file.endsWith('.png')) {
    const sourcePath = path.join(UPLOADS_DIR, file);
    
    // Copy to Dashboard
    fs.copyFileSync(sourcePath, path.join(DASHBOARD_IMG_DIR, file));
    
    // Copy to App
    fs.copyFileSync(sourcePath, path.join(APP_IMG_DIR, file));
    
    count++;
  }
}

console.log(`Successfully distributed ${count} images to AdminDashboard and ElectroGuide!`);
