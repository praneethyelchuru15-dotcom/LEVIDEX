import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// Standard Resistor Colors Mapping
const COLORS = [
  { name: 'Black', value: 0, mult: 1, color: '#000000', text: '#fff' },
  { name: 'Brown', value: 1, mult: 10, color: '#8b4513', text: '#fff' },
  { name: 'Red', value: 2, mult: 100, color: '#ff0000', text: '#fff' },
  { name: 'Orange', value: 3, mult: 1000, color: '#ff8c00', text: '#fff' },
  { name: 'Yellow', value: 4, mult: 10000, color: '#ffd700', text: '#000' },
  { name: 'Green', value: 5, mult: 100000, color: '#008000', text: '#fff' },
  { name: 'Blue', value: 6, mult: 1000000, color: '#0000ff', text: '#fff' },
  { name: 'Violet', value: 7, mult: 10000000, color: '#8a2be2', text: '#fff' },
  { name: 'Gray', value: 8, mult: 100000000, color: '#808080', text: '#fff' },
  { name: 'White', value: 9, mult: 1000000000, color: '#ffffff', text: '#000' },
];

export default function ResistorCalculatorScreen() {
  const router = useRouter();
  
  // Default to 4-band: Brown, Black, Red (1k Ohm)
  const [band1, setBand1] = useState(COLORS[1]); 
  const [band2, setBand2] = useState(COLORS[0]);
  const [multiplier, setMultiplier] = useState(COLORS[2]);

  // Calculate Resistance
  const calculateResistance = () => {
    const baseValue = (band1.value * 10) + band2.value;
    const totalRaw = baseValue * multiplier.mult;

    if (totalRaw >= 1000000) {
      return `${(totalRaw / 1000000).toFixed(1)} MΩ`;
    } else if (totalRaw >= 1000) {
      return `${(totalRaw / 1000).toFixed(1)} kΩ`;
    }
    return `${totalRaw} Ω`;
  };

  const ColorPicker = ({ selected, onSelect, label }: any) => (
    <View style={styles.pickerSection}>
      <Text style={styles.pickerLabel}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollColors}>
        {COLORS.map((c, i) => (
          <TouchableOpacity 
            key={i} 
            style={[
              styles.colorSwatch, 
              { backgroundColor: c.color }, 
              selected.name === c.name && styles.selectedSwatch
            ]}
            onPress={() => onSelect(c)}
          >
            {selected.name === c.name && (
              <MaterialCommunityIcons name="check" size={20} color={c.text} />
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={28} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>4-Band Calculator</Text>
        <View style={{ width: 28 }} /> 
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* Visual Resistor Graphic */}
        <View style={styles.resistorBodyContainer}>
          <View style={styles.resistorWire} />
          <View style={styles.resistorBody}>
            <View style={[styles.band, { backgroundColor: band1.color }]} />
            <View style={[styles.band, { backgroundColor: band2.color }]} />
            <View style={[styles.band, { backgroundColor: multiplier.color }]} />
            {/* Gold Tolerance Band Hardcoded for visual */}
            <View style={[styles.band, { backgroundColor: '#FFD700', marginLeft: 20 }]} />
          </View>
          <View style={styles.resistorWire} />
        </View>

        {/* Result Board */}
        <View style={styles.resultBox}>
          <Text style={styles.resultLabel}>Resistance Value</Text>
          <Text style={styles.resultValue}>{calculateResistance()}</Text>
          <Text style={styles.tolerance}>Tolerance: ±5% (Gold)</Text>
        </View>

        {/* Color Selectors */}
        <View style={styles.selectorCard}>
          <ColorPicker selected={band1} onSelect={setBand1} label="1st Band (Tens Digit)" />
          <ColorPicker selected={band2} onSelect={setBand2} label="2nd Band (Units Digit)" />
          <ColorPicker selected={multiplier} onSelect={setMultiplier} label="Multiplier Band" />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F2F2F7'},
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: Platform.OS === 'android' ? 40 : 10, paddingBottom: 15,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E5E5EA',
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#1C1C1E' },
  content: { padding: 20 },
  
  resistorBodyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 40,
  },
  resistorWire: {
    width: 40,
    height: 6,
    backgroundColor: '#a9a9a9',
  },
  resistorBody: {
    backgroundColor: '#e3c298',
    height: 70,
    width: 180,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    paddingHorizontal: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 5, elevation: 5,
  },
  band: {
    width: 14,
    height: '100%',
  },
  
  resultBox: {
    backgroundColor: '#007AFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#007AFF', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  resultLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 16, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
  resultValue: { color: '#fff', fontSize: 48, fontWeight: '900', marginVertical: 8 },
  tolerance: { color: 'rgba(255,255,255,0.9)', fontSize: 16, fontWeight: '500' },

  selectorCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  pickerSection: { marginBottom: 20 },
  pickerLabel: { fontSize: 16, fontWeight: '700', color: '#333', marginBottom: 12 },
  scrollColors: { paddingBottom: 10 },
  colorSwatch: {
    width: 44, height: 44, borderRadius: 22,
    marginRight: 12,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: '#e5e5ea',
  },
  selectedSwatch: {
    borderWidth: 3, borderColor: '#007AFF',
    transform: [{ scale: 1.1 }]
  }
});
