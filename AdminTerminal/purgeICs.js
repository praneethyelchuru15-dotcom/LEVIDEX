const admin = require('firebase-admin');
let serviceAccount;
try { 
  serviceAccount = require('./serviceAccountKey.json'); 
} catch(e) { 
  console.error("Missing serviceAccountKey.json");
  process.exit(1); 
}

if (!admin.apps.length) {
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}
const db = admin.firestore();

async function purge() {
  console.log("🧹 Purging all components in the 'ics' category...");
  const snapshot = await db.collection('components').where('categoryId', '==', 'ics').get();
  
  if (snapshot.empty) {
      console.log("No IC components found to delete.");
      return;
  }

  const batch = db.batch();
  snapshot.docs.forEach(doc => {
    batch.delete(doc.ref);
  });
  
  await batch.commit();
  console.log(`✅ Safely erased ${snapshot.size} Integrated Circuits components.`);
}

purge().then(() => process.exit(0)).catch(console.error);
