const admin = require('firebase-admin');

// 1. Authenticate with Service Account
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

// 2. The massive 44-item capacitor list
const CAPACITORS = [
  // Ceramic Capacitors
  { name: 'Ceramic Disc Capacitor', desc: 'A common non-polarized capacitor used for decoupling and filtering high frequencies.' },
  { name: 'Multilayer Ceramic Capacitor (MLCC)', desc: 'Extremely popular tiny SMD capacitor featuring multiple alternating layers of ceramic and metal.' },
  { name: 'Tubular Ceramic Capacitor', desc: 'An older style of ceramic capacitor shaped like a small tube, often used in RF circuits.' },
  { name: 'Microwave Bare Lead-less Disc Ceramic', desc: 'Specialized lead-less ceramic capacitor designed for extreme high-frequency microwave applications.' },

  // Film & Plastic Capacitors
  { name: 'Polyester Film Capacitor (PET / Mylar)', desc: 'Very common, inexpensive film capacitor (often green/red) used in general-purpose circuits.' },
  { name: 'Polypropylene Film Capacitor (PP)', desc: 'High-precision film capacitor with low dielectric absorption, ideal for audio and high-frequency.' },
  { name: 'Polystyrene Film Capacitor (PS)', desc: 'Highly stable film capacitor used in precise timing and filter circuits.' },
  { name: 'Polycarbonate Film Capacitor (PC)', desc: 'Film capacitor known for high stability over a wide temperature range.' },
  { name: 'Polyphenylene Sulfide Film Capacitor (PPS)', desc: 'High-temperature SMD film capacitor, often used as a replacement for polycarbonate.' },
  { name: 'Polyethylene Naphthalate Film Capacitor (PEN)', desc: 'High-temperature SMD film capacitor used in automotive and industrial electronics.' },
  { name: 'Polytetrafluoroethylene Film Capacitor (PTFE)', desc: 'Teflon capacitor offering the lowest dielectric absorption and highest insulation resistance.' },
  { name: 'Polyimide Film Capacitor (Kapton)', desc: 'Specialized capacitor capable of withstanding extreme temperatures.' },

  // Electrolytic Capacitors (Polarized)
  { name: 'Aluminum Electrolytic Capacitor (Wet)', desc: 'Very common polarized capacitor with high capacitance, used heavily in power supply filtering.' },
  { name: 'Aluminum Polymer Solid Capacitor', desc: 'Low-ESR solid polymer capacitor, immune to the drying-out issues of wet electrolytic caps.' },
  { name: 'Tantalum Electrolytic Capacitor (Dry)', desc: 'Polarized capacitor offering very high capacitance in a tiny yellow/orange drop package.' },
  { name: 'Tantalum Electrolytic Capacitor (Wet)', desc: 'Specialized high-reliability capacitor used in military and aerospace applications.' },
  { name: 'Polymer Tantalum Capacitor', desc: 'A Tantalum capacitor with a conductive polymer cathode for extremely low ESR.' },
  { name: 'Niobium Oxide Electrolytic Capacitor', desc: 'Similar to tantalum but using niobium oxide, offering lower ignition risk upon failure.' },

  // Variable & Adjustable Capacitors
  { name: 'Air-Gap Tuning Capacitor', desc: 'Variable capacitor using air as a dielectric between overlapping metal plates, used in radio tuning.' },
  { name: 'Vacuum Variable Capacitor', desc: 'Variable capacitor enclosed in a vacuum glass envelope, used in high-power RF transmitters.' },
  { name: 'Ceramic Trimmer Capacitor', desc: 'Small variable capacitor adjusted with a screwdriver, used for fine-tuning circuits.' },
  { name: 'Mica Trimmer Capacitor', desc: 'Highly stable trimmer capacitor using mica sheets, used in precise RF applications.' },
  { name: 'Film Trimmer Capacitor', desc: 'Trimmer capacitor using plastic film, offering a larger capacitance range than ceramic.' },
  { name: 'Varactor Diode (Varicap)', desc: 'A semiconductor diode whose capacitance changes depending on the applied reverse voltage.' },

  // Supercapacitors
  { name: 'Electric Double-Layer Capacitor (EDLC)', desc: 'Standard supercapacitor offering immense capacitance (measured in Farads) for energy storage.' },
  { name: 'Pseudocapacitor', desc: 'Supercapacitor that stores energy electrochemically rather than purely electrostatically.' },
  { name: 'Lithium-Ion Capacitor', desc: 'Hybrid supercapacitor combining EDLC features with lithium-ion battery technology for higher voltage.' },

  // Mica, Glass & Paper
  { name: 'Silver Mica Capacitor', desc: 'Highly precise, stable, and low-loss capacitor used in sensitive RF and oscillator circuits.' },
  { name: 'Glass Capacitor', desc: 'Extremely rugged capacitor immune to moisture and nuclear radiation, used in aerospace.' },
  { name: 'Metalized Paper Capacitor', desc: 'An older technology using oil-impregnated paper, often found in vintage audio gear.' },
  { name: 'Oil-Impregnated Paper Capacitor (PIO)', desc: 'Classic capacitor prized by audiophiles for high-end tube amplifier restoration.' },

  // Other Fixed
  { name: 'Silicon Capacitor', desc: 'Microscopic capacitor built directly onto a silicon wafer, used in extremely high-density RF ICs.' },
  { name: 'Vacuum Capacitor (Fixed)', desc: 'Fixed capacitor inside a vacuum, capable of handling immense RF voltages and currents.' },

  // Application-Specific & Structural
  { name: 'Safety Capacitor (Class X1/X2)', desc: 'Failsafe capacitor connected across the AC line, designed not to short-circuit upon failure.' },
  { name: 'Safety Capacitor (Class Y1/Y2)', desc: 'Failsafe capacitor connected between AC line and ground, preventing lethal shock hazards.' },
  { name: 'Motor Start Capacitor', desc: 'High-capacitance non-polarized electrolytic used briefly to provide starting torque to AC motors.' },
  { name: 'Motor Run Capacitor', desc: 'Continuous-duty film capacitor used to improve power factor and running efficiency in AC motors.' },
  { name: 'Snubber Capacitor', desc: 'Heavy-duty capacitor used to absorb massive voltage spikes in power switching circuits.' },
  { name: 'Feedthrough Capacitor', desc: 'Coaxial capacitor designed to mount through a metal chassis, preventing RF noise from passing through.' },
  { name: 'DC-Link Capacitor', desc: 'Large film capacitor used to stabilize the intermediate DC bus in high-power inverters.' },
  { name: 'Audio Crossover Capacitor', desc: 'Non-polarized capacitor specifically selected for dividing frequencies in loudspeaker crossovers.' },
  { name: 'Lighting Ballast Capacitor', desc: 'High-voltage AC capacitor used to correct power factor in fluorescent and HID lighting fixtures.' },
  { name: 'SMD (Surface Mount) Capacitor', desc: 'Any capacitor packaged without leads, designed to be soldered directly to the surface of a PCB.' },
  { name: 'Axial Lead Capacitor', desc: 'A capacitor where the wire leads exit from opposite ends of the cylindrical body.' },
  { name: 'Radial Lead Capacitor', desc: 'A capacitor where both wire leads exit from the exact same side of the component.' }
];

async function uploadCapacitors() {
  console.log(`🚀 Commencing master database injection of ${CAPACITORS.length} Capacitor Types...`);
  const batch = db.batch();
  let count = 0;

  for (const cap of CAPACITORS) {
    const docRef = db.collection('components').doc();
    const imageKeyName = cap.name.replace(/[^a-zA-Z0-9_]/g, '_') + '.png'; // Secure filename
    
    batch.set(docRef, {
      name: cap.name,
      categoryId: "Capacitors",
      symbol: "-||-",
      description: cap.desc,
      imageKey: imageKeyName,
      imageUrl: "placeholder" 
    });
    count++;
  }

  await batch.commit();
  console.log(`✅ EPIC SUCCESS! All ${count} capacitors securely injected into the 'components' collection!`);
  
  // Write the exact generated filenames to a JSON file so we can map the temporary images
  const filenames = CAPACITORS.map(c => c.name.replace(/[^a-zA-Z0-9_]/g, '_') + '.png');
  const fs = require('fs');
  fs.writeFileSync('./capacitor_filenames.json', JSON.stringify(filenames, null, 2));
  console.log(`✅ Saved required filenames to capacitor_filenames.json for the image mapper script!`);
}

uploadCapacitors();
