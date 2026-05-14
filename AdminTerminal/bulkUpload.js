const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// 1. Point the script to the private master key you downloaded
let serviceAccount;
try {
  serviceAccount = require('./serviceAccountKey.json');
} catch (e) {
  console.error("❌ ERROR: You must download your Service Account Key from Firebase and place it in this folder named 'serviceAccountKey.json'!");
  process.exit(1);
}

// 2. Authenticate as the Master Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// 3. Define the main bulk upload pipeline
async function runBulkUpload() {
  console.log("🚀 Starting Bulk Upload to Firebase...");
  
  // Read the JSON file
  const filePath = path.join(__dirname, 'components_batch.json');
  let componentsData = [];
  try {
    const rawData = fs.readFileSync(filePath, 'utf8');
    componentsData = JSON.parse(rawData);
  } catch (e) {
    console.error("❌ ERROR: Could not read 'components_batch.json'. Is the file corrupted or missing?");
    process.exit(1);
  }

  if (componentsData.length === 0) {
    console.log("⚠️ No components found in the JSON file.");
    process.exit(0);
  }

  // Use a Firestore Batch to write all documents at once
  const batch = db.batch();
  let addedCount = 0;

  componentsData.forEach((component) => {
    // We add it to the 'components' collection, letting Firebase auto-generate a unique document ID
    const newDocRef = db.collection('components').doc();
    
    // Mix in the created timestamp similar to what the mobile admin panel does
    const uploadData = {
        ...component,
        createdAt: new Date().toISOString()
    };
    
    batch.set(newDocRef, uploadData);
    addedCount++;
    console.log(`📦 Queued: ${component.name} (${component.category})`);
  });

  // Execute the massive write operation
  try {
    await batch.commit();
    console.log(`\n✅ SUCCESS! ${addedCount} total components were successfully pushed to your live Levidex database!`);
    console.log(`Those components are now permanently available in your Android App.`);
  } catch (err) {
    console.error("❌ FAILED to write to database:", err);
  }
}

// Fire the engines
runBulkUpload();
