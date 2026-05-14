const admin = require('firebase-admin');

// Authenticate with Service Account
let serviceAccount;
try {
  serviceAccount = require('./serviceAccountKey.json');
} catch (e) {
  console.error("❌ ERROR: serviceAccountKey.json not found!");
  process.exit(1);
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();
const auth = admin.auth();

const ADMIN_EMAIL = 'admin@levidex.com';
const ADMIN_PASSWORD = 'LevidexAdmin123!';

async function createAdmin() {
  console.log(`🚀 Attempting to create Master Admin account for: ${ADMIN_EMAIL}...`);
  
  let userRecord;
  try {
    // Check if user already exists
    userRecord = await auth.getUserByEmail(ADMIN_EMAIL);
    console.log(`User already exists in Firebase Auth. Updating password...`);
    await auth.updateUser(userRecord.uid, { password: ADMIN_PASSWORD });
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      // Create new user
      console.log(`Creating new user in Firebase Auth...`);
      userRecord = await auth.createUser({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        emailVerified: true,
      });
    } else {
      console.error("Error with Firebase Auth:", error);
      process.exit(1);
    }
  }

  console.log(`✅ Firebase Auth Account Ready. UID: ${userRecord.uid}`);

  // Inject into Firestore with explicit admin role
  await db.collection('users').doc(userRecord.uid).set({
    email: ADMIN_EMAIL,
    role: 'admin',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    name: 'Master Admin'
  }, { merge: true });

  console.log(`✅ Firestore User Document updated with role: 'admin'!`);
  console.log(`\n=========================================`);
  console.log(`🎉 ADMIN ACCOUNT CREATED SUCCESSFULLY!`);
  console.log(`Email: ${ADMIN_EMAIL}`);
  console.log(`Password: ${ADMIN_PASSWORD}`);
  console.log(`=========================================\n`);
}

createAdmin();
