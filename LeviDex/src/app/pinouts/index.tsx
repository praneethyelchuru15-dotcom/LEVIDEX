import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, FlatList, StatusBar, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const PINOUTS = [
  { id: '555-timer', name: '555 Timer IC', desc: 'Precision Timing Circuit', icon: 'chip' },
  { id: 'lm358', name: 'LM358 Op-Amp', desc: 'Dual Operational Amplifier', icon: 'sine-wave' },
  { id: 'atmega328p', name: 'ATmega328P', desc: '8-bit AVR Microcontroller', icon: 'memory' },
  { id: 'usb-c', name: 'USB-C Receptacle', desc: '24-pin Connector', icon: 'usb-port' },
  { id: 'nano', name: 'Arduino Nano', desc: 'ATmega328P Dev Board', icon: 'developer-board' },
  { id: 'esp32', name: 'ESP32 (38-pin)', desc: 'Wi-Fi & Bluetooth MCU', icon: 'wifi' },
  { id: 'rpi4', name: 'Raspberry Pi 4', desc: '40-pin GPIO Header', icon: 'raspberry-pi' },
  { id: 'l298n', name: 'L298N Motor Driver', desc: 'Dual H-Bridge Driver', icon: 'engine' },
  { id: 'hcsr04', name: 'HC-SR04 Sensor', desc: 'Ultrasonic Distance Sensor', icon: 'radar' },
  { id: 'oled', name: 'I2C OLED Display', desc: '0.96" OLED (4-pin)', icon: 'monitor' },
  { id: 'nrf24l01', name: 'NRF24L01', desc: '2.4GHz RF Transceiver', icon: 'radio-tower' },
  { id: 'relay', name: '1-Channel Relay', desc: '5V Relay Module', icon: 'electric-switch' },
  { id: '74hc595', name: '74HC595', desc: '8-bit Shift Register', icon: 'memory' },
  { id: '16x2-lcd', name: '16x2 LCD Display', desc: 'Standard Character LCD', icon: 'monitor' },
  { id: 'lm317', name: 'LM317', desc: 'Adjustable Voltage Regulator', icon: 'flash' },
  { id: 'dht11', name: 'DHT11 Sensor', desc: 'Temperature & Humidity', icon: 'thermometer' },
  { id: 'a4988', name: 'A4988', desc: 'Stepper Motor Driver', icon: 'engine' },
  { id: 'l7805', name: 'L7805', desc: '5V Voltage Regulator', icon: 'flash' },
  { id: 'mpu6050', name: 'MPU6050', desc: '6-Axis Gyro & Accelerometer', icon: 'rotate-3d' },
  { id: 'ds3231', name: 'DS3231 RTC', desc: 'Real-Time Clock Module', icon: 'clock-outline' },
  { id: 'max7219', name: 'MAX7219', desc: 'LED Matrix/Display Driver', icon: 'matrix' },
  { id: 'ws2812b', name: 'WS2812B (NeoPixel)', desc: 'Addressable RGB LED', icon: 'led-on' },
];

export default function PinoutsHubScreen() {
  const router = useRouter();

  const renderItem = ({ item }: { item: typeof PINOUTS[0] }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => router.push(`/pinouts/${item.id}` as any)}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons name={item.icon as any} size={36} color="#AF52DE" />
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
        <Text style={styles.headerTitle}>Pinout Reference</Text>
        <View style={{ width: 28 }} />
      </View>

      <FlatList
        data={PINOUTS}
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
    backgroundColor: '#F8F0FF', 
    justifyContent: 'center', 
    alignItems: 'center',
    marginRight: 16
  },
  cardContent: { flex: 1 },
  itemName: { fontSize: 17, fontWeight: '600', color: '#1C1C1E', marginBottom: 4 },
  itemDescription: { fontSize: 14, color: '#8E8E93' },
});
