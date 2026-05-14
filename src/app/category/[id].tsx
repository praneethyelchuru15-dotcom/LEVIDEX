import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, SafeAreaView, Platform, ActivityIndicator, TextInput, KeyboardAvoidingView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { db } from '../../../services/firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { ASSET_MAP } from '../../utils/assetMap';

const IC_SUBCATEGORIES = [
  { id: '7400-series', name: 'The 7400 Series', desc: 'TTL Logic Gates', icon: 'memory' },
  { id: '4000-series', name: 'The 4000 Series', desc: 'CMOS Logic', icon: 'memory' },
  { id: 'timers-rtc', name: 'Timers & RTC', desc: 'Real-Time Clocks & 555 Timers', icon: 'clock-outline' },
  { id: 'op-amps', name: 'Op-Amps & Comparators', desc: 'Operational Amplifiers', icon: 'sine-wave' },
  { id: 'microcontrollers', name: 'Microcontrollers & Microprocessors', desc: 'MCU / MPU', icon: 'cpu-64-bit' },
  { id: 'power-management', name: 'Power Management', desc: 'Voltage Regulators', icon: 'lightning-bolt' },
  { id: 'motor-relay', name: 'Motor & Relay Drivers', desc: 'Hardware Drivers', icon: 'engine' },
  { id: 'communications', name: 'Communication & Interface', desc: 'Serial, USB, I2C, SPI', icon: 'serial-port' },
  { id: 'data-converters', name: 'Data Converters', desc: 'ADC / DAC', icon: 'chart-bell-curve' },
  { id: 'optocouplers', name: 'Optocouplers & Isolators', desc: 'Electrical isolation', icon: 'led-outline' },
  { id: 'audio-ics', name: 'Audio ICs', desc: 'Audio amplifiers', icon: 'speaker' },
  { id: 'memory-ics', name: 'Memory ICs', desc: 'EEPROM, Flash, etc.', icon: 'database' },
];

export default function CategoryListScreen() {
  const { id, name } = useLocalSearchParams<{ id: string, name: string }>();
  const router = useRouter();
  const [componentList, setComponentList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Specific state for handling the ICs subcategory view
  const [selectedSubCategory, setSelectedSubCategory] = useState<any>(null);

  useEffect(() => {
    const fetchComponents = async () => {
      // If we are on the ICs root, do not fetch components yet.
      if (id === 'ics' && !selectedSubCategory) {
        setComponentList([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        let q;
        if (id === 'ics' && selectedSubCategory) {
          q = query(collection(db, "components"), where("categoryId", "==", id), where("subCategory", "==", selectedSubCategory.id));
        } else {
          q = query(collection(db, "components"), where("categoryId", "==", id));
        }
        
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setComponentList(data);
      } catch (e) {
        console.error("Error fetching components:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchComponents();
  }, [id, selectedSubCategory]);

  const filteredComponents = componentList.filter((item) => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleBack = () => {
    if (id === 'ics' && selectedSubCategory) {
      setSelectedSubCategory(null);
      setSearchQuery('');
    } else {
      router.back();
    }
  };

  const renderICSubCategoryItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => setSelectedSubCategory(item)}
    >
      <View style={[styles.image, styles.iconContainer]}>
        <MaterialCommunityIcons name={item.icon as any} size={36} color="#AF52DE" />
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemDescription} numberOfLines={2}>{item.desc}</Text>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={24} color="#C7C7CC" />
    </TouchableOpacity>
  );

  const renderComponentItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => router.push({ pathname: '/component/[componentId]', params: { componentId: item.id, categoryId: id } })}
    >
      <Image 
        source={item.imageKey && ASSET_MAP[item.imageKey] ? ASSET_MAP[item.imageKey] : { uri: item.imageUrl }} 
        style={styles.image} 
        resizeMode="contain" 
      />
      <View style={styles.cardContent}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemDescription} numberOfLines={2}>{item.description}</Text>
        {(item.symbol || item.highlightValue) && (
          <View style={styles.symbolBadge}>
            <Text style={styles.symbolText}>{item.highlightLabel || "Symbol"}: {item.highlightValue || item.symbol}</Text>
          </View>
        )}
      </View>
      <MaterialCommunityIcons name="chevron-right" size={24} color="#C7C7CC" />
    </TouchableOpacity>
  );

  const isICRoot = id === 'ics' && !selectedSubCategory;
  const displayTitle = selectedSubCategory ? selectedSubCategory.name : name;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={28} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{displayTitle}</Text>
        <View style={{ width: 28 }} /> 
      </View>

      {!isICRoot && (
        <View style={styles.searchContainer}>
          <MaterialCommunityIcons name="magnify" size={20} color="#8E8E93" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search components..."
            placeholderTextColor="#8E8E93"
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
          />
        </View>
      )}

      {isICRoot ? (
        <FlatList
          data={IC_SUBCATEGORIES}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={renderICSubCategoryItem}
          showsVerticalScrollIndicator={false}
        />
      ) : loading ? (
        <View style={styles.emptyState}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.emptyText}>Syncing Live Data...</Text>
        </View>
      ) : filteredComponents.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="cloud-search" size={64} color="#C7C7CC" />
          <Text style={styles.emptyText}>No matches found</Text>
          <Text style={styles.emptySubtext}>Try adjusting your search.</Text>
        </View>
      ) : (
        <FlatList
          data={filteredComponents}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={renderComponentItem}
        />
      )}
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
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E5E5EA',
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 38,
  },
  searchIcon: {
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1C1C1E',
  },
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: '#F2F2F7',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
  },
  cardContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  itemName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 18,
    marginBottom: 8,
  },
  symbolBadge: {
    backgroundColor: '#E5E5EA',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  symbolText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#333',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 8,
    textAlign: 'center',
  }
});
