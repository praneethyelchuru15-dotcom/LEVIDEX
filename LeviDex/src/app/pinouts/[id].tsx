import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, StatusBar, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const PINOUT_DATA: Record<string, { name: string; desc: string; pins: { num: string; name: string; type: string; desc: string }[] }> = {
  '555-timer': {
    name: '555 Timer IC',
    desc: 'Standard 8-pin DIP Package',
    pins: [
      { num: '1', name: 'GND', type: 'power', desc: 'Ground (0V)' },
      { num: '2', name: 'TRIG', type: 'input', desc: 'Trigger (starts timing when < 1/3 Vcc)' },
      { num: '3', name: 'OUT', type: 'output', desc: 'Output (High or Low)' },
      { num: '4', name: 'RESET', type: 'input', desc: 'Reset (Active Low)' },
      { num: '5', name: 'CTRL', type: 'analog', desc: 'Control Voltage (Usually bypassed to GND via 10nF)' },
      { num: '6', name: 'THR', type: 'input', desc: 'Threshold (Ends timing when > 2/3 Vcc)' },
      { num: '7', name: 'DISCH', type: 'output', desc: 'Discharge (Open collector to discharge timing capacitor)' },
      { num: '8', name: 'VCC', type: 'power', desc: 'Supply Voltage (+4.5V to +15V)' },
    ]
  },
  'lm358': {
    name: 'LM358 Op-Amp',
    desc: 'Dual Operational Amplifier (8-pin)',
    pins: [
      { num: '1', name: 'OUT A', type: 'output', desc: 'Output of Amplifier A' },
      { num: '2', name: 'IN A-', type: 'input', desc: 'Inverting Input A' },
      { num: '3', name: 'IN A+', type: 'input', desc: 'Non-Inverting Input A' },
      { num: '4', name: 'GND/VEE', type: 'power', desc: 'Ground or Negative Supply' },
      { num: '5', name: 'IN B+', type: 'input', desc: 'Non-Inverting Input B' },
      { num: '6', name: 'IN B-', type: 'input', desc: 'Inverting Input B' },
      { num: '7', name: 'OUT B', type: 'output', desc: 'Output of Amplifier B' },
      { num: '8', name: 'VCC', type: 'power', desc: 'Positive Supply Voltage' },
    ]
  },
  'atmega328p': {
    name: 'ATmega328P',
    desc: '8-bit AVR Microcontroller (28-pin DIP)',
    pins: [
      { num: '1', name: 'PC6 / RESET', type: 'input', desc: 'Reset (Active Low)' },
      { num: '2, 3', name: 'PD0, PD1', type: 'data', desc: 'RX, TX (Serial Communication)' },
      { num: '4', name: 'PD2', type: 'input', desc: 'External Interrupt 0' },
      { num: '5', name: 'PD3', type: 'input', desc: 'External Interrupt 1 / PWM' },
      { num: '6', name: 'PD4', type: 'data', desc: 'Digital I/O / T0 Timer Clock' },
      { num: '7, 20', name: 'VCC, AVCC', type: 'power', desc: 'Positive Supply (Digital & Analog)' },
      { num: '8, 22', name: 'GND', type: 'power', desc: 'Ground' },
      { num: '9, 10', name: 'PB6, PB7', type: 'analog', desc: 'Crystal Oscillator Pins' },
      { num: '11, 12, 13', name: 'PD5, PD6, PD7', type: 'data', desc: 'Digital I/O / PWM' },
      { num: '14', name: 'PB0', type: 'data', desc: 'Digital I/O (ICP1)' },
      { num: '15, 16', name: 'PB1, PB2', type: 'data', desc: 'Digital I/O (PWM / SS)' },
      { num: '17, 18, 19', name: 'PB3, PB4, PB5', type: 'data', desc: 'SPI Bus (MOSI, MISO, SCK)' },
      { num: '21', name: 'AREF', type: 'analog', desc: 'Analog Reference Voltage' },
      { num: '23-28', name: 'PC0 - PC5', type: 'analog', desc: 'Analog Inputs (ADC0 - ADC5)' },
    ]
  },
  'usb-c': {
    name: 'USB-C Receptacle',
    desc: '24-pin Connector (Front View)',
    pins: [
      { num: 'A1, B1, A12, B12', name: 'GND', type: 'power', desc: 'Ground Return' },
      { num: 'A4, B4, A9, B9', name: 'VBUS', type: 'power', desc: 'Bus Power (5V - 20V)' },
      { num: 'A5', name: 'CC1', type: 'analog', desc: 'Configuration Channel 1' },
      { num: 'B5', name: 'CC2', type: 'analog', desc: 'Configuration Channel 2' },
      { num: 'A6, B6', name: 'Dp1, Dp2', type: 'data', desc: 'USB 2.0 Differential Data Plus' },
      { num: 'A7, B7', name: 'Dn1, Dn2', type: 'data', desc: 'USB 2.0 Differential Data Minus' },
      { num: 'A2, A3, B10, B11', name: 'TX/RX', type: 'data', desc: 'SuperSpeed Data Pairs' }
    ]
  },
  'nano': {
    name: 'Arduino Nano',
    desc: 'ATmega328P Based Development Board',
    pins: [
      { num: 'VIN', name: 'VIN', type: 'power', desc: 'Input Voltage (7-12V)' },
      { num: '5V', name: '5V', type: 'power', desc: 'Regulated 5V Output / Input' },
      { num: '3V3', name: '3V3', type: 'power', desc: '3.3V Output (From FTDI/CH340)' },
      { num: 'GND', name: 'GND', type: 'power', desc: 'Ground' },
      { num: 'A0-A7', name: 'Analog In', type: 'analog', desc: '10-bit Analog Inputs (A4=SDA, A5=SCL)' },
      { num: 'D0, D1', name: 'RX, TX', type: 'data', desc: 'Hardware Serial' },
      { num: 'D2, D3', name: 'INT0, INT1', type: 'input', desc: 'External Interrupts (D3 is also PWM)' },
      { num: 'D3, 5, 6, 9, 10, 11', name: 'PWM', type: 'output', desc: 'Pulse Width Modulation Outputs' },
      { num: '10, 11, 12, 13', name: 'SPI', type: 'data', desc: 'SS, MOSI, MISO, SCK' },
    ]
  },
  'esp32': {
    name: 'ESP32 (38-pin DevKitC)',
    desc: 'Dual-core Wi-Fi & Bluetooth Microcontroller',
    pins: [
      { num: 'VIN', name: '5V', type: 'power', desc: '5V Input' },
      { num: '3V3', name: '3.3V', type: 'power', desc: '3.3V Regulated Output' },
      { num: 'GND', name: 'GND', type: 'power', desc: 'Ground' },
      { num: 'EN', name: 'EN', type: 'input', desc: 'Reset/Enable (Active High)' },
      { num: 'GPIO 34, 35, 36, 39', name: 'Input Only', type: 'input', desc: 'Analog Inputs (No internal pull-ups)' },
      { num: 'GPIO 25, 26', name: 'DAC', type: 'analog', desc: '8-bit Digital-to-Analog Converters' },
      { num: 'GPIO 21, 22', name: 'I2C', type: 'data', desc: 'SDA (21), SCL (22)' },
      { num: 'GPIO 16, 17', name: 'UART2', type: 'data', desc: 'RX2, TX2' },
      { num: 'GPIO 2, 4, 12-15, 27', name: 'Touch / ADC', type: 'analog', desc: 'Capacitive Touch / Analog Inputs' },
    ]
  },
  'rpi4': {
    name: 'Raspberry Pi 4',
    desc: '40-pin GPIO Header',
    pins: [
      { num: '2, 4', name: '5V', type: 'power', desc: '5V Power' },
      { num: '1, 17', name: '3V3', type: 'power', desc: '3.3V Power' },
      { num: '6, 9, 14, 20, 25, 30, 34, 39', name: 'GND', type: 'power', desc: 'Ground' },
      { num: '3, 5', name: 'I2C1', type: 'data', desc: 'SDA (3), SCL (5)' },
      { num: '8, 10', name: 'UART', type: 'data', desc: 'TXD (8), RXD (10)' },
      { num: '19, 21, 23, 24, 26', name: 'SPI0', type: 'data', desc: 'MOSI (19), MISO (21), SCLK (23), CE0 (24), CE1 (26)' },
      { num: '12, 32, 33, 35', name: 'PWM', type: 'output', desc: 'Hardware PWM Pins' },
      { num: 'Many', name: 'GPIO', type: 'data', desc: 'General Purpose Digital I/O' },
    ]
  },
  'l298n': {
    name: 'L298N Motor Driver',
    desc: 'Dual H-Bridge Module',
    pins: [
      { num: 'VCC', name: '12V / 5V', type: 'power', desc: 'Motor Supply (up to 35V)' },
      { num: 'GND', name: 'GND', type: 'power', desc: 'Common Ground' },
      { num: '5V', name: '5V Out', type: 'power', desc: 'Logic Supply Output (if 12V jumper is on)' },
      { num: 'ENA, ENB', name: 'Enable A/B', type: 'input', desc: 'PWM Inputs for Speed Control' },
      { num: 'IN1, IN2', name: 'IN1, IN2', type: 'input', desc: 'Direction Control for Motor A' },
      { num: 'IN3, IN4', name: 'IN3, IN4', type: 'input', desc: 'Direction Control for Motor B' },
      { num: 'OUT1, OUT2', name: 'OUT1, OUT2', type: 'output', desc: 'Connection to Motor A' },
      { num: 'OUT3, OUT4', name: 'OUT3, OUT4', type: 'output', desc: 'Connection to Motor B' },
    ]
  },
  'hcsr04': {
    name: 'HC-SR04',
    desc: 'Ultrasonic Distance Sensor',
    pins: [
      { num: '1', name: 'VCC', type: 'power', desc: '5V Supply' },
      { num: '2', name: 'TRIG', type: 'input', desc: 'Trigger Input (10µs High Pulse)' },
      { num: '3', name: 'ECHO', type: 'output', desc: 'Echo Output (Width proportional to distance)' },
      { num: '4', name: 'GND', type: 'power', desc: 'Ground' },
    ]
  },
  'oled': {
    name: 'I2C OLED Display',
    desc: '0.96" 128x64 OLED Screen',
    pins: [
      { num: '1', name: 'VCC', type: 'power', desc: '3.3V - 5V Supply' },
      { num: '2', name: 'GND', type: 'power', desc: 'Ground' },
      { num: '3', name: 'SCL', type: 'data', desc: 'I2C Clock' },
      { num: '4', name: 'SDA', type: 'data', desc: 'I2C Data' },
    ]
  },
  'nrf24l01': {
    name: 'NRF24L01',
    desc: '2.4GHz RF Transceiver',
    pins: [
      { num: '1', name: 'GND', type: 'power', desc: 'Ground' },
      { num: '2', name: 'VCC', type: 'power', desc: '1.9V - 3.6V Supply (DO NOT USE 5V!)' },
      { num: '3', name: 'CE', type: 'input', desc: 'Chip Enable (RX/TX mode control)' },
      { num: '4', name: 'CSN', type: 'input', desc: 'SPI Chip Select Not (Active Low)' },
      { num: '5', name: 'SCK', type: 'data', desc: 'SPI Clock' },
      { num: '6', name: 'MOSI', type: 'data', desc: 'SPI Master Out Slave In' },
      { num: '7', name: 'MISO', type: 'data', desc: 'SPI Master In Slave Out' },
      { num: '8', name: 'IRQ', type: 'output', desc: 'Interrupt Request (Active Low)' },
    ]
  },
  'relay': {
    name: '1-Channel Relay',
    desc: '5V Relay Module',
    pins: [
      { num: 'VCC', name: 'VCC', type: 'power', desc: '5V Supply for Logic/Coil' },
      { num: 'GND', name: 'GND', type: 'power', desc: 'Ground' },
      { num: 'IN', name: 'IN', type: 'input', desc: 'Trigger Input (High or Low level)' },
      { num: 'NO', name: 'Normally Open', type: 'output', desc: 'Open by default, closes when triggered' },
      { num: 'COM', name: 'Common', type: 'output', desc: 'Common connection point' },
      { num: 'NC', name: 'Normally Closed', type: 'output', desc: 'Closed by default, opens when triggered' },
    ]
  },
  '74hc595': {
    name: '74HC595',
    desc: '8-bit Shift Register (16-pin DIP)',
    pins: [
      { num: '1-7, 15', name: 'Q0-Q7', type: 'output', desc: 'Parallel Data Outputs' },
      { num: '8', name: 'GND', type: 'power', desc: 'Ground' },
      { num: '9', name: 'Q7\'', type: 'output', desc: 'Serial Data Output (for chaining)' },
      { num: '10', name: 'MR', type: 'input', desc: 'Master Reset (Active Low)' },
      { num: '11', name: 'SHCP', type: 'input', desc: 'Shift Register Clock Pin' },
      { num: '12', name: 'STCP', type: 'input', desc: 'Storage Register Clock Pin (Latch)' },
      { num: '13', name: 'OE', type: 'input', desc: 'Output Enable (Active Low)' },
      { num: '14', name: 'DS', type: 'input', desc: 'Serial Data Input' },
      { num: '16', name: 'VCC', type: 'power', desc: 'Supply Voltage (2V to 6V)' },
    ]
  },
  '16x2-lcd': {
    name: '16x2 LCD Display',
    desc: 'Standard HD44780 Character LCD',
    pins: [
      { num: '1', name: 'VSS', type: 'power', desc: 'Ground' },
      { num: '2', name: 'VDD', type: 'power', desc: '+5V Power Supply' },
      { num: '3', name: 'V0', type: 'analog', desc: 'Contrast Adjustment (via Potentiometer)' },
      { num: '4', name: 'RS', type: 'input', desc: 'Register Select (0=Command, 1=Data)' },
      { num: '5', name: 'RW', type: 'input', desc: 'Read/Write (0=Write, 1=Read) - Usually grounded' },
      { num: '6', name: 'E', type: 'input', desc: 'Enable Signal' },
      { num: '7-14', name: 'D0-D7', type: 'data', desc: 'Data Bus Pins (D4-D7 used in 4-bit mode)' },
      { num: '15', name: 'A', type: 'power', desc: 'Backlight Anode (+5V)' },
      { num: '16', name: 'K', type: 'power', desc: 'Backlight Cathode (Ground)' },
    ]
  },
  'lm317': {
    name: 'LM317',
    desc: 'Adjustable Voltage Regulator (TO-220)',
    pins: [
      { num: '1', name: 'ADJ', type: 'analog', desc: 'Adjust Pin (Controls output voltage)' },
      { num: '2', name: 'VOUT', type: 'power', desc: 'Regulated Voltage Output' },
      { num: '3', name: 'VIN', type: 'power', desc: 'Input Voltage (Unregulated)' },
    ]
  },
  'dht11': {
    name: 'DHT11',
    desc: 'Temperature & Humidity Sensor (3 or 4-pin)',
    pins: [
      { num: '1', name: 'VCC', type: 'power', desc: '3.3V to 5V Supply' },
      { num: '2', name: 'DATA', type: 'data', desc: 'Serial Data Output (Needs 10k pull-up resistor)' },
      { num: '3', name: 'NC', type: 'analog', desc: 'Not Connected' },
      { num: '4', name: 'GND', type: 'power', desc: 'Ground' },
    ]
  },
  'a4988': {
    name: 'A4988',
    desc: 'Stepper Motor Driver Module',
    pins: [
      { num: 'VMOT', name: 'Motor VCC', type: 'power', desc: '8V - 35V Motor Power Supply (Needs capacitor)' },
      { num: 'GND', name: 'Motor GND', type: 'power', desc: 'Motor Ground' },
      { num: '2B, 2A', name: 'Coil 2', type: 'output', desc: 'Motor Coil 2 Connections' },
      { num: '1A, 1B', name: 'Coil 1', type: 'output', desc: 'Motor Coil 1 Connections' },
      { num: 'VDD', name: 'Logic VCC', type: 'power', desc: '3.3V - 5V Logic Supply' },
      { num: 'GND', name: 'Logic GND', type: 'power', desc: 'Logic Ground' },
      { num: 'DIR', name: 'Direction', type: 'input', desc: 'Rotation Direction (High/Low)' },
      { num: 'STEP', name: 'Step', type: 'input', desc: 'Step Clock (One pulse = one step)' },
      { num: 'SLP', name: 'Sleep', type: 'input', desc: 'Sleep Mode (Active Low)' },
      { num: 'RST', name: 'Reset', type: 'input', desc: 'Reset (Active Low) - Often bridged to SLP' },
      { num: 'MS3, MS2, MS1', name: 'Microstep', type: 'input', desc: 'Microstep Resolution Select Pins' },
      { num: 'EN', name: 'Enable', type: 'input', desc: 'Enable Output (Active Low)' },
    ]
  },
  'l7805': {
    name: 'L7805',
    desc: '5V Voltage Regulator (TO-220)',
    pins: [
      { num: '1', name: 'VIN', type: 'power', desc: 'Input Voltage (7V - 35V)' },
      { num: '2', name: 'GND', type: 'power', desc: 'Ground (Connected to heatsink tab)' },
      { num: '3', name: 'VOUT', type: 'power', desc: 'Regulated 5V Output' },
    ]
  },
  'mpu6050': {
    name: 'MPU6050',
    desc: '6-Axis Gyroscope & Accelerometer',
    pins: [
      { num: '1', name: 'VCC', type: 'power', desc: '3.3V to 5V Supply' },
      { num: '2', name: 'GND', type: 'power', desc: 'Ground' },
      { num: '3', name: 'SCL', type: 'data', desc: 'I2C Clock' },
      { num: '4', name: 'SDA', type: 'data', desc: 'I2C Data' },
      { num: '5', name: 'XDA', type: 'data', desc: 'Auxiliary I2C Data (For external sensors)' },
      { num: '6', name: 'XCL', type: 'data', desc: 'Auxiliary I2C Clock' },
      { num: '7', name: 'AD0', type: 'input', desc: 'I2C Address Select (Low = 0x68, High = 0x69)' },
      { num: '8', name: 'INT', type: 'output', desc: 'Interrupt Output' },
    ]
  },
  'ds3231': {
    name: 'DS3231 RTC',
    desc: 'Real-Time Clock Module',
    pins: [
      { num: '1', name: '32K', type: 'output', desc: '32.768 kHz Output' },
      { num: '2', name: 'SQW', type: 'output', desc: 'Square Wave / Interrupt Output' },
      { num: '3', name: 'SCL', type: 'data', desc: 'I2C Clock' },
      { num: '4', name: 'SDA', type: 'data', desc: 'I2C Data' },
      { num: '5', name: 'VCC', type: 'power', desc: '3.3V to 5V Supply' },
      { num: '6', name: 'GND', type: 'power', desc: 'Ground' },
    ]
  },
  'max7219': {
    name: 'MAX7219',
    desc: '8x8 LED Matrix Driver (SPI)',
    pins: [
      { num: '1', name: 'VCC', type: 'power', desc: '5V Supply' },
      { num: '2', name: 'GND', type: 'power', desc: 'Ground' },
      { num: '3', name: 'DIN', type: 'data', desc: 'Data In (MOSI)' },
      { num: '4', name: 'CS', type: 'input', desc: 'Chip Select / Load' },
      { num: '5', name: 'CLK', type: 'data', desc: 'Serial Clock (SCK)' },
    ]
  },
  'ws2812b': {
    name: 'WS2812B (NeoPixel)',
    desc: 'Addressable RGB LED (4-pin or 3-pin strip)',
    pins: [
      { num: '1', name: 'VDD / 5V', type: 'power', desc: '5V Supply' },
      { num: '2', name: 'DOUT', type: 'data', desc: 'Data Output (Connects to next LED DIN)' },
      { num: '3', name: 'VSS / GND', type: 'power', desc: 'Ground' },
      { num: '4', name: 'DIN', type: 'data', desc: 'Data Input (From MCU or previous DOUT)' },
    ]
  }
};

const TYPE_COLORS: Record<string, string> = {
  'power': '#FF3B30',
  'input': '#34C759',
  'output': '#007AFF',
  'analog': '#AF52DE',
  'data': '#FF9500'
};

export default function PinoutDetailScreen() {
  const params = useLocalSearchParams();
  const id = String(params.id);
  const router = useRouter();

  const data = PINOUT_DATA[id];

  if (!data) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={28} color="#007AFF" />
          </TouchableOpacity>
        </View>
        <Text style={{ textAlign: 'center', marginTop: 50 }}>Pinout data not found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F2F2F7" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={28} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{data.name}</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.infoCard}>
          <MaterialCommunityIcons name="chip" size={48} color="#AF52DE" />
          <Text style={styles.infoName}>{data.name}</Text>
          <Text style={styles.infoDesc}>{data.desc}</Text>
        </View>

        <Text style={styles.sectionTitle}>Pin Configuration</Text>
        
        {data.pins.map((pin, index) => (
          <View key={index} style={styles.pinCard}>
            <View style={[styles.pinBadge, { backgroundColor: TYPE_COLORS[pin.type] || '#8E8E93' }]}>
              <Text style={styles.pinNum}>{pin.num}</Text>
            </View>
            <View style={styles.pinContent}>
              <Text style={styles.pinName}>{pin.name}</Text>
              <Text style={styles.pinDesc}>{pin.desc}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
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
  infoCard: { backgroundColor: '#fff', borderRadius: 16, padding: 20, alignItems: 'center', marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  infoName: { fontSize: 22, fontWeight: 'bold', color: '#1C1C1E', marginTop: 12 },
  infoDesc: { fontSize: 15, color: '#8E8E93', marginTop: 4 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1C1C1E', marginBottom: 12, marginLeft: 4 },
  pinCard: { backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 8, flexDirection: 'row', alignItems: 'center' },
  pinBadge: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  pinNum: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  pinContent: { flex: 1 },
  pinName: { fontSize: 16, fontWeight: '700', color: '#1C1C1E', marginBottom: 2 },
  pinDesc: { fontSize: 14, color: '#8E8E93' }
});
