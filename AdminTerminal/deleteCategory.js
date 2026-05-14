const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

async function clearOld() {
  const snapshot = await db.collection('components').where('categoryId', '==', 'logic').get();
  if (snapshot.size === 0) return console.log('No old logic gates found.');
  
  const batch = db.batch();
  snapshot.docs.forEach((doc) => batch.delete(doc.ref));
  await batch.commit();
  console.log(`Cleaned up ${snapshot.size} outdated logic gate documents to prevent duplicates!`);
}
clearOld();
