import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, TouchableOpacity, StatusBar, Platform, KeyboardAvoidingView, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function OhmsLawScreen() {
  const router = useRouter();

  const [voltage, setVoltage] = useState('');
  const [current, setCurrent] = useState('');
  const [resistance, setResistance] = useState('');
  const [power, setPower] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const calculate = () => {
    let v = parseFloat(voltage);
    let i = parseFloat(current);
    let r = parseFloat(resistance);
    let p = parseFloat(power);

    let vOk = !isNaN(v);
    let iOk = !isNaN(i);
    let rOk = !isNaN(r);
    let pOk = !isNaN(p);

    let count = [vOk, iOk, rOk, pOk].filter(Boolean).length;

    if (count < 2) {
      setErrorMsg('Please enter exactly 2 values to calculate.');
      return;
    }
    if (count > 2) {
      setErrorMsg('Please enter ONLY 2 values. Clear the others.');
      return;
    }
    setErrorMsg('');

    if (vOk && iOk) {
      r = v / i;
      p = v * i;
    } else if (vOk && rOk) {
      i = v / r;
      p = (v * v) / r;
    } else if (vOk && pOk) {
      i = p / v;
      r = (v * v) / p;
    } else if (iOk && rOk) {
      v = i * r;
      p = (i * i) * r;
    } else if (iOk && pOk) {
      v = p / i;
      r = p / (i * i);
    } else if (rOk && pOk) {
      v = Math.sqrt(p * r);
      i = Math.sqrt(p / r);
    }

    setVoltage(v.toFixed(3).replace(/\.?0+$/, ''));
    setCurrent(i.toFixed(3).replace(/\.?0+$/, ''));
    setResistance(r.toFixed(3).replace(/\.?0+$/, ''));
    setPower(p.toFixed(3).replace(/\.?0+$/, ''));
  };

  const clearAll = () => {
    setVoltage('');
    setCurrent('');
    setResistance('');
    setPower('');
    setErrorMsg('');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F2F2F7" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={28} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ohm's Law</Text>
        <View style={{ width: 28 }} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.card}>
            <Text style={styles.instructions}>Enter any TWO values and press Calculate.</Text>

            {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

            <View style={styles.inputGroup}>
              <View style={styles.labelContainer}>
                <View style={[styles.iconBox, { backgroundColor: '#FF9500' }]}>
                  <Text style={styles.iconText}>V</Text>
                </View>
                <Text style={styles.label}>Voltage (Volts)</Text>
              </View>
              <TextInput style={styles.input} value={voltage} onChangeText={setVoltage} keyboardType="numeric" placeholder="e.g. 5" placeholderTextColor="#C7C7CC" />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelContainer}>
                <View style={[styles.iconBox, { backgroundColor: '#5856D6' }]}>
                  <Text style={styles.iconText}>I</Text>
                </View>
                <Text style={styles.label}>Current (Amps)</Text>
              </View>
              <TextInput style={styles.input} value={current} onChangeText={setCurrent} keyboardType="numeric" placeholder="e.g. 0.02" placeholderTextColor="#C7C7CC" />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelContainer}>
                <View style={[styles.iconBox, { backgroundColor: '#FF2D55' }]}>
                  <Text style={styles.iconText}>R</Text>
                </View>
                <Text style={styles.label}>Resistance (Ohms)</Text>
              </View>
              <TextInput style={styles.input} value={resistance} onChangeText={setResistance} keyboardType="numeric" placeholder="e.g. 250" placeholderTextColor="#C7C7CC" />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.labelContainer}>
                <View style={[styles.iconBox, { backgroundColor: '#34C759' }]}>
                  <Text style={styles.iconText}>P</Text>
                </View>
                <Text style={styles.label}>Power (Watts)</Text>
              </View>
              <TextInput style={styles.input} value={power} onChangeText={setPower} keyboardType="numeric" placeholder="e.g. 0.1" placeholderTextColor="#C7C7CC" />
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.clearBtn} onPress={clearAll}>
                <Text style={styles.clearBtnText}>Clear</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.calcBtn} onPress={calculate}>
                <Text style={styles.calcBtnText}>Calculate</Text>
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
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  instructions: { fontSize: 15, color: '#8E8E93', marginBottom: 20, textAlign: 'center' },
  errorText: { color: '#FF3B30', textAlign: 'center', marginBottom: 15, fontWeight: '600' },
  inputGroup: { marginBottom: 20 },
  labelContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  iconBox: { width: 28, height: 28, borderRadius: 6, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  iconText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  label: { fontSize: 16, fontWeight: '600', color: '#1C1C1E' },
  input: { backgroundColor: '#F2F2F7', borderRadius: 10, padding: 14, fontSize: 18, color: '#1C1C1E' },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  clearBtn: { flex: 1, backgroundColor: '#E5E5EA', padding: 16, borderRadius: 12, marginRight: 10, alignItems: 'center' },
  clearBtnText: { fontSize: 16, fontWeight: '600', color: '#1C1C1E' },
  calcBtn: { flex: 2, backgroundColor: '#007AFF', padding: 16, borderRadius: 12, alignItems: 'center' },
  calcBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' }
});
