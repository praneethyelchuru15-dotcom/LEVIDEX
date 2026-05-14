const admin = require('firebase-admin');
let serviceAccount;
try { serviceAccount = require('./serviceAccountKey.json'); } catch(e) { process.exit(1); }
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

async function purge() {
  console.log("🧹 Purging legacy [sensors] category prior to massive payload swap...");
  const snapshot = await db.collection('components').where('categoryId', '==', 'sensors').get();
  const batch = db.batch();
  snapshot.docs.forEach(doc => {
    batch.delete(doc.ref);
  });
  await batch.commit();
  console.log(`✅ Safely erased ${snapshot.size} legacy sensors.`);
}
purge();
