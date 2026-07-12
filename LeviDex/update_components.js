const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const serviceAccount = require('../AdminTerminal/serviceAccountKey.json');

initializeApp({
  credential: cert(serviceAccount),
  projectId: 'levidex'
});

const db = getFirestore();

const updates = [
  { name: 'Flyback Transformer', imageKey: 'flyback_transformer' },
  { name: 'AVR Development Board', imageKey: 'avr_development_board' },
  { name: 'Pulse Transformer', imageKey: 'pulse_transformer' },
  { name: 'Magnetic Module', imageKey: 'magnetic_module' },
  { name: 'Logic Development Board', imageKey: 'logic_development_board' }
];

async function updateDB() {
  const batch = db.batch();
  for (const item of updates) {
    const snapshot = await db.collection('components').where('name', '==', item.name).get();
    snapshot.forEach(doc => {
      batch.update(doc.ref, {
        imageKey: item.imageKey,
        imageUrl: `/assets/images/${item.imageKey}.png`
      });
    });
  }
  await batch.commit();
  console.log("Updated 5 components successfully.");
}

updateDB().catch(console.error);
