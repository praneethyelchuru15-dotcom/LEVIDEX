const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getStorage } = require('firebase-admin/storage');
const fs = require('fs');
const path = require('path');

// Initialize Firebase with the new project credentials
const serviceAccount = require('../firebase-admin-key.json');
initializeApp({
  credential: cert(serviceAccount),
  storageBucket: 'levidex-58e82.firebasestorage.app'
});

const db = getFirestore();
const bucket = getStorage().bucket();

const imagesDir = path.join(__dirname, '../assets/images');
const componentsFile = path.join(__dirname, '../../AdminTerminal/all_components.json');

async function migrate() {
    console.log("Starting Migration to new Firebase Project (levidex-58e82)...");

    // 1. Load the database dump
    if (!fs.existsSync(componentsFile)) {
        console.error("Could not find all_components.json!");
        return;
    }
    const components = JSON.parse(fs.readFileSync(componentsFile, 'utf8'));
    console.log(`Loaded ${components.length} components from database dump.`);

    let successCount = 0;
    
    for (let i = 0; i < components.length; i++) {
        const comp = components[i];
        
        // Skip components that were already processed (if script fails and restarts)
        // Wait, since we are doing this fresh, we process all of them.
        
        let imageFileName = comp.imageKey || `${comp.name.replace(/ /g, '_').replace(/\//g, '_').replace(/-/g, '_').replace(/\(/g, '_').replace(/\)/g, '_')}.png`;
        if (!imageFileName.endsWith('.png')) imageFileName += '.png';
        const localImagePath1 = path.join(imagesDir, imageFileName);
        const localImagePath2 = path.join(__dirname, '../../AdminTerminal/uploads', imageFileName);
        
        let targetImagePath = null;
        if (fs.existsSync(localImagePath1)) {
            targetImagePath = localImagePath1;
        } else if (fs.existsSync(localImagePath2)) {
            targetImagePath = localImagePath2;
        }
        
        let publicUrl = comp.imageUrl; // Default to existing if there is one

        // If the local image exists, upload it
        if (targetImagePath) {
            const destinationPath = `components/${imageFileName}`;
            const file = bucket.file(destinationPath);
            
            // Check if it already exists in storage to save time
            const [exists] = await file.exists();
            if (!exists) {
                try {
                    await bucket.upload(targetImagePath, {
                        destination: destinationPath,
                        metadata: {
                            contentType: 'image/png'
                        }
                    });
                    console.log(`[${i+1}/${components.length}] Uploaded image: ${imageFileName}`);
                } catch (e) {
                    console.error(`Failed to upload ${imageFileName}:`, e);
                }
            } else {
                 console.log(`[${i+1}/${components.length}] Image already exists in cloud: ${imageFileName}`);
            }

            // Make the file publicly accessible
            try {
                await file.makePublic();
            } catch(e) {}
            
            // Generate the Firebase Storage Download URL format
            publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/components%2F${encodeURIComponent(imageFileName)}?alt=media`;
        } else {
            console.log(`[${i+1}/${components.length}] No local image found for: ${comp.name}`);
            publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/components%2F${encodeURIComponent(imageFileName)}?alt=media`;
        }

        // Upload component to Firestore
        try {
            // Keep the original Firestore Document ID if it has one, otherwise create a new one
            const docRef = comp.id ? db.collection('components').doc(comp.id) : db.collection('components').doc();
            
            // Copy data and inject the new imageUrl
            const dataToSave = { ...comp, imageUrl: publicUrl || null };
            
            // Remove the ID from the payload itself if it was injected by the dump
            delete dataToSave.id;

            await docRef.set(dataToSave);
            successCount++;
        } catch (e) {
            console.error(`Failed to save component ${comp.name} to Firestore:`, e);
        }
    }

    console.log(`Migration Complete! Successfully uploaded ${successCount}/${components.length} components to Firestore.`);
}

migrate().catch(console.error);
