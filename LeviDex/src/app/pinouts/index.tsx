import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, FlatList, StatusBar, Platform, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { db } from '../../../services/firebaseConfig';
import { collection, getDocs } from 'firebase/firestore';

export default function PinoutsHubScreen() {
  const router = useRouter();
  const [pinouts, setPinouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPinouts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'pinouts'));
        const list = querySnapshot.docs.map(doc => doc.data());
        list.sort((a, b) => a.name.localeCompare(b.name));
        setPinouts(list);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchPinouts();
  }, []);

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => router.push(`/pinouts/${item.id}` as any)}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons name={(item.icon as any) || 'chip'} size={36} color="#AF52DE" />
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemDescription}>{item.shortDesc}</Text>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={24} color="#C7C7CC" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F2F2F7" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={28} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pinout Reference</Text>
        <View style={{ width: 28 }} />
      </View>

      {loading ? (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <ActivityIndicator size="large" color="#AF52DE" />
        </View>
      ) : (
        <FlatList
          data={pinouts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={renderItem}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F2F2F7' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 16, 
    paddingTop: Platform.OS === 'android' ? 40 : 10, 
    paddingBottom: 15, 
    backgroundColor: '#fff', 
    borderBottomWidth: 1, 
    borderBottomColor: '#E5E5EA' 
  },
  backButton: { padding: 4 },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '700', color: '#1C1C1E' },
  list: { padding: 16 },
  card: { 
    backgroundColor: '#fff', 
    borderRadius: 16, 
    marginBottom: 16, 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 16, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.05, 
    shadowRadius: 5, 
    elevation: 2 
  },
  iconContainer: { 
    width: 60, 
    height: 60, 
    borderRadius: 12, 
    backgroundColor: '#F8F0FF', 
    justifyContent: 'center', 
    alignItems: 'center',
    marginRight: 16
  },
  cardContent: { flex: 1 },
  itemName: { fontSize: 17, fontWeight: '600', color: '#1C1C1E', marginBottom: 4 },
  itemDescription: { fontSize: 14, color: '#8E8E93' },
});
