import { initializeApp } from "firebase/app";
// @ts-ignore - getReactNativePersistence exists at runtime in Firebase v11+
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Firebase Project Configuration (Levidex)
const firebaseConfig = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "AIzaSyAdqSjaT9bqFfLTo5jEuA5ILVGAzJHFkZ8",
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "levidex.firebaseapp.com",
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "levidex",
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "levidex.firebasestorage.app",
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "1030103160013",
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "1:1030103160013:web:2641d5aa76234822d18584",
    measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-MZCCQMQ3E5"
};

const app = initializeApp(firebaseConfig);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});
const db = getFirestore(app);

export { auth, db };
