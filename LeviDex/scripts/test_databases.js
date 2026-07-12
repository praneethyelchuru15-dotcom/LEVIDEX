const { initializeApp, cert } = require('firebase-admin/app');
const serviceAccount = require('../firebase-admin-key.json');

const app = initializeApp({
  credential: cert(serviceAccount)
});

async function listDatabases() {
  const token = await app.options.credential.getAccessToken();
  console.log("Token acquired, fetching databases...");

  const res = await fetch(`https://firestore.googleapis.com/v1/projects/${serviceAccount.project_id}/databases/(default)`, {
    headers: { Authorization: `Bearer ${token.access_token}` }
  });

  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}

listDatabases().catch(console.error);
