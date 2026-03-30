import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../services/firebaseConfig';

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    // Listen for Firebase login state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // Small timeout to allow the router to mount completely before replacing
      setTimeout(() => {
        if (user) {
          router.replace('/home');
        } else {
          router.replace('/login');
        }
      }, 100);
    });
    return unsubscribe;
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fcfcfc' }}>
      <ActivityIndicator size="large" color="#007AFF" />
    </View>
  );
}
