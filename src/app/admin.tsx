import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { db } from '../../services/firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';

export default function AdminScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    categoryId: 'resistors',
    imageUrl: '',
    symbol: ''
  });

  const CATEGORIES = [
    { id: 'resistors', label: 'Resistors' }, { id: 'capacitors', label: 'Capacitors' },
    { id: 'diodes', label: 'Diodes' }, { id: 'transistors', label: 'Transistors' },
    { id: 'ics', label: 'Integrated Circuits' }, { id: 'sensors', label: 'Sensors' },
    { id: 'logic', label: 'Logic Gates' }
  ];

  const handleUpload = async () => {
    if (!form.name || !form.description) {
      Alert.alert("Error", "Name and Description are required!");
      return;
    }
    setLoading(true);
    try {
      await addDoc(collection(db, "components"), {
        ...form,
        createdAt: new Date()
      });
      Alert.alert("Success", "New Component Published Globally!");
      setForm({ name: '', description: '', categoryId: 'resistors', imageUrl: '', symbol: '' });
    } catch (e: any) {
      Alert.alert("Upload Error", e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={28} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Admin Publisher</Text>
        <View style={{ width: 28 }} /> 
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.banner}>
          <MaterialCommunityIcons name="cloud-upload" size={40} color="#fff" />
          <Text style={styles.bannerText}>Live Updates</Text>
          <Text style={styles.bannerSub}>Publish new components directly to all student apps.</Text>
        </View>

        <Text style={styles.label}>Select Category</Text>
        <View style={styles.categoryGrid}>
          {CATEGORIES.map(c => (
            <TouchableOpacity 
              key={c.id} 
              style={[styles.catBtn, form.categoryId === c.id && styles.catBtnSelected]}
              onPress={() => setForm({ ...form, categoryId: c.id })}
            >
              <Text style={[styles.catText, form.categoryId === c.id && styles.catTextSelected]}>{c.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Component Name</Text>
        <TextInput style={styles.input} value={form.name} onChangeText={(t) => setForm({ ...form, name: t })} placeholder="e.g. Standard Diode 1N4007" />

        <Text style={styles.label}>Symbol</Text>
        <TextInput style={styles.input} value={form.symbol} onChangeText={(t) => setForm({ ...form, symbol: t })} placeholder="e.g. D" />

        <Text style={styles.label}>Image URL (.jpg / .png)</Text>
        <TextInput style={styles.input} value={form.imageUrl} onChangeText={(t) => setForm({ ...form, imageUrl: t })} placeholder="Paste web image link here" />

        <Text style={styles.label}>Educational Description</Text>
        <TextInput 
          style={[styles.input, { height: 100, textAlignVertical: 'top' }]} 
          value={form.description} 
          multiline 
          onChangeText={(t) => setForm({ ...form, description: t })} 
          placeholder="Explain the function of this component here..." 
        />

        <TouchableOpacity style={styles.publishBtn} onPress={handleUpload} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.publishText}>Publish Over-The-Air</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F2F2F7'},
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 10, paddingBottom: 15, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E5E5EA'},
  backButton: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#1C1C1E' },
  container: { padding: 20 },
  banner: { backgroundColor: '#5856D6', borderRadius: 16, padding: 24, alignItems: 'center', marginBottom: 24, shadowColor: '#5856D6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
  bannerText: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginTop: 10 },
  bannerSub: { color: 'rgba(255,255,255,0.8)', textAlign: 'center', marginTop: 8 },
  label: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 8, marginTop: 16 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ccc', borderRadius: 10, padding: 14, fontSize: 16 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  catBtn: { backgroundColor: '#E5E5EA', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20 },
  catBtnSelected: { backgroundColor: '#007AFF' },
  catText: { color: '#333', fontWeight: '500' },
  catTextSelected: { color: '#fff', fontWeight: 'bold' },
  publishBtn: { backgroundColor: '#34C759', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 30, shadowColor: '#34C759', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  publishText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});
