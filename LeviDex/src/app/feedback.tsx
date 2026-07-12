import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, SafeAreaView, Image, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { auth, db, storage } from '../../services/firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

export default function FeedbackScreen() {
  const router = useRouter();
  const user = auth.currentUser;
  
  const [suggestion, setSuggestion] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const submitFeedback = async () => {
    if (!suggestion.trim() && !imageUri) {
      Alert.alert('Empty', 'Please enter a suggestion or attach an image.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // 1. Get Location (if permitted)
      let location = null;
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        location = await Location.getCurrentPositionAsync({});
      }

      // 2. Upload image if exists
      let downloadURL = '';
      if (imageUri) {
        const response = await fetch(imageUri);
        const blob = await response.blob();
        
        const filename = `feedback_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
        const storageRef = ref(storage, `feedback_images/${filename}`);
        
        await uploadBytesResumable(storageRef, blob);
        downloadURL = await getDownloadURL(storageRef);
      }
      
      // 3. Save to firestore
      await addDoc(collection(db, 'suggestions'), {
        userId: user?.uid || 'anonymous',
        userEmail: user?.email || 'anonymous',
        suggestion: suggestion.trim(),
        imageUrl: downloadURL,
        latitude: location?.coords.latitude || null,
        longitude: location?.coords.longitude || null,
        status: 'pending',
        timestamp: serverTimestamp(),
      });
      
      Alert.alert('Thank You!', 'Your feedback has been submitted successfully.', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      Alert.alert('Error', 'Could not submit your feedback. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} disabled={isSubmitting}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#1C1C1E" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Send Feedback</Text>
          <TouchableOpacity 
            onPress={submitFeedback} 
            disabled={isSubmitting || (!suggestion.trim() && !imageUri)}
            style={[styles.submitBtn, (!suggestion.trim() && !imageUri) && { opacity: 0.5 }]}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <MaterialCommunityIcons name="send" size={20} color="#fff" />
            )}
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.label}>Tell us how we can improve or report an issue:</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Type your suggestion here..."
              placeholderTextColor="#8E8E93"
              multiline
              textAlignVertical="top"
              value={suggestion}
              onChangeText={setSuggestion}
              editable={!isSubmitting}
            />
          </View>

          <Text style={styles.label}>Attach an Image (Optional):</Text>
          {imageUri ? (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: imageUri }} style={styles.imagePreview} />
              <TouchableOpacity style={styles.removeImageBtn} onPress={() => setImageUri(null)} disabled={isSubmitting}>
                <MaterialCommunityIcons name="close-circle" size={24} color="#FF3B30" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.attachBtn} onPress={pickImage} disabled={isSubmitting}>
              <MaterialCommunityIcons name="camera-plus" size={32} color="#007AFF" />
              <Text style={styles.attachText}>Select Image from Gallery</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F7' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 20, paddingBottom: 15
  },
  backBtn: { padding: 8, backgroundColor: '#fff', borderRadius: 20, elevation: 2 },
  submitBtn: { padding: 10, backgroundColor: '#007AFF', borderRadius: 20, elevation: 2, width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#1C1C1E' },
  scrollContent: { padding: 20 },
  label: { fontSize: 16, fontWeight: '600', color: '#1C1C1E', marginBottom: 12, marginTop: 10 },
  inputContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    minHeight: 150,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
    marginBottom: 20
  },
  textInput: { flex: 1, fontSize: 16, color: '#1C1C1E', minHeight: 120 },
  attachBtn: {
    backgroundColor: '#fff',
    borderRadius: 12,
    height: 120,
    borderWidth: 2,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  attachText: { fontSize: 16, color: '#007AFF', marginTop: 8, fontWeight: '500' },
  imagePreviewContainer: { position: 'relative', borderRadius: 12, overflow: 'hidden', height: 200 },
  imagePreview: { width: '100%', height: '100%', resizeMode: 'cover' },
  removeImageBtn: { position: 'absolute', top: 10, right: 10, backgroundColor: '#fff', borderRadius: 15 }
});
