const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const serviceAccount = require('../AdminTerminal/serviceAccountKey.json');

initializeApp({
  credential: cert(serviceAccount),
  projectId: 'levidex'
});

const db = getFirestore();

const updates = [
  { name: 'Flat Cable', imageKey: 'flat_cable' },
  { name: 'Single Board Computer', imageKey: 'single_board_computer' },
  { name: 'Inductor Array', imageKey: 'inductor_array' },
  { name: 'Toroidal Transformer', imageKey: 'toroidal_transformer' },
  { name: 'Hook Up Wire', imageKey: 'hook_up_wire' },
  { name: 'Balun Transformer', imageKey: 'balun_transformer' },
  { name: 'FPGA Development Board', imageKey: 'fpga_development_board' },
  { name: 'Breadboard Power Module', imageKey: 'breadboard_power_module' },
  { name: '1kΩ Resistor', imageKey: '1k_resistor' },
  { name: 'MSP430 Development Board', imageKey: 'msp430_development_board' },
  { name: 'Antenna Coil', imageKey: 'antenna_coil' },
  { name: 'Industrial SBC', imageKey: 'industrial_sbc' }
];

async function updateDB() {
  const batch = db.batch();
  for (const item of updates) {
    const snapshot = await db.collection('components').where('name', '==', item.name).get();
    snapshot.forEach(doc => {
      batch.update(doc.ref, {
        imageKey: item.imageKey,
        imageUrl: `/assets/images/${item.imageKey}.png`
      });
    });
  }
  await batch.commit();
  console.log("Updated 12 components successfully.");
}

updateDB().catch(console.error);
