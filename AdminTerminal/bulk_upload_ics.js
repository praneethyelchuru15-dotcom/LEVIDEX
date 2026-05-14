const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// 1. Point the script to the private master key
let serviceAccount;
try {
  serviceAccount = require('./serviceAccountKey.json');
} catch (e) {
  console.error("❌ ERROR: You must download your Service Account Key from Firebase and place it in this folder named 'serviceAccountKey.json'!");
  process.exit(1);
}

// 2. Authenticate as the Master Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const IC_DATA = [
  // 1. 7400 Series
  { name: '7400', subCategory: '7400-series', description: 'Quad 2-input NAND gate. TTL logic.', symbol: 'NAND' },
  { name: '7402', subCategory: '7400-series', description: 'Quad 2-input NOR gate. TTL logic.', symbol: 'NOR' },
  { name: '7404', subCategory: '7400-series', description: 'Hex Inverter (NOT gate). TTL logic.', symbol: 'NOT' },
  { name: '7408', subCategory: '7400-series', description: 'Quad 2-input AND gate. TTL logic.', symbol: 'AND' },
  { name: '7414', subCategory: '7400-series', description: 'Hex Schmitt-trigger Inverter. TTL logic with noise immunity.', symbol: 'NOT' },
  { name: '7432', subCategory: '7400-series', description: 'Quad 2-input OR gate. TTL logic.', symbol: 'OR' },
  { name: '7447', subCategory: '7400-series', description: 'BCD to 7-segment decoder/driver for common-anode displays.', symbol: 'Decoder' },
  { name: '7473', subCategory: '7400-series', description: 'Dual J-K Flip-Flop with clear.', symbol: 'JK FF' },
  { name: '7474', subCategory: '7400-series', description: 'Dual D Positive Edge Triggered Flip-Flop.', symbol: 'D-FF' },
  { name: '7486', subCategory: '7400-series', description: 'Quad 2-input XOR gate. TTL logic.', symbol: 'XOR' },
  { name: '7490', subCategory: '7400-series', description: 'Decade Counter (mod-2 and mod-5).', symbol: 'Counter' },
  { name: '74138', subCategory: '7400-series', description: '3-to-8 line Decoder/Demultiplexer.', symbol: 'Decoder' },
  { name: '74165', subCategory: '7400-series', description: '8-bit Parallel-In/Serial-Out Shift Register.', symbol: 'Shift Reg' },
  { name: '74595', subCategory: '7400-series', description: '8-bit Serial-In/Parallel-Out Shift Register.', symbol: 'Shift Reg' },

  // 2. 4000 Series
  { name: '4001', subCategory: '4000-series', description: 'Quad 2-input NOR gate. CMOS logic.', symbol: 'NOR' },
  { name: '4011', subCategory: '4000-series', description: 'Quad 2-input NAND gate. CMOS logic.', symbol: 'NAND' },
  { name: '4013', subCategory: '4000-series', description: 'Dual D-type Flip-Flop.', symbol: 'D-FF' },
  { name: '4017', subCategory: '4000-series', description: 'Decade Counter / Divider with 10 decoded outputs.', symbol: 'Counter' },
  { name: '4026', subCategory: '4000-series', description: 'Decade Counter with 7-segment display driver.', symbol: 'Counter' },
  { name: '4066', subCategory: '4000-series', description: 'Quad Bilateral Switch. Used for analog/digital switching.', symbol: 'Switch' },
  { name: '4069', subCategory: '4000-series', description: 'Hex Inverter. CMOS logic.', symbol: 'NOT' },

  // 3. Timers & RTC
  { name: 'NE555', subCategory: 'timers-rtc', description: 'Single Timer / Oscillator. Monostable and Astable modes.', symbol: 'Timer' },
  { name: 'NE556', subCategory: 'timers-rtc', description: 'Dual 555 Timer in one package.', symbol: 'Dual Timer' },
  { name: 'CD4047', subCategory: 'timers-rtc', description: 'Astable/Monostable Multivibrator.', symbol: 'Multivib' },
  { name: 'DS1307', subCategory: 'timers-rtc', description: 'I2C Real-Time Clock (Legacy). Keeps time with battery backup.', symbol: 'RTC' },
  { name: 'DS3231', subCategory: 'timers-rtc', description: 'Highly Accurate I2C Real-Time Clock with integrated crystal.', symbol: 'RTC' },

  // 4. Op-Amps
  { name: 'LM741', subCategory: 'op-amps', description: 'Single General Purpose Op-Amp (Classic).', symbol: 'Op-Amp' },
  { name: 'LM358', subCategory: 'op-amps', description: 'Dual Low-Power Op-Amp.', symbol: 'Dual Op-Amp' },
  { name: 'LM324', subCategory: 'op-amps', description: 'Quad Low-Power Op-Amp.', symbol: 'Quad Op-Amp' },
  { name: 'TL071', subCategory: 'op-amps', description: 'JFET-Input Low-Noise Op-Amp (Audio).', symbol: 'Op-Amp' },
  { name: 'OP07', subCategory: 'op-amps', description: 'Ultra-low offset voltage Op-Amp.', symbol: 'Precision Op' },
  { name: 'LM311', subCategory: 'op-amps', description: 'Single Voltage Comparator.', symbol: 'Comp' },
  { name: 'LM339', subCategory: 'op-amps', description: 'Quad Voltage Comparator.', symbol: 'Quad Comp' },

  // 5. Microcontrollers
  { name: 'ATmega328P', subCategory: 'microcontrollers', description: 'AVR 8-bit MCU. Used in Arduino Uno.', symbol: 'MCU' },
  { name: 'ESP8266', subCategory: 'microcontrollers', description: 'Wi-Fi SoC with TCP/IP stack.', symbol: 'Wi-Fi MCU' },
  { name: 'STM32F103C8T6', subCategory: 'microcontrollers', description: 'ARM Cortex-M3 MCU ("Blue Pill").', symbol: 'ARM MCU' },
  { name: 'PIC16F877A', subCategory: 'microcontrollers', description: '8-bit Microchip PIC MCU.', symbol: 'PIC MCU' },
  { name: '6502', subCategory: 'microcontrollers', description: 'Vintage 8-bit CPU used in Apple II and NES.', symbol: 'CPU' },

  // 6. Power Management
  { name: '7805', subCategory: 'power-management', description: 'Linear Regulator (Fixed 5V).', symbol: 'Regulator' },
  { name: 'LM317', subCategory: 'power-management', description: 'Linear Regulator (Adjustable Positive).', symbol: 'Regulator' },
  { name: 'AMS1117', subCategory: 'power-management', description: 'Low Dropout Regulator (LDO). Common for 3.3V.', symbol: 'LDO' },
  { name: 'LM2596', subCategory: 'power-management', description: 'Switching Regulator (Buck converter).', symbol: 'Buck' },
  { name: 'TP4056', subCategory: 'power-management', description: 'Linear Li-Ion Battery Charger IC.', symbol: 'Charger' },

  // 7. Motor & Relay Drivers
  { name: 'L293D', subCategory: 'motor-relay', description: 'Dual H-Bridge Motor Driver with internal diodes.', symbol: 'Motor Drv' },
  { name: 'L298N', subCategory: 'motor-relay', description: 'Dual H-Bridge Motor Driver (High current).', symbol: 'Motor Drv' },
  { name: 'ULN2003', subCategory: 'motor-relay', description: '7-channel Darlington Transistor Array.', symbol: 'Driver' },
  { name: 'A4988', subCategory: 'motor-relay', description: 'Stepper Motor Driver IC.', symbol: 'Step Drv' },

  // 8. Communication
  { name: 'MAX232', subCategory: 'communications', description: 'RS-232 to TTL Logic level converter.', symbol: 'Level Conv' },
  { name: 'MAX485', subCategory: 'communications', description: 'RS-485 transceiver.', symbol: 'RS-485' },
  { name: 'CH340G', subCategory: 'communications', description: 'USB to UART Bridge controller.', symbol: 'USB-Serial' },
  { name: 'MCP2515', subCategory: 'communications', description: 'Stand-alone CAN controller (SPI).', symbol: 'CAN' },
  { name: 'PCA9685', subCategory: 'communications', description: '16-channel, 12-bit PWM controller (I2C).', symbol: 'PWM Ctrl' },

  // 9. Data Converters
  { name: 'ADC0804', subCategory: 'data-converters', description: '8-bit Analog-to-Digital Converter (Parallel).', symbol: 'ADC' },
  { name: 'MCP3008', subCategory: 'data-converters', description: '8-channel 10-bit ADC (SPI).', symbol: 'ADC' },
  { name: 'ADS1115', subCategory: 'data-converters', description: '16-bit ADC (I2C interface, high precision).', symbol: 'ADC' },
  { name: 'MCP4725', subCategory: 'data-converters', description: '12-bit Digital-to-Analog Converter (I2C).', symbol: 'DAC' },

  // 10. Optocouplers
  { name: 'PC817', subCategory: 'optocouplers', description: 'Single channel, general purpose optocoupler.', symbol: 'Opto' },
  { name: '4N25', subCategory: 'optocouplers', description: 'Optocoupler with phototransistor output.', symbol: 'Opto' },
  { name: 'MOC3021', subCategory: 'optocouplers', description: 'Optoisolator with Triac driver output.', symbol: 'Opto-Triac' },

  // 11. Audio ICs
  { name: 'LM386', subCategory: 'audio-ics', description: 'Low Voltage Audio Power Amplifier.', symbol: 'Audio Amp' },
  { name: 'TDA2030', subCategory: 'audio-ics', description: '14W Hi-Fi Audio Amplifier.', symbol: 'Audio Amp' },
  { name: 'PAM8403', subCategory: 'audio-ics', description: '3W Class-D Digital Audio Amplifier.', symbol: 'Digital Amp' },
  { name: 'PT2399', subCategory: 'audio-ics', description: 'Digital Echo / Reverb Processor.', symbol: 'Echo proc' },

  // 12. Memory ICs
  { name: 'AT24C256', subCategory: 'memory-ics', description: '256K-bit I2C Serial EEPROM.', symbol: 'EEPROM' },
  { name: 'W25Q128', subCategory: 'memory-ics', description: '128M-bit Serial Flash Memory (SPI).', symbol: 'Flash' },
];

async function upload() {
  console.log("Starting bulk IC upload...");
  let count = 0;
  for (const ic of IC_DATA) {
    try {
      const imageKeyName = ic.name.replace(/[^a-zA-Z0-9]/g, '');
      await db.collection("components").add({
        ...ic,
        imageKey: imageKeyName + '.png',
        categoryId: "ics",
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log(`Uploaded: ${ic.name}`);
      count++;
    } catch (e) {
      console.error(`Error uploading ${ic.name}:`, e);
    }
  }
  console.log(`Success! Uploaded ${count} components.`);
}

upload().then(() => process.exit(0)).catch(console.error);
