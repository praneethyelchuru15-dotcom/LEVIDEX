const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// 1. Point the script to the private master key you downloaded earlier
let serviceAccount;
try {
  serviceAccount = require('./serviceAccountKey.json');
} catch (e) {
  console.error("❌ ERROR: You must download your Service Account Key from Firebase and place it in this folder named 'serviceAccountKey.json'!");
  process.exit(1);
}

// Ensure you replace this with the EXACT bucket name from your config
const BUCKET_NAME = "levidex.appspot.com";

// 2. Authenticate as the Master Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: BUCKET_NAME
});

const bucket = admin.storage().bucket();
const UPLOADS_DIR = path.join(__dirname, 'uploads');
const OUTPUT_FILE = path.join(__dirname, 'uploaded_links.json');

async function runStoragePipeline() {
  console.log("🚀 Initializing Storage Pipeline...");
  
  if (!fs.existsSync(UPLOADS_DIR)) { 
    fs.mkdirSync(UPLOADS_DIR); 
    console.error("❌ The 'uploads' folder was missing! I just created it. Please put your images inside and run again!");
    process.exit(1);
  }

  const files = fs.readdirSync(UPLOADS_DIR);
  if (files.length === 0) {
    console.log("⚠️ No images found in the 'uploads' folder! Add your specific Resistor/Component pictures first!");
    process.exit(0);
  }

  console.log(`📂 Found ${files.length} images. Activating master cloud upload sequence...`);
  let generatedLinks = {};

  for (const file of files) {
    const filePath = path.join(UPLOADS_DIR, file);
    
    // Ignore hidden system files like .DS_Store
    if (file.startsWith('.')) continue;

    // We store the images in a clean 'components/' directory on your Firebase Cloud
    const destination = `components/${file}`;
    
    // Generate an unbreakable random token so Android apps can download it directly without logging in
    const token = crypto.randomUUID();
    
    console.log(`\n⏳ Pushing [ ${file} ] to the cloud...`);

    try {
      await bucket.upload(filePath, {
        destination: destination,
        metadata: {
          metadata: { firebaseStorageDownloadTokens: token }
        }
      });

      // Assemble the final global CDN link that will physically work inside your Android app
      const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${BUCKET_NAME}/o/${encodeURIComponent(destination)}?alt=media&token=${token}`;
      
      generatedLinks[file] = publicUrl;
      console.log(`✅ Success! Bound to: ${publicUrl}`);
    } catch (e) {
      console.error(`❌ Epic Failure on ${file}:`, e);
    }
  }

  // Spit out a pristine JSON dictionary containing all of the permanent links!
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(generatedLinks, null, 2));
  console.log(`\n🎉 MASSIVE SUCCESS! All links permanently saved to 'uploaded_links.json'!`);
  console.log(`Open that file, grab your new permanent URLs, and paste them straight into the components_batch.json database file!`);
}

runStoragePipeline();
