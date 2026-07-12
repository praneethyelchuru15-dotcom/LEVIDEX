const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const serviceAccount = require('../AdminTerminal/serviceAccountKey.json');

// Initialize Firebase Admin with the service account key
initializeApp({
  credential: cert(serviceAccount),
  projectId: 'levidex'
});

const db = getFirestore();

async function getComponents() {
  try {
    const snapshot = await db.collection('components').get();
    const missing = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      const key = data.imageKey || '';

      if (
        !key || 
        key === 'default_component_image_key' || 
        key === 'placeholder' || 
        key === 'default' || 
        key.includes('default') || 
        key.includes('placeholder') || 
        key.trim() === ''
      ) {
        missing.push({
          id: doc.id,
          name: data.name
        });
      }
    });

    console.log(JSON.stringify(missing));
  } catch (error) {
    console.error("Error fetching components:", error);
    process.exit(1);
  }
}

getComponents();
