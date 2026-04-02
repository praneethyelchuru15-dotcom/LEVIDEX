import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, SafeAreaView, Platform, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { db } from '../../../services/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { ASSET_MAP } from '../../utils/assetMap';

export default function ComponentDetailScreen() {
  const { componentId, categoryId } = useLocalSearchParams<{ componentId: string, categoryId: string }>();
  const router = useRouter();
  const [component, setComponent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    const fetchComponent = async () => {
      try {
        const docSnap = await getDoc(doc(db, "components", componentId));
        if (docSnap.exists()) {
          setComponent({ id: docSnap.id, ...docSnap.data() });
        }
      } catch (e) {
        console.error("Error fetching detail:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchComponent();
  }, [componentId]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
           <ActivityIndicator size="large" color="#007AFF" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={28} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Details</Text>
        <View style={{ width: 28 }} /> 
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {((component.imageKey && ASSET_MAP[component.imageKey]) || component.imageUrl) && !imageFailed && (
          <View style={styles.imageContainer}>
            <Image 
              source={component.imageKey && ASSET_MAP[component.imageKey] ? ASSET_MAP[component.imageKey] : { uri: component.imageUrl }} 
              style={styles.mainImage} 
              resizeMode="contain" 
              onError={() => setImageFailed(true)}
            />
          </View>
        )}

        <View style={styles.cardHeader}>
          <Text style={styles.title}>{component.name}</Text>
          {component.symbol && (
            <View style={styles.symbolBadge}>
              <Text style={styles.symbolText}>Symbol: {component.symbol}</Text>
            </View>
          )}
        </View>

        {(component.booleanFunction || component.highlightValue) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{component.highlightLabel || "Logic Function"}</Text>
            <Text style={[styles.bodyText, { fontSize: 24, fontWeight: 'bold', color: '#007AFF', textAlign: 'center', marginVertical: 10 }]}>
              {component.highlightValue || component.booleanFunction}
            </Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.bodyText}>{component.description}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Identification Strategy</Text>
          <View style={styles.infoBox}>
            <MaterialCommunityIcons name="magnify" size={24} color="#5856D6" style={{ marginRight: 10 }} />
            <Text style={styles.infoText}>Visual identification algorithms or color code charts will be displayed here for students to match.</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Common Use Cases</Text>
          <Text style={styles.bodyText}>• Circuit protection & voltage division</Text>
          <Text style={styles.bodyText}>• Signal smoothing</Text>
          <Text style={styles.bodyText}>• Timing networks (with capacitors)</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 40 : 10,
    paddingBottom: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  imageContainer: {
    backgroundColor: '#fff',
    width: '100%',
    height: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: 20,
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  cardHeader: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1C1C1E',
    flex: 1,
    flexWrap: 'wrap',
  },
  symbolBadge: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginLeft: 10,
  },
  symbolText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  section: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1C1C1E',
    marginBottom: 12,
  },
  bodyText: {
    fontSize: 16,
    color: '#4A4A4C',
    lineHeight: 24,
    marginBottom: 6,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#F2F2F7',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  infoText: {
    flex: 1,
    fontSize: 15,
    color: '#5856D6',
    fontWeight: '500',
    lineHeight: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 20,
    color: '#FF3B30',
    marginBottom: 20,
  },
  backBtn: {
    padding: 10,
  }
});
