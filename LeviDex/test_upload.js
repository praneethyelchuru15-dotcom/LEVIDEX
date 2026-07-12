import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadString, getDownloadURL } from "firebase/storage";
import { getAuth, signInAnonymously } from "firebase/auth";
import fs from "fs";

const firebaseConfig = {
    apiKey: "AIzaSyAdqSjaT9bqFfLTo5jEuA5ILVGAzJHFkZ8",
    authDomain: "levidex.firebaseapp.com",
    projectId: "levidex",
    storageBucket: "levidex.firebasestorage.app",
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const auth = getAuth(app);

async function testUpload() {
    try {
        console.log("Signing in anonymously...");
        await signInAnonymously(auth);
        console.log("Signed in. Uploading...");
        const storageRef = ref(storage, 'test/hello.txt');
        await uploadString(storageRef, 'Hello World!');
        const url = await getDownloadURL(storageRef);
        console.log("SUCCESS! URL:", url);
        process.exit(0);
    } catch (e) {
        console.error("FAIL:", e.message);
        process.exit(1);
    }
}

testUpload();
