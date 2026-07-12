import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView,
  FlatList, TouchableOpacity, ActivityIndicator, StatusBar
} from 'react-native';
import { useRouter } from 'expo-router';
import { db, auth } from '../../services/firebaseConfig';
import { collection, getDocs, doc, onSnapshot } from 'firebase/firestore';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type Component = {
  id: string;
  name: string;
  categoryId: string;
  symbol?: string;
  description?: string;
};

export default function FavoritesScreen() {
  const router = useRouter();
  const [favoritesIds, setFavoritesIds] = useState<string[]>([]);
  const [allComponents, setAllComponents] = useState<Component[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;
    const unsub = onSnapshot(doc(db, "users", auth.currentUser.uid), (docSnap) => {
      if (docSnap.exists()) {
        setFavoritesIds(docSnap.data().favorites || []);
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'components'));
        const data: Component[] = [];
        snapshot.forEach(doc => {
          data.push({ id: doc.id, ...doc.data() } as Component);
        });
        setAllComponents(data);
      } catch (e) {
        console.error('Fetch components error:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const CATEGORY_COLORS: Record<string, string> = {
    resistors: '#FF9500',
    capacitors: '#5856D6',
    diodes: '#FF2D55',
    transistors: '#007AFF',
    ics: '#AF52DE',
    sensors: '#34C759',
    logic: '#FFCC00',
    electromechanical: '#FF3B30',
    power: '#FF9500',
    inductors: '#5AC8FA',
    motors: '#4CD964',
    prototyping: '#FFCC00',
    development: '#5856D6',
    wires: '#8E8E93',
  };

  const renderResult = ({ item }: { item: Component }) => {
    const color = CATEGORY_COLORS[item.categoryId] || '#8E8E93';
    return (
      <TouchableOpacity
        style={styles.resultCard}
        activeOpacity={0.75}
        onPress={() =>
          router.push({ pathname: '/component/[componentId]', params: { componentId: item.id, name: item.name } })
        }
      >
        <View style={[styles.symbolBox, { backgroundColor: color + '22' }]}>
          <MaterialCommunityIcons name="heart" size={20} color={color} />
        </View>
        <View style={styles.resultInfo}>
          <Text style={styles.resultName}>{item.name}</Text>
          <Text style={styles.resultCategory}>{item.categoryId?.toUpperCase()}</Text>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={20} color="#C7C7CC" />
      </TouchableOpacity>
    );
  };

  const filteredFavorites = allComponents.filter(c => favoritesIds.includes(c.id));

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F2F2F7" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={28} color="#1C1C1E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Favorites</Text>
        <View style={{ width: 28 }} />
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} size="large" color="#FF2D55" />
      ) : filteredFavorites.length === 0 ? (
        <View style={styles.center}>
          <MaterialCommunityIcons name="heart-broken" size={60} color="#E5E5EA" />
          <Text style={styles.emptyTitle}>No Favorites Yet</Text>
          <Text style={styles.emptySubtitle}>Tap the heart icon on any component page to save it here for quick access.</Text>
        </View>
      ) : (
        <FlatList
          data={filteredFavorites}
          keyExtractor={item => item.id}
          renderItem={renderResult}
          contentContainerStyle={styles.resultsList}
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
    paddingTop: 12,
    paddingBottom: 12,
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#1C1C1E', letterSpacing: -0.5 },
  resultsList: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24 },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    elevation: 1,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4,
  },
  symbolBox: {
    width: 46, height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  resultInfo: { flex: 1 },
  resultName: { fontSize: 15, fontWeight: '700', color: '#1C1C1E', marginBottom: 2 },
  resultCategory: { fontSize: 11, fontWeight: '600', color: '#8E8E93', letterSpacing: 0.5 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingBottom: 100,
  },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#1C1C1E', marginTop: 16, textAlign: 'center' },
  emptySubtitle: { fontSize: 14, color: '#8E8E93', marginTop: 6, textAlign: 'center', lineHeight: 20 },
});
