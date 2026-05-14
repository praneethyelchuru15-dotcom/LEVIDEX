const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const newRules = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.time < timestamp.date(2027, 5, 13);
    }
  }
}`;

async function updateRules() {
  try {
    const ruleset = await admin.securityRules().releaseFirestoreRulesetFromSource(newRules);
    console.log('Successfully released new Firestore rules! Expiration extended to May 13, 2027.', ruleset.name);
  } catch (error) {
    console.error('Error updating rules:', error);
  }
}

updateRules();
