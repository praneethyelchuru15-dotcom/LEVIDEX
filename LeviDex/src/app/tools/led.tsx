import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, TouchableOpacity, StatusBar, Platform, KeyboardAvoidingView, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function LEDCalculatorScreen() {
  const router = useRouter();

  const [sourceVoltage, setSourceVoltage] = useState('');
  const [forwardVoltage, setForwardVoltage] = useState('');
  const [forwardCurrent, setForwardCurrent] = useState('20');
  
  const [resistance, setResistance] = useState<string | null>(null);
  const [power, setPower] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const calculate = () => {
    let vs = parseFloat(sourceVoltage);
    let vf = parseFloat(forwardVoltage);
    let i_mA = parseFloat(forwardCurrent);

    if (isNaN(vs) || isNaN(vf) || isNaN(i_mA)) {
      setErrorMsg('Please enter all three values.');
      setResistance(null);
      setPower(null);
      return;
    }
    
    if (vs <= vf) {
      setErrorMsg('Source Voltage must be greater than Forward Voltage.');
      setResistance(null);
      setPower(null);
      return;
    }

    if (i_mA <= 0) {
      setErrorMsg('Current must be greater than 0.');
      setResistance(null);
      setPower(null);
      return;
    }

    setErrorMsg('');

    const i_A = i_mA / 1000;
    const r = (vs - vf) / i_A;
    const p = (vs - vf) * i_A;

    setResistance(r.toFixed(1).replace(/\.?0+$/, ''));
    setPower(p.toFixed(3).replace(/\.?0+$/, ''));
  };

  const presetLED = (vf: string, current: string) => {
    setForwardVoltage(vf);
    setForwardCurrent(current);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F2F2F7" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={28} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>LED Resistor</Text>
        <View style={{ width: 28 }} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          
          {resistance !== null && power !== null ? (
            <View style={styles.resultCard}>
              <Text style={styles.resultLabel}>Required Resistor:</Text>
              <Text style={styles.resultValue}>{resistance} Ω</Text>
              <Text style={styles.powerLabel}>Power Dissipation: {power} W</Text>
              <Text style={styles.powerSub}>Use a {(parseFloat(power) > 0.25 ? '0.5W' : '0.25W')} or larger resistor</Text>
            </View>
          ) : null}

          <View style={styles.card}>
            {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Source Voltage (Vs)</Text>
              <TextInput style={styles.input} value={sourceVoltage} onChangeText={setSourceVoltage} keyboardType="numeric" placeholder="e.g. 5, 9, 12" placeholderTextColor="#C7C7CC" />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>LED Forward Voltage (Vf)</Text>
              <TextInput style={styles.input} value={forwardVoltage} onChangeText={setForwardVoltage} keyboardType="numeric" placeholder="e.g. 2.0" placeholderTextColor="#C7C7CC" />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>LED Current (mA)</Text>
              <TextInput style={styles.input} value={forwardCurrent} onChangeText={setForwardCurrent} keyboardType="numeric" placeholder="e.g. 20" placeholderTextColor="#C7C7CC" />
            </View>

            <TouchableOpacity style={styles.calcBtn} onPress={calculate}>
              <Text style={styles.calcBtnText}>Calculate</Text>
            </TouchableOpacity>

            <Text style={styles.presetsTitle}>Quick Presets:</Text>
            <View style={styles.presetRow}>
              <TouchableOpacity style={[styles.presetBtn, { borderColor: '#FF3B30' }]} onPress={() => presetLED('2.0', '20')}>
                <Text style={[styles.presetText, { color: '#FF3B30' }]}>Red (2.0V)</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.presetBtn, { borderColor: '#34C759' }]} onPress={() => presetLED('2.2', '20')}>
                <Text style={[styles.presetText, { color: '#34C759' }]}>Green (2.2V)</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.presetBtn, { borderColor: '#007AFF' }]} onPress={() => presetLED('3.3', '20')}>
                <Text style={[styles.presetText, { color: '#007AFF' }]}>Blue (3.3V)</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.presetBtn, { borderColor: '#8E8E93' }]} onPress={() => presetLED('3.3', '20')}>
                <Text style={[styles.presetText, { color: '#8E8E93' }]}>White (3.3V)</Text>
              </TouchableOpacity>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  resultCard: { backgroundColor: '#007AFF', borderRadius: 16, padding: 20, marginBottom: 16, alignItems: 'center' },
  resultLabel: { color: '#E5E5EA', fontSize: 16, fontWeight: '600' },
  resultValue: { color: '#FFF', fontSize: 48, fontWeight: 'bold', marginVertical: 8 },
  powerLabel: { color: '#FFF', fontSize: 16 },
  powerSub: { color: '#E5E5EA', fontSize: 14, marginTop: 4, fontStyle: 'italic' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  errorText: { color: '#FF3B30', textAlign: 'center', marginBottom: 15, fontWeight: '600' },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 16, fontWeight: '600', color: '#1C1C1E', marginBottom: 8 },
  input: { backgroundColor: '#F2F2F7', borderRadius: 10, padding: 14, fontSize: 18, color: '#1C1C1E' },
  calcBtn: { backgroundColor: '#007AFF', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  calcBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  presetsTitle: { marginTop: 24, marginBottom: 12, fontSize: 15, fontWeight: '600', color: '#8E8E93' },
  presetRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  presetBtn: { borderWidth: 1, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20 },
  presetText: { fontSize: 14, fontWeight: '600' }
});
