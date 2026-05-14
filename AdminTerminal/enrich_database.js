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

// The Massive Heuristic Engine
function enrichComponent(cat, name) {
  const n = name.toLowerCase();
  
  let useCases = [];
  let specifications = [];
  let packageTypes = [];
  let identification = "";

  // ====================== RESISTORS ======================
  if (cat === 'resistors') {
    packageTypes = ["Axial Leaded", "SMD (0805, 1206, 0603)", "Radial"];
    identification = "Read the colored bands painted on the body (e.g., Brown-Black-Red = 1kΩ) or read the 3/4 digit code on SMD variants.";
    if (n.includes('potentiometer') || n.includes('trimmer')) {
      useCases = ["Volume control", "Sensor calibration", "User interface dials"];
      specifications = [{ label: "Resistance Range", value: "Variable" }, { label: "Tolerance", value: "±20%" }];
      identification = "Features a rotatable shaft or a small screw slot for adjustment.";
    } else if (n.includes('power') || n.includes('wirewound')) {
      useCases = ["Current sensing", "Motor speed control", "Power dissipation"];
      specifications = [{ label: "Power Rating", value: "5W - 100W" }, { label: "Tolerance", value: "±5%" }];
      identification = "Large, blocky ceramic body or large cylindrical wire-wrapped body.";
    } else {
      useCases = ["Current limiting for LEDs", "Voltage dividers", "Pull-up / Pull-down for logic"];
      specifications = [{ label: "Power Rating", value: "1/4 Watt (0.25W)" }, { label: "Tolerance", value: "±5% or ±1%" }];
    }
  }

  // ====================== CAPACITORS ======================
  else if (cat === 'capacitors') {
    useCases = ["Power supply smoothing", "Signal coupling/decoupling", "Timing circuits"];
    if (n.includes('electrolytic')) {
      packageTypes = ["Cylindrical Can", "SMD Can"];
      specifications = [{ label: "Polarized", value: "Yes" }, { label: "Typical Capacitance", value: "1µF - 10000µF" }, { label: "Tolerance", value: "±20%" }];
      identification = "Look for the light-colored stripe with negative (-) symbols running down the side of the cylinder. The longer lead is positive.";
    } else if (n.includes('ceramic') || n.includes('mlcc')) {
      packageTypes = ["Through-hole Disc", "SMD MLCC"];
      specifications = [{ label: "Polarized", value: "No" }, { label: "Typical Capacitance", value: "10pF - 100nF" }, { label: "Tolerance", value: "±10%" }];
      identification = "Small brown/blue discs with a 3-digit number code (e.g., 104 = 100nF). MLCCs are tiny beige surface-mount blocks usually without any text.";
      useCases = ["High-frequency noise filtering", "RF tuning"];
    } else if (n.includes('film') || n.includes('mylar')) {
      packageTypes = ["Box", "Dipped"];
      specifications = [{ label: "Polarized", value: "No" }, { label: "Dielectric", value: "Polyester / Polypropylene" }];
      identification = "Often colorful rectangular plastic boxes (red, green, blue) with printing on top.";
    } else if (n.includes('tantalum')) {
      packageTypes = ["Resin Dipped", "SMD Molded"];
      specifications = [{ label: "Polarized", value: "Yes" }, { label: "ESR", value: "Very Low" }];
      identification = "Distinctive yellow or orange teardrop shape. IMPORTANT: The stripe or plus sign marks the POSITIVE lead, unlike electrolytics!";
    } else if (n.includes('super')) {
      specifications = [{ label: "Capacitance", value: "0.1F - 3000F" }, { label: "Voltage", value: "2.7V - 5.5V" }];
      useCases = ["RTC memory backup", "Burst power delivery", "Battery replacement"];
      identification = "Looks like a very thick coin-cell battery or a massive double-cylinder.";
    }
  }

  // ====================== TRANSISTORS ======================
  else if (cat === 'transistors') {
    packageTypes = ["TO-92", "TO-220", "SOT-23", "D2PAK"];
    if (n.includes('mosfet') || n.includes('fet')) {
      useCases = ["High-speed, high-current digital switching", "Motor drivers", "Level shifting"];
      specifications = [{ label: "Type", value: n.includes('p-channel') ? "P-Channel" : "N-Channel" }, { label: "Control", value: "Voltage Controlled (Gate)" }];
      identification = "Terminals are Gate, Drain, Source. Power variants are usually large black rectangles with a metal mounting tab (TO-220).";
    } else {
      useCases = ["General purpose amplification", "Low-current digital switching", "Relay driving"];
      specifications = [{ label: "Type", value: n.includes('pnp') ? "PNP" : "NPN" }, { label: "Control", value: "Current Controlled (Base)" }];
      identification = "Terminals are Base, Collector, Emitter. Often found in tiny half-cylinder black plastic packages (TO-92).";
    }
  }

  // ====================== DIODES & LEDs ======================
  else if (cat === 'diodes') {
    if (n.includes('led') || n.includes('display') || n.includes('segment')) {
      packageTypes = ["3mm / 5mm Through-Hole", "SMD 0805", "COB"];
      useCases = ["Visual status indication", "Illumination", "User interfaces"];
      specifications = [{ label: "Forward Voltage (Vf)", value: "1.8V - 3.3V (varies by color)" }, { label: "Max Current", value: "20mA (Standard)" }];
      identification = "The longer lead is the Anode (+). The flat edge on the plastic rim indicates the Cathode (-).";
    } else if (n.includes('zener')) {
      packageTypes = ["DO-35 (Glass)", "SMA"];
      useCases = ["Voltage regulation", "Overvoltage clamping", "Reference voltage generation"];
      specifications = [{ label: "Operating Mode", value: "Reverse Bias Breakdown" }];
      identification = "Small transparent glass tube with a red/orange core and a black stripe marking the cathode.";
    } else if (n.includes('schottky')) {
      useCases = ["Switch-mode power supplies", "Reverse polarity protection", "RF detection"];
      specifications = [{ label: "Forward Voltage Drop", value: "0.15V - 0.45V" }];
      identification = "Usually a black cylinder with a silver stripe marking the cathode. The symbol printed on it will help distinguish it from a standard PN diode.";
    } else {
      packageTypes = ["DO-41", "SMA"];
      useCases = ["AC to DC Rectification", "Flyback protection for relays/motors", "Logic steering"];
      specifications = [{ label: "Forward Voltage Drop", value: "0.7V" }, { label: "Polarized", value: "Yes" }];
      identification = "Black cylinder with a highly visible silver or white stripe on one end. The stripe marks the Cathode (Negative).";
    }
  }

  // ====================== INTEGRATED CIRCUITS ======================
  else if (cat === 'Integrated Circuits' || cat === 'ics') {
    packageTypes = ["DIP-8 / DIP-14", "SOIC", "QFP", "BGA"];
    if (n.includes('555')) {
      useCases = ["Blinking LEDs", "PWM generation", "Tone generation", "Time delays"];
      specifications = [{ label: "Voltage", value: "4.5V - 15V" }, { label: "Max Output Current", value: "200mA" }];
      identification = "Look for the notch or dimple on one end. Pin 1 is the top-left pin when the notch is facing up.";
    } else if (n.includes('microcontroller') || n.includes('atmega')) {
      useCases = ["Executing code", "Reading sensors", "Controlling complex systems"];
      specifications = [{ label: "Architecture", value: "8-bit / 32-bit" }, { label: "Programmable", value: "Yes" }];
    } else if (n.includes('regulator') || n.includes('7805')) {
      packageTypes = ["TO-220", "SOT-223"];
      useCases = ["Stepping down voltage", "Powering 5V microcontrollers from 12V batteries"];
      specifications = [{ label: "Type", value: "Linear Regulator" }, { label: "Heat Dissipation", value: "High (requires heatsink)" }];
      identification = "Looks like a power transistor. The metal tab is often internally connected to the middle pin (GND).";
    } else {
      useCases = ["Digital logic processing", "Signal conditioning", "Data buffering"];
      specifications = [{ label: "Operating Voltage", value: "Varies (typically 3.3V or 5V)" }];
      identification = "Standard black chip with legs. The half-moon notch or small dot always indicates the location of Pin 1.";
    }
  }

  // ====================== LOGIC GATES ======================
  else if (cat === 'logic') {
    packageTypes = ["DIP-14", "SOIC-14"];
    useCases = ["Digital logic synthesis", "Address decoding", "Signal inversion"];
    specifications = [{ label: "Technology", value: "TTL (74LS) or CMOS (74HC)" }, { label: "Operating Voltage", value: "5V (TTL) / 2V-6V (CMOS)" }, { label: "Gates per Chip", value: "Usually 4 (Quad 2-Input)" }];
    identification = "14-pin black chip. A '74LS' marking means TTL, '74HC' means High-speed CMOS.";
  }

  // ====================== SENSORS ======================
  else if (cat === 'sensors') {
    packageTypes = ["PCB Module", "Breakout Board", "Bare Component"];
    useCases = ["Environment monitoring", "Robotics navigation", "Human input detection"];
    specifications = [{ label: "Output Type", value: n.includes('switch') ? "Digital" : "Analog / I2C / SPI" }, { label: "Voltage", value: "3.3V - 5V" }];
    identification = "Often mounted on a blue or green printed circuit board with labeled header pins (VCC, GND, OUT).";
  }

  // Fallback
  if (useCases.length === 0) useCases = ["General electronics prototyping", "PCB integration"];
  if (specifications.length === 0) specifications = [{ label: "Mounting Type", value: "Through-Hole / SMD" }];
  if (!identification) identification = "Refer to the manufacturer's datasheet for specific pinout diagrams and package markings.";

  return { useCases, specifications, packageTypes, identification };
}

async function enrichDatabase() {
  console.log('🚀 Booting AI Heuristic Enrichment Engine...');
  const snapshot = await db.collection('components').get();
  
  const batch = db.batch();
  let count = 0;

  snapshot.forEach(doc => {
    const data = doc.data();
    const enriched = enrichComponent(data.categoryId, data.name);
    
    batch.update(doc.ref, {
      useCases: enriched.useCases,
      specifications: enriched.specifications,
      packageTypes: enriched.packageTypes,
      identification: enriched.identification
    });
    count++;
  });

  await batch.commit();
  console.log(`✅ ENRICHMENT COMPLETE! Upgraded ${count} components with deep technical specifications!`);
}

enrichDatabase();
