import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, SafeAreaView, Platform, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { db, auth } from '../../../services/firebaseConfig';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, onSnapshot } from 'firebase/firestore';
import * as WebBrowser from 'expo-web-browser';
import { ASSET_MAP } from '../../utils/assetMap';

export default function ComponentDetailScreen() {
  const { componentId, categoryId } = useLocalSearchParams<{ componentId: string, categoryId: string }>();
  const router = useRouter();
  const [component, setComponent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [imageFailed, setImageFailed] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (!auth.currentUser) return;
    const unsub = onSnapshot(doc(db, "users", auth.currentUser.uid), (docSnap) => {
      if (docSnap.exists()) {
        const favs = docSnap.data().favorites || [];
        setIsFavorite(favs.includes(componentId));
      }
    });
    return () => unsub();
  }, [componentId]);

  const toggleFavorite = async () => {
    if (!auth.currentUser) return;
    const userRef = doc(db, "users", auth.currentUser.uid);
    try {
      if (isFavorite) {
        await updateDoc(userRef, { favorites: arrayRemove(componentId) });
      } else {
        await updateDoc(userRef, { favorites: arrayUnion(componentId) });
      }
    } catch (e) {
      console.error("Error toggling favorite:", e);
    }
  };

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

  if (!component) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={28} color="#007AFF" />
          </TouchableOpacity>
        </View>
        <View style={styles.errorContainer}>
           <Text style={{color: 'red'}}>Component not found.</Text>
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
        <TouchableOpacity onPress={toggleFavorite} style={styles.backButton}>
          <MaterialCommunityIcons 
            name={isFavorite ? "heart" : "heart-outline"} 
            size={28} 
            color={isFavorite ? "#ff2d55" : "#8E8E93"} 
          />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {(ASSET_MAP[(component.imageKey || component.name.replace(/ /g, '_').replace(/\//g, '_').replace(/-/g, '_').replace(/\(/g, '_').replace(/\)/g, '_') + '.png').toLowerCase()] || component.imageUrl) && !imageFailed && (
          <View style={styles.imageContainer}>
            <Image 
              source={ASSET_MAP[(component.imageKey || component.name.replace(/ /g, '_').replace(/\//g, '_').replace(/-/g, '_').replace(/\(/g, '_').replace(/\)/g, '_') + '.png').toLowerCase()] || { uri: component.imageUrl }} 
              style={styles.mainImage} 
              resizeMode="contain" 
              onError={() => setImageFailed(true)}
            />
          </View>
        )}

        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{component.name}</Text>
            {component.estimatedCost && (
              <View style={styles.costContainer}>
                <MaterialCommunityIcons name="tag-outline" size={16} color="#1A7F37" style={{ marginRight: 4 }} />
                <Text style={styles.costText}>Est. Cost: {component.estimatedCost}</Text>
              </View>
            )}
          </View>
          {(component.symbol || component.polarity !== undefined) && (
            <View style={{flexDirection: 'column', alignItems: 'flex-end'}}>
              {component.symbol && (
                <View style={styles.symbolBadge}>
                  <Text style={styles.symbolText}>Symbol: {component.symbol}</Text>
                </View>
              )}
              {component.polarity !== undefined && (
                <View style={[styles.symbolBadge, { backgroundColor: (component.polarity === true || component.polarity === 'Yes' || component.polarity === 'Polarized') ? '#FF3B30' : '#34C759', marginTop: 8 }]}>
                  <Text style={styles.symbolText}>{(component.polarity === true || component.polarity === 'Yes' || component.polarity === 'Polarized') ? 'Polarized' : 'Non-Polarized'}</Text>
                </View>
              )}
            </View>
          )}
        </View>

        <TouchableOpacity 
          style={styles.datasheetButton} 
          onPress={() => {
            const url = component.datasheetUrl || `https://www.google.com/search?q=${encodeURIComponent(component.name + " datasheet pdf")}`;
            WebBrowser.openBrowserAsync(url);
          }}
        >
          <MaterialCommunityIcons name={component.datasheetUrl ? "file-pdf-box" : "text-search"} size={24} color="#FFF" style={{ marginRight: 8 }} />
          <Text style={styles.datasheetButtonText}>
            {component.datasheetUrl ? "View Datasheet" : "Search Datasheet"}
          </Text>
        </TouchableOpacity>

        {(component.booleanFunction || component.highlightValue) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{component.highlightLabel || "Logic Function"}</Text>
            <Text style={[styles.bodyText, { fontSize: 24, fontWeight: 'bold', color: '#007AFF', textAlign: 'center', marginVertical: 10 }]}>
              {component.highlightValue || component.booleanFunction}
            </Text>
          </View>
        )}

        {/* Dynamic Package Types */}
        {component.packageTypes && component.packageTypes.length > 0 && (
          <View style={styles.section}>
             <Text style={styles.sectionTitle}>Common Package Types</Text>
             <View style={styles.tagsContainer}>
               {component.packageTypes.map((pkg: string, i: number) => (
                 <View key={i} style={styles.tagBadge}>
                   <Text style={styles.tagText}>{pkg}</Text>
                 </View>
               ))}
             </View>
          </View>
        )}

        {/* Alternatives & Equivalents */}
        {component.equivalents && component.equivalents.length > 0 && (
          <View style={styles.section}>
             <Text style={styles.sectionTitle}>Alternatives & Equivalents</Text>
             <View style={styles.tagsContainer}>
               {component.equivalents.map((eq: string, i: number) => (
                 <View key={i} style={[styles.tagBadge, styles.equivBadge]}>
                   <MaterialCommunityIcons name="swap-horizontal" size={14} color="#007AFF" style={{ marginRight: 4 }} />
                   <Text style={[styles.tagText, styles.equivText]}>{eq}</Text>
                 </View>
               ))}
             </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.bodyText}>{component.description}</Text>
        </View>

        {/* Dynamic Specifications Table */}
        {component.specifications && component.specifications.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Key Specifications</Text>
            <View style={styles.specsTable}>
              {component.specifications.map((spec: any, i: number) => (
                <View key={i} style={[styles.specRow, i % 2 === 1 && styles.specRowAlt]}>
                  <Text style={styles.specLabel}>{spec.label}</Text>
                  <Text style={styles.specValue}>{spec.value}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Pinout Breakdown Table */}
        {component.pinout && component.pinout.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pinout Breakdown</Text>
            <View style={styles.pinoutTable}>
              <View style={styles.pinoutHeaderRow}>
                <Text style={[styles.pinoutHeaderLabel, { width: 70 }]}>Pin</Text>
                <Text style={[styles.pinoutHeaderLabel, { width: 100 }]}>Name</Text>
                <Text style={[styles.pinoutHeaderLabel, { flex: 1 }]}>Description</Text>
              </View>
              {component.pinout.map((pin: any, i: number) => (
                <View key={i} style={[styles.pinoutRow, i % 2 === 1 && styles.pinoutRowAlt]}>
                  <Text style={[styles.pinValue, { width: 70, fontWeight: 'bold' }]}>{pin.pin || pin.pinNumber || String(i + 1)}</Text>
                  <Text style={[styles.pinName, { width: 100, fontWeight: '600', color: '#5856D6' }]}>{pin.name || pin.signal}</Text>
                  <Text style={[styles.pinDesc, { flex: 1 }]}>{pin.description}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Dynamic Identification Strategy */}
        {component.identification && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Identification Strategy</Text>
            <View style={styles.infoBox}>
              <MaterialCommunityIcons name="magnify-scan" size={24} color="#5856D6" style={{ marginRight: 10 }} />
              <Text style={styles.infoText}>{component.identification}</Text>
            </View>
          </View>
        )}

        {/* How to Test */}
        {component.howToTest && component.howToTest.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>How to Test</Text>
            <View style={styles.infoBox}>
              <MaterialCommunityIcons name="lightning-bolt" size={24} color="#5856D6" style={{ marginRight: 10, alignSelf: 'flex-start' }} />
              <View style={{ flex: 1 }}>
                {Array.isArray(component.howToTest) ? component.howToTest.map((step: string, i: number) => (
                  <Text key={i} style={[styles.infoText, { marginBottom: 6 }]}><Text style={{fontWeight: 'bold'}}>{i + 1}.</Text> {step}</Text>
                )) : <Text style={styles.infoText}>{component.howToTest}</Text>}
              </View>
            </View>
          </View>
        )}

        {/* Dynamic Applications / Use Cases */}
        {(component.useCases?.length > 0 || component.applications?.length > 0) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Common Applications</Text>
            {(component.useCases || component.applications).map((item: string, i: number) => (
              <View key={i} style={styles.bulletRow}>
                 <View style={styles.bulletPoint} />
                 <Text style={styles.bodyText}>{item}</Text>
               </View>
            ))}
          </View>
        )}

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
  },
  
  // New Styles for Dynamic Details
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagBadge: {
    backgroundColor: '#E5E5EA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  tagText: {
    color: '#1C1C1E',
    fontWeight: '600',
    fontSize: 14,
  },
  specsTable: {
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  specRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  specRowAlt: {
    backgroundColor: '#F9F9FB',
  },
  specLabel: {
    flex: 1,
    fontWeight: '600',
    color: '#4A4A4C',
    fontSize: 14,
  },
  specValue: {
    flex: 1,
    color: '#1C1C1E',
    fontSize: 14,
    textAlign: 'right',
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    paddingRight: 10,
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#007AFF',
    marginTop: 8,
    marginRight: 10,
  },

  // Newly Added Styles
  costContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E2F1E7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  costText: {
    color: '#1A7F37',
    fontWeight: '700',
    fontSize: 13,
  },
  equivBadge: {
    backgroundColor: '#E5F1FF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 8,
  },
  equivText: {
    color: '#007AFF',
  },
  pinoutTable: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  pinoutHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#F2F2F7',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  pinoutHeaderLabel: {
    fontWeight: 'bold',
    color: '#1C1C1E',
    fontSize: 13,
  },
  pinoutRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
    alignItems: 'center',
  },
  pinoutRowAlt: {
    backgroundColor: '#F9F9FB',
  },
  pinValue: {
    fontSize: 14,
    color: '#1C1C1E',
  },
  pinName: {
    fontSize: 14,
  },
  pinDesc: { flex: 1, fontSize: 13, color: '#8E8E93' },
  datasheetButton: {
    backgroundColor: '#FF2D55',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    marginTop: 16,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  datasheetButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  }
});
