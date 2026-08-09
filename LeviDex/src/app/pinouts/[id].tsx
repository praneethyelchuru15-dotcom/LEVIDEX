import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, StatusBar, Platform, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { db } from '../../../services/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

const TYPE_COLORS: Record<string, string> = {
  'power': '#FF3B30',
  'input': '#34C759',
  'output': '#007AFF',
  'analog': '#AF52DE',
  'data': '#FF9500'
};

export default function PinoutDetailScreen() {
  const params = useLocalSearchParams();
  const id = String(params.id);
  const router = useRouter();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPinout = async () => {
      try {
        const docRef = doc(db, 'pinouts', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setData(docSnap.data());
        } else {
          setData(null);
        }
      } catch(e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchPinout();
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={28} color="#007AFF" />
          </TouchableOpacity>
        </View>
        <View style={{flex:1, justifyContent: 'center', alignItems: 'center'}}>
          <ActivityIndicator size="large" color="#AF52DE" />
        </View>
      </SafeAreaView>
    );
  }

  if (!data) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={28} color="#007AFF" />
          </TouchableOpacity>
        </View>
        <Text style={{ textAlign: 'center', marginTop: 50 }}>Pinout data not found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F2F2F7" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={28} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{data.name}</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.infoCard}>
          <MaterialCommunityIcons name={data.icon || "chip"} size={48} color="#AF52DE" />
          <Text style={styles.infoName}>{data.name}</Text>
          <Text style={styles.infoDesc}>{data.fullDesc || data.shortDesc}</Text>
        </View>

        <Text style={styles.sectionTitle}>Pin Configuration</Text>
        
        {data.pins && data.pins.map((pin: any, index: number) => (
          <View key={index} style={styles.pinCard}>
            <View style={[styles.pinBadge, { backgroundColor: TYPE_COLORS[pin.type] || '#8E8E93' }]}>
              <Text style={styles.pinNum}>{pin.num}</Text>
            </View>
            <View style={styles.pinContent}>
              <Text style={styles.pinName}>{pin.name}</Text>
              <Text style={styles.pinDesc}>{pin.desc}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F2F2F7' },
  header: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', 
    paddingHorizontal: 16, paddingTop: Platform.OS === 'android' ? 40 : 10, paddingBottom: 15, 
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E5E5EA' 
  },
  backButton: { padding: 4 },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '700', color: '#1C1C1E' },
  container: { padding: 16 },
  infoCard: { backgroundColor: '#fff', borderRadius: 16, padding: 20, alignItems: 'center', marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  infoName: { fontSize: 22, fontWeight: 'bold', color: '#1C1C1E', marginTop: 12 },
  infoDesc: { fontSize: 15, color: '#8E8E93', marginTop: 4 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1C1C1E', marginBottom: 12, marginLeft: 4 },
  pinCard: { backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 8, flexDirection: 'row', alignItems: 'center' },
  pinBadge: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  pinNum: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  pinContent: { flex: 1 },
  pinName: { fontSize: 16, fontWeight: '700', color: '#1C1C1E', marginBottom: 2 },
  pinDesc: { fontSize: 14, color: '#8E8E93' }
});
