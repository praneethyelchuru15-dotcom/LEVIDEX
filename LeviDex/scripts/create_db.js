const { initializeApp, cert } = require('firebase-admin/app');
const serviceAccount = require('../firebase-admin-key.json');

const app = initializeApp({
  credential: cert(serviceAccount)
});

async function createDatabase() {
  const token = await app.options.credential.getAccessToken();
  console.log("Token acquired, creating database...");

  const res = await fetch(`https://firestore.googleapis.com/v1/projects/${serviceAccount.project_id}/databases?databaseId=levidex-db`, {
    method: 'POST',
    headers: { 
        'Authorization': `Bearer ${token.access_token}`,
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        locationId: 'nam5',
        type: 'FIRESTORE_NATIVE'
    })
  });

  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}

createDatabase().catch(console.error);
