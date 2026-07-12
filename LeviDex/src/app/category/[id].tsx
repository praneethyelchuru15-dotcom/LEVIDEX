import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, SafeAreaView, ActivityIndicator, TextInput, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { db } from '../../../services/firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { ASSET_MAP } from '../../utils/assetMap';

const SUBCATEGORIES_MAP: Record<string, any[]> = {
  'ics': [
    { id: '7400-series', name: 'The 7400 Series', desc: 'TTL Logic Gates', icon: 'memory' },
    { id: '4000-series', name: 'The 4000 Series', desc: 'CMOS Logic', icon: 'memory' },
    { id: 'timers-rtc', name: 'Timers & Real-Time Clocks', desc: 'Real-Time Clocks & 555 Timers', icon: 'clock-outline' },
    { id: 'op-amps', name: 'Operational Amplifiers (Op-Amps) & Comparators', desc: 'Operational Amplifiers', icon: 'sine-wave' },
    { id: 'microcontrollers', name: 'Microcontrollers & Microprocessors', desc: 'MCU / MPU', icon: 'cpu-64-bit' },
    { id: 'power-management', name: 'Power Management & Voltage Regulators', desc: 'Voltage Regulators', icon: 'lightning-bolt' },
    { id: 'motor-relay', name: 'Motor & Relay Drivers', desc: 'Hardware Drivers', icon: 'engine' },
    { id: 'communications', name: 'Communication & Interface', desc: 'Serial, USB, I2C, SPI', icon: 'serial-port' },
    { id: 'data-converters', name: 'Data Converters (ADC / DAC)', desc: 'ADC / DAC', icon: 'chart-bell-curve' }
  ],
  'electromechanical': [
    { id: 'switches', name: 'Switches', desc: 'Manual, Detection, & Power Switches', icon: 'toggle-switch-outline' },
    { id: 'relays', name: 'Relays', desc: 'Electromechanical & Solid State Relays', icon: 'electric-switch' }
  ],
  'power': [
    { id: 'conversion', name: 'Power Conversion', desc: 'Transformers, Regulators, Converters', icon: 'transformer' },
    { id: 'charging', name: 'Charging & Battery', desc: 'BMS, Chargers, Holders', icon: 'battery-plus' }
  ],
  'inductors': [
    { id: 'inductors', name: 'Inductors', desc: 'Fixed, Variable, Core, SMD', icon: 'coil' },
    { id: 'chokes', name: 'Chokes', desc: 'Power, RF, Common Mode', icon: 'resistor' },
    { id: 'ferrites', name: 'Ferrites & Magnetics', desc: 'Beads, Cores, Rings', icon: 'magnet' },
    { id: 'transformers', name: 'Transformer Components', desc: 'Power, Isolation, RF', icon: 'transformer' },
    { id: 'assemblies', name: 'Magnetic Assemblies', desc: 'Arrays, Modules, Coils', icon: 'connection' }
  ],
  'motors': [
    { id: 'electric-motors', name: 'Electric Motors', desc: 'Brushed, BLDC, Universal', icon: 'engine' },
    { id: 'ac-motors', name: 'AC Motors', desc: 'Induction, Synchronous', icon: 'engine-outline' },
    { id: 'dc-motors', name: 'DC Motors', desc: 'Brushed, BLDC, Shunt', icon: 'engine-outline' },
    { id: 'stepper-motors', name: 'Stepper Motors', desc: 'Permanent Magnet, Hybrid', icon: 'rotate-3d-variant' },
    { id: 'servo-motors', name: 'Servo Motors', desc: 'AC, DC, Rotary, Linear', icon: 'robot-arm' },
    { id: 'gear-motors', name: 'Gear Motors', desc: 'Spur, Planetary, Worm', icon: 'cog' },
    { id: 'linear-motors', name: 'Linear Motors', desc: 'Stepper, Servo, Voice Coil', icon: 'swap-horizontal' },
    { id: 'actuators', name: 'Actuators', desc: 'Linear, Rotary, Mechanical', icon: 'hydraulic-oil-level' },
    { id: 'solenoids', name: 'Solenoids', desc: 'Push, Pull, Rotary, Tubular', icon: 'magnet-on' },
    { id: 'control', name: 'Motor Control', desc: 'Starters, Drivers, VFDs', icon: 'car-shift-pattern' },
    { id: 'feedback', name: 'Motor Feedback', desc: 'Encoders, Tachometers, Hall', icon: 'speedometer' }
  ],
  'prototyping': [
    { id: 'breadboarding', name: 'Breadboarding', desc: 'Breadboards, Jumpers', icon: 'developer-board' },
    { id: 'prototyping-boards', name: 'Prototyping Boards', desc: 'Perfboards, Stripboards', icon: 'dots-grid' },
    { id: 'pcb-dev', name: 'PCB Development', desc: 'Breakouts, Shields', icon: 'integrated-circuit' },
    { id: 'connectors', name: 'Connectors', desc: 'Headers, IDC, Sockets', icon: 'connection' },
    { id: 'terminals', name: 'Terminals', desc: 'Terminal Blocks, Screws', icon: 'screw-machine-flat-top' },
    { id: 'sockets', name: 'Sockets', desc: 'IC, DIP, ZIF Sockets', icon: 'power-socket' },
    { id: 'adapters', name: 'Adapters', desc: 'Connector, Plug, Socket', icon: 'usb-port' },
    { id: 'testing', name: 'Testing & Interface', desc: 'Probes, Clips, Banana', icon: 'test-tube' },
    { id: 'mounting', name: 'Mounting & Support', desc: 'Standoffs, Spacers', icon: 'nut' }
  ],
  'development': [
    { id: 'mcu-boards', name: 'Microcontrollers', desc: 'Arduino, ESP32, STM32', icon: 'chip' },
    { id: 'sbc', name: 'Single Board Computers', desc: 'SBC, ARM, x86', icon: 'server-network' },
    { id: 'fpga', name: 'FPGA & CPLD', desc: 'FPGA, Logic Boards', icon: 'memory' },
    { id: 'processor', name: 'Processor Evaluation', desc: 'MPU, SoM, Eval', icon: 'cpu-64-bit' },
    { id: 'wireless', name: 'Wireless Development', desc: 'Wi-Fi, Bluetooth, LoRa', icon: 'wifi' },
    { id: 'sensor-dev', name: 'Sensor Boards', desc: 'IMU, Environmental', icon: 'leak' },
    { id: 'display-dev', name: 'Display Boards', desc: 'LCD, OLED, Touch', icon: 'monitor' },
    { id: 'motor-power-dev', name: 'Motor & Power', desc: 'Drivers, PMICs', icon: 'engine' },
    { id: 'interface-dev', name: 'Interface & Comm', desc: 'USB, CAN, RS485', icon: 'serial-port' },
    { id: 'expansion', name: 'Expansion Boards', desc: 'Shields, HATs, Breakouts', icon: 'layers' },
    { id: 'debugging', name: 'Debugging & Programming', desc: 'JTAG, SWD, Emulators', icon: 'bug' }
  ]
};

export default function CategoryListScreen() {
  const params = useLocalSearchParams();
  const id = String(params.id);
  const name = String(params.name);
  const router = useRouter();
  
  const [componentList, setComponentList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState<any>(null);

  const subCategories = SUBCATEGORIES_MAP[id] || null;
  const isRootWithSubCategories = subCategories && !selectedSubCategory;

  useEffect(() => {
    const fetchComponents = async () => {
      if (isRootWithSubCategories) {
        setComponentList([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        let q;
        if (subCategories && selectedSubCategory) {
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
    if (selectedSubCategory) {
      setSelectedSubCategory(null);
      setSearchQuery('');
    } else {
      router.back();
    }
  };

  const renderSubCategoryItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.card} onPress={() => setSelectedSubCategory(item)}>
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
        source={ASSET_MAP[(item.imageKey || item.name.replace(/ /g, '_').replace(/\//g, '_').replace(/-/g, '_').replace(/\(/g, '_').replace(/\)/g, '_') + '.png').toLowerCase()] || { uri: item.imageUrl }} 
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

      {!isRootWithSubCategories && (
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

      {isRootWithSubCategories ? (
        <FlatList
          data={subCategories}
          keyExtractor={(item, index) => item.id + '-' + index}
          contentContainerStyle={styles.list}
          renderItem={renderSubCategoryItem}
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
          keyExtractor={(item, index) => item.id + '-' + index}
          contentContainerStyle={styles.list}
          renderItem={renderComponentItem}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F2F2F7' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: Platform.OS === 'android' ? 40 : 10, paddingBottom: 15, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E5E5EA' },
  backButton: { padding: 4 },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '700', color: '#1C1C1E' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E5E5EA', marginHorizontal: 16, marginTop: 10, borderRadius: 10, paddingHorizontal: 10, height: 38 },
  searchIcon: { marginRight: 6 },
  searchInput: { flex: 1, fontSize: 16, color: '#1C1C1E' },
  list: { padding: 16 },
  card: { backgroundColor: '#fff', borderRadius: 16, marginBottom: 16, flexDirection: 'row', alignItems: 'center', padding: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  image: { width: 60, height: 60, borderRadius: 10, backgroundColor: '#F2F2F7' },
  iconContainer: { justifyContent: 'center', alignItems: 'center', backgroundColor: '#F2F2F7' },
  cardContent: { flex: 1, paddingHorizontal: 16 },
  itemName: { fontSize: 17, fontWeight: '600', color: '#000', marginBottom: 4 },
  itemDescription: { fontSize: 14, color: '#8E8E93', lineHeight: 18, marginBottom: 8 },
  symbolBadge: { backgroundColor: '#E5E5EA', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  symbolText: { fontSize: 12, fontWeight: '700', color: '#333' },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  emptyText: { fontSize: 18, fontWeight: '600', color: '#333', marginTop: 16 },
  emptySubtext: { fontSize: 14, color: '#8E8E93', marginTop: 8, textAlign: 'center' }
});








