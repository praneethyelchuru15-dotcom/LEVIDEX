const admin = require('firebase-admin');

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

async function fixDatabase() {
  const batch = db.batch();
  let deleteCount = 0;
  let updateCount = 0;

  const componentsRef = db.collection('components');

  // 1. Delete Diodes
  const diodesSnapshot = await componentsRef.where('categoryId', '==', 'Diodes').get();
  diodesSnapshot.forEach(doc => {
    batch.delete(doc.ref);
    deleteCount++;
  });

  // 2. Delete LEDs
  const ledsSnapshot = await componentsRef.where('categoryId', '==', 'LEDs').get();
  ledsSnapshot.forEach(doc => {
    batch.delete(doc.ref);
    deleteCount++;
  });

  // 3. Fix Transistors case
  const transistorsSnapshot = await componentsRef.where('categoryId', '==', 'Transistors').get();
  transistorsSnapshot.forEach(doc => {
    batch.update(doc.ref, { categoryId: 'transistors' });
    updateCount++;
  });

  // 4. Fix Capacitors case
  const capacitorsSnapshot = await componentsRef.where('categoryId', '==', 'Capacitors').get();
  capacitorsSnapshot.forEach(doc => {
    batch.update(doc.ref, { categoryId: 'capacitors' });
    updateCount++;
  });

  await batch.commit();
  console.log(`✅ Cleanup Complete! Deleted ${deleteCount} Diodes/LEDs. Fixed category case for ${updateCount} components.`);
}

fixDatabase();
