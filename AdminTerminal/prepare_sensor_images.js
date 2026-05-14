const fs = require('fs');
const path = require('path');

const ARTIFACTS_DIR = 'C:\\Users\\prane\\.gemini\\antigravity\\brain\\07be8adb-0f79-4638-9b46-8ab8400ab4e0';
const UPLOADS_DIR = path.join(__dirname, 'uploads');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR);
}

// Note: we are NOT deleting existing files in uploads this time because we want to keep the ICs and resistors!
// We will just add the sensors.

const baseImages = {
  blue: 'blue_sensor_module_1778691854121.png',
  green: 'green_sensor_module_1778691870700.png',
  ultrasonic: 'ultrasonic_module_1778691886020.png',
  radial: 'radial_component_1778691901275.png',
  probe: 'metal_probe_1778691915695.png'
};

const SENSOR_NAMES = [
  // Blue Modules
  { name: 'Sensor_DHT11', base: 'blue' }, { name: 'Sensor_DHT22', base: 'blue' }, { name: 'Sensor_MQ2', base: 'blue' },
  { name: 'Sensor_MQ3', base: 'blue' }, { name: 'Sensor_MPU6050', base: 'blue' }, { name: 'Sensor_NEO6M', base: 'blue' },
  { name: 'Sensor_PM25', base: 'blue' }, { name: 'Sensor_TCS3200', base: 'blue' }, { name: 'Sensor_VL53L0X', base: 'blue' },
  
  // Green Modules
  { name: 'Sensor_ADXL335', base: 'green' }, { name: 'Sensor_AS608', base: 'green' }, { name: 'Sensor_BMP280', base: 'green' },
  { name: 'Sensor_Capacitive', base: 'green' }, { name: 'Sensor_ECG', base: 'green' }, { name: 'Sensor_Electret', base: 'green' },
  { name: 'Sensor_Flex', base: 'green' }, { name: 'Sensor_FSR', base: 'green' }, { name: 'Sensor_HallEffect', base: 'green' },
  { name: 'Sensor_HeartRate', base: 'green' }, { name: 'Sensor_HMC5883L', base: 'green' }, { name: 'Sensor_HX711', base: 'green' },
  { name: 'Sensor_Inductive', base: 'green' }, { name: 'Sensor_PIR', base: 'green' }, { name: 'Sensor_Rotary', base: 'green' },
  { name: 'Sensor_Soil', base: 'green' }, { name: 'Sensor_SoundLevel', base: 'green' }, { name: 'Sensor_TTP223', base: 'green' },
  { name: 'Sensor_UV', base: 'green' }, { name: 'Sensor_IR', base: 'green' }, { name: 'Sensor_LM35', base: 'green' },

  // Ultrasonic
  { name: 'Sensor_HCSR04', base: 'ultrasonic' },

  // Radial Components
  { name: 'Sensor_LDR', base: 'radial' }, { name: 'Sensor_Thermistor', base: 'radial' }, { name: 'Sensor_Tilt', base: 'radial' },
  { name: 'Sensor_Reed', base: 'radial' }, { name: 'Sensor_Photodiode', base: 'radial' },

  // Metal Probes
  { name: 'Sensor_DS18B20', base: 'probe' }, { name: 'Sensor_Thermocouple', base: 'probe' }
];

let count = 0;
for (const item of SENSOR_NAMES) {
  const sourcePath = path.join(ARTIFACTS_DIR, baseImages[item.base]);
  const destName = item.name + '.png';
  const destPath = path.join(UPLOADS_DIR, destName);
  
  if (fs.existsSync(sourcePath)) {
    fs.copyFileSync(sourcePath, destPath);
    count++;
  } else {
    console.error('Source not found:', sourcePath);
  }
}

console.log('Successfully copied', count, 'realistic sensor images to uploads folder.');
