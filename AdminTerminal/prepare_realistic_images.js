const fs = require('fs');
const path = require('path');

const ARTIFACTS_DIR = 'C:\\Users\\prane\\.gemini\\antigravity\\brain\\07be8adb-0f79-4638-9b46-8ab8400ab4e0';
const UPLOADS_DIR = path.join(__dirname, 'uploads');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR);
}

// Ensure the directory is clean
const existingFiles = fs.readdirSync(UPLOADS_DIR);
for (const file of existingFiles) {
  fs.unlinkSync(path.join(UPLOADS_DIR, file));
}

const baseImages = {
  dip14: 'dip14_logic_chip_1778688202600.png',
  dip8: 'dip8_chip_1778688218395.png',
  dip40: 'dip40_microcontroller_1778688231946.png',
  to220: 'to220_regulator_1778688245808.png',
  axial: 'axial_resistor_1778688260211.png',
  pot: 'potentiometer_1778688275532.png',
  esp: 'esp8266_module_1778688306491.png',
  l298n: 'l298n_driver_1778688323514.png',
  smd: 'smd_resistor_1778688338687.png',
  trimmer: 'trimmer_resistor_1778688356769.png'
};

const IC_NAMES = [
  // 14/16-pin Logic
  { name: '7400', base: 'dip14' }, { name: '7402', base: 'dip14' }, { name: '7404', base: 'dip14' }, 
  { name: '7408', base: 'dip14' }, { name: '7414', base: 'dip14' }, { name: '7432', base: 'dip14' }, 
  { name: '7447', base: 'dip14' }, { name: '7473', base: 'dip14' }, { name: '7474', base: 'dip14' }, 
  { name: '7486', base: 'dip14' }, { name: '7490', base: 'dip14' }, { name: '74138', base: 'dip14' }, 
  { name: '74165', base: 'dip14' }, { name: '74595', base: 'dip14' },
  { name: '4001', base: 'dip14' }, { name: '4011', base: 'dip14' }, { name: '4013', base: 'dip14' }, 
  { name: '4017', base: 'dip14' }, { name: '4026', base: 'dip14' }, { name: '4066', base: 'dip14' }, 
  { name: '4069', base: 'dip14' },
  // DIP-8/16 general
  { name: 'NE555', base: 'dip8' }, { name: 'NE556', base: 'dip8' }, { name: 'CD4047', base: 'dip8' }, 
  { name: 'DS1307', base: 'dip8' }, { name: 'DS3231', base: 'dip8' },
  { name: 'LM741', base: 'dip8' }, { name: 'LM358', base: 'dip8' }, { name: 'LM324', base: 'dip8' }, 
  { name: 'TL071', base: 'dip8' }, { name: 'OP07', base: 'dip8' }, { name: 'LM311', base: 'dip8' }, 
  { name: 'LM339', base: 'dip8' },
  // Microcontrollers
  { name: 'ATmega328P', base: 'dip40' }, { name: 'ESP8266', base: 'esp' }, { name: 'STM32F103C8T6', base: 'dip40' }, 
  { name: 'PIC16F877A', base: 'dip40' }, { name: '6502', base: 'dip40' },
  // Power
  { name: '7805', base: 'to220' }, { name: 'LM317', base: 'to220' }, { name: 'AMS1117', base: 'to220' }, 
  { name: 'LM2596', base: 'to220' }, { name: 'TP4056', base: 'to220' },
  // Motor
  { name: 'L293D', base: 'l298n' }, { name: 'L298N', base: 'l298n' }, { name: 'ULN2003', base: 'dip14' }, 
  { name: 'A4988', base: 'l298n' },
  // Comm
  { name: 'MAX232', base: 'dip8' }, { name: 'MAX485', base: 'dip8' }, { name: 'CH340G', base: 'dip8' }, 
  { name: 'MCP2515', base: 'dip8' }, { name: 'PCA9685', base: 'dip8' },
  // Data Conv
  { name: 'ADC0804', base: 'dip14' }, { name: 'MCP3008', base: 'dip14' }, { name: 'ADS1115', base: 'dip8' }, 
  { name: 'MCP4725', base: 'dip8' },
  // Opto
  { name: 'PC817', base: 'dip8' }, { name: '4N25', base: 'dip8' }, { name: 'MOC3021', base: 'dip8' },
  // Audio
  { name: 'LM386', base: 'dip8' }, { name: 'TDA2030', base: 'to220' }, { name: 'PAM8403', base: 'dip8' }, 
  { name: 'PT2399', base: 'dip8' },
  // Memory
  { name: 'AT24C256', base: 'dip8' }, { name: 'W25Q128', base: 'dip8' }
];

const RESISTOR_NAMES = [
  { name: 'Resistor_CarbonComp', base: 'axial' },
  { name: 'Resistor_CarbonFilm', base: 'axial' },
  { name: 'Resistor_MetalFilm', base: 'axial' },
  { name: 'Resistor_MetalOxide', base: 'axial' },
  { name: 'Resistor_WireWound', base: 'axial' },
  { name: 'Resistor_ThickFilm', base: 'axial' },
  { name: 'Resistor_ThinFilm', base: 'axial' },
  { name: 'Resistor_SMD', base: 'smd' },
  { name: 'Resistor_Potentiometer', base: 'pot' },
  { name: 'Resistor_Rheostat', base: 'pot' },
  { name: 'Resistor_Trimmer', base: 'trimmer' },
  { name: 'Resistor_Varistor', base: 'axial' },
  { name: 'Resistor_Magneto', base: 'axial' },
  { name: 'Resistor_Strain', base: 'axial' }
];

let count = 0;
for (const item of [...IC_NAMES, ...RESISTOR_NAMES]) {
  const sourcePath = path.join(ARTIFACTS_DIR, baseImages[item.base]);
  const destName = item.name.replace(/[^a-zA-Z0-9_]/g, '') + '.png'; // Added _ for Resistor_ prefix
  const destPath = path.join(UPLOADS_DIR, destName);
  
  if (fs.existsSync(sourcePath)) {
    fs.copyFileSync(sourcePath, destPath);
    count++;
  } else {
    console.error('Source not found:', sourcePath);
  }
}

console.log('Successfully copied', count, 'realistic images to uploads folder.');
