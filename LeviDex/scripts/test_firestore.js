const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

const serviceAccount = require('../firebase-admin-key.json');
initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore('default');

async function test() {
    console.log("Testing Firestore Connection...");
    try {
        const snapshot = await db.collection('components').limit(1).get();
        console.log("SUCCESS! Found " + snapshot.size + " docs");
        snapshot.forEach(doc => console.log(doc.id, '=>', doc.data()));
    } catch (e) {
        console.error("FAIL:", e);
    }
}

test();
