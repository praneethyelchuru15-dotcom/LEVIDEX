import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, FlatList, StatusBar, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const TOOLS = [
  { id: 'resistor', name: 'Resistor Color Codes', desc: '4, 5, and 6 band decoders', icon: 'resistor' },
  { id: 'ohms-law', name: "Ohm's Law Calculator", desc: 'V = I × R Power Solver', icon: 'calculator' },
  { id: 'led', name: 'LED Resistor Calculator', desc: 'Find the right resistor for LEDs', icon: 'led-on' },
];

export default function ToolsHubScreen() {
  const router = useRouter();

  const renderItem = ({ item }: { item: typeof TOOLS[0] }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => router.push(`/tools/${item.id}` as any)}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons name={item.icon as any} size={36} color="#007AFF" />
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemDescription}>{item.desc}</Text>
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
        <Text style={styles.headerTitle}>Calculators & Tools</Text>
        <View style={{ width: 28 }} />
      </View>

      <FlatList
        data={TOOLS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={renderItem}
      />
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
    backgroundColor: '#F0F8FF', 
    justifyContent: 'center', 
    alignItems: 'center',
    marginRight: 16
  },
  cardContent: { flex: 1 },
  itemName: { fontSize: 17, fontWeight: '600', color: '#1C1C1E', marginBottom: 4 },
  itemDescription: { fontSize: 14, color: '#8E8E93' },
});
