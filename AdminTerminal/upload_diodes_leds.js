const admin = require('firebase-admin');

let serviceAccount;
try {
  serviceAccount = require('./serviceAccountKey.json');
} catch (e) {
  console.error("❌ ERROR: serviceAccountKey.json not found!");
  process.exit(1);
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

const COMPONENTS = [
  // ================= DIODES =================
  { name: "Standard PN Junction Diode", desc: "Allows current to flow in only one direction.", symbol: "D" },
  { name: "Schottky Diode", desc: "Diode with a very low forward voltage drop and extremely fast switching action.", symbol: "D" },
  { name: "Fast Recovery Diode", desc: "Rectifier diode that switches off much faster than a standard PN diode.", symbol: "D" },
  { name: "Ultra-Fast Recovery Diode", desc: "Diode optimized for the absolute fastest reverse recovery times in SMPS.", symbol: "D" },
  { name: "Bridge Rectifier", desc: "Array of four diodes arranged to provide full-wave rectification from an AC input.", symbol: "D" },
  { name: "Zener Diode", desc: "Allows current to flow backwards when a specific breakdown voltage is reached. Used for regulation.", symbol: "D" },
  { name: "Transient Voltage Suppression (TVS) Diode", desc: "Used to protect sensitive electronics from voltage spikes and ESD.", symbol: "D" },
  { name: "Avalanche Diode", desc: "Designed to safely operate in reverse breakdown mode without destruction.", symbol: "D" },
  { name: "Crowbar Diode", desc: "Overvoltage protection diode that intentionally short-circuits to blow a fuse.", symbol: "D" },
  { name: "Signal Diode", desc: "Small, fast diode used for processing low-current information signals.", symbol: "D" },
  { name: "Varactor Diode (Varicap)", desc: "Diode whose internal capacitance changes based on the reverse bias voltage.", symbol: "D" },
  { name: "PIN Diode", desc: "Features a wide intrinsic semiconductor region, used heavily as an RF switch.", symbol: "D" },
  { name: "Tunnel Diode (Esaki)", desc: "Capable of very fast operation into the microwave region due to quantum tunneling.", symbol: "D" },
  { name: "Gunn Diode", desc: "Used to generate microwave frequencies via the Gunn effect.", symbol: "D" },
  { name: "Step Recovery Diode", desc: "Generates extremely short pulses, used in microwave multipliers.", symbol: "D" },
  { name: "Backward Diode", desc: "A tunnel diode optimized to rectify very small signals.", symbol: "D" },
  { name: "Photodiode", desc: "Converts light directly into electrical current.", symbol: "D" },
  { name: "Laser Diode", desc: "Produces coherent laser light via stimulated emission.", symbol: "D" },
  { name: "Solar Cell", desc: "A large area photodiode designed specifically to generate power from sunlight.", symbol: "D" },

  // ================= LEDs =================
  { name: "Standard Indicator LED", desc: "Traditional through-hole 3mm, 5mm, or 10mm colored light indicator.", symbol: "LED" },
  { name: "Miniature / Subminiature LED", desc: "Tiny through-hole LED for tight spaces.", symbol: "LED" },
  { name: "SMD (Surface Mount) LED", desc: "Tiny chip LED soldered directly to the surface of a PCB.", symbol: "LED" },
  { name: "Super Bright / Ultra Bright LED", desc: "LED featuring highly transparent epoxy and advanced dies for intense brightness.", symbol: "LED" },
  { name: "COB (Chip on Board) LED", desc: "Multiple LED chips packaged directly onto a substrate for massive light output.", symbol: "LED" },
  { name: "High-Power LED", desc: "1W, 3W, or larger LEDs mounted on metal core PCBs or heatsinks for illumination.", symbol: "LED" },
  { name: "Filament LED", desc: "Vintage-style LED strips designed to look like traditional incandescent filaments.", symbol: "LED" },
  { name: "Bi-Color LED", desc: "Contains two different colored LED dies in a single package.", symbol: "LED" },
  { name: "Tri-Color LED", desc: "Contains three LED dies (often Red, Green, Blue) but lacks an integrated controller.", symbol: "LED" },
  { name: "RGB LED", desc: "Contains Red, Green, and Blue dies to mix millions of colors.", symbol: "LED" },
  { name: "RGBW LED", desc: "RGB LED that includes a dedicated pure White die for better color rendering.", symbol: "LED" },
  { name: "Addressable LED", desc: "RGB LED with a built-in microchip (e.g. WS2812B) allowing daisy-chain digital control.", symbol: "LED" },
  { name: "Flashing / Blinking LED", desc: "Standard LED with an integrated multivibrator chip that blinks automatically.", symbol: "LED" },
  { name: "Infrared LED (IR)", desc: "Emits invisible infrared light, heavily used in remote controls and night vision.", symbol: "LED" },
  { name: "Ultraviolet LED (UV)", desc: "Emits UV light, used for curing resins, counterfeit detection, and sterilization.", symbol: "LED" },
  { name: "7-Segment Display", desc: "Array of 7 LEDs arranged to display numeric digits.", symbol: "LED" },
  { name: "14-Segment / 16-Segment Display", desc: "Expanded array capable of displaying full alphanumeric characters.", symbol: "LED" },
  { name: "Dot Matrix Display", desc: "Grid of LEDs used to display complex graphics or scrolling text.", symbol: "LED" },
  { name: "LED Bar Graph", desc: "Row of distinct LEDs packaged together, often used for audio level meters.", symbol: "LED" }
];

async function run() {
  console.log(`🚀 Injecting ${COMPONENTS.length} Diodes & LEDs into Database...`);
  const batch = db.batch();
  let count = 0;

  for (const comp of COMPONENTS) {
    const docRef = db.collection('components').doc();
    const imageKeyName = comp.name.replace(/[^a-zA-Z0-9_]/g, '_') + '.png';
    
    batch.set(docRef, {
      name: comp.name,
      // We set categoryId to "diodes" (lowercase) to match home.tsx exact ID!
      categoryId: "diodes",
      symbol: comp.symbol,
      description: comp.desc,
      imageKey: imageKeyName,
      imageUrl: "placeholder"
    });
    count++;
  }

  await batch.commit();
  console.log(`✅ EPIC SUCCESS! All ${count} items securely injected!`);
}

run();
