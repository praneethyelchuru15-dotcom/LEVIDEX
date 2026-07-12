import { initializeApp } from "firebase/app";
// @ts-ignore - getReactNativePersistence exists at runtime in Firebase v11+
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Firebase Project Configuration (Levidex)
const firebaseConfig = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "AIzaSyAAfn2GwHqQ3qjF6uc-nlC6aif_N0iDAlE",
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "levidex-58e82.firebaseapp.com",
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "levidex-58e82",
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "levidex-58e82.firebasestorage.app",
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "1059175319880",
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "1:1059175319880:web:313a57383963cdb8128b7d",
    measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-PH9LPYCHED"
};

const app = initializeApp(firebaseConfig);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };

