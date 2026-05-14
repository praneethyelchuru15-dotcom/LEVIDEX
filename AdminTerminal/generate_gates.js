const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, '../ElectroGuide/assets/images/components');

const gates = {
  'XOR_Gate.png': `
    <svg width="200" height="120" xmlns="http://www.w3.org/2000/svg">
      <!-- inputs -->
      <path d="M 20,40 L 60,40" stroke="black" stroke-width="8" fill="none" stroke-linecap="round"/>
      <path d="M 20,80 L 60,80" stroke="black" stroke-width="8" fill="none" stroke-linecap="round"/>
      <!-- output -->
      <path d="M 152,60 L 195,60" stroke="black" stroke-width="8" fill="none" stroke-linecap="round"/>
      <!-- back curves -->
      <path d="M 45,20 Q 75,60 45,100" stroke="black" stroke-width="8" fill="none" stroke-linecap="round"/>
      <!-- main body -->
      <path d="M 60,20 Q 90,60 60,100 Q 115,100 155,60 Q 115,20 60,20 Z" stroke="black" stroke-width="8" fill="none" stroke-linejoin="round"/>
    </svg>`,

  'NOT_Gate.png': `
    <svg width="200" height="120" xmlns="http://www.w3.org/2000/svg">
      <path d="M 20,60 L 60,60" stroke="black" stroke-width="8" fill="none" stroke-linecap="round"/>
      <path d="M 160,60 L 195,60" stroke="black" stroke-width="8" fill="none" stroke-linecap="round"/>
      <!-- triangle -->
      <polygon points="60,20 60,100 135,60" stroke="black" stroke-width="8" fill="white" stroke-linejoin="round"/>
      <!-- circle -->
      <circle cx="147" cy="60" r="11" stroke="black" stroke-width="8" fill="white" />
    </svg>`,

  'NAND_Gate.png': `
    <svg width="200" height="120" xmlns="http://www.w3.org/2000/svg">
      <!-- inputs -->
      <path d="M 20,40 L 60,40" stroke="black" stroke-width="8" fill="none" stroke-linecap="round"/>
      <path d="M 20,80 L 60,80" stroke="black" stroke-width="8" fill="none" stroke-linecap="round"/>
      <!-- output -->
      <path d="M 160,60 L 195,60" stroke="black" stroke-width="8" fill="none" stroke-linecap="round"/>
      <!-- main body -->
      <path d="M 60,20 L 105,20 A 40 40 0 0 1 105 100 L 60,100 Z" stroke="black" stroke-width="8" fill="white" stroke-linejoin="round"/>
      <!-- circle -->
      <circle cx="156" cy="60" r="11" stroke="black" stroke-width="8" fill="white" />
    </svg>`,

  'NOR_Gate.png': `
    <svg width="200" height="120" xmlns="http://www.w3.org/2000/svg">
      <path d="M 20,40 L 70,40" stroke="black" stroke-width="8" fill="none" stroke-linecap="round"/>
      <path d="M 20,80 L 70,80" stroke="black" stroke-width="8" fill="none" stroke-linecap="round"/>
      <path d="M 165,60 L 195,60" stroke="black" stroke-width="8" fill="none" stroke-linecap="round"/>
      <path d="M 50,20 Q 80,60 50,100 Q 120,100 145,60 Q 120,20 50,20 Z" stroke="black" stroke-width="8" fill="white" stroke-linejoin="round"/>
      <!-- circle -->
      <circle cx="156" cy="60" r="11" stroke="black" stroke-width="8" fill="white" />
    </svg>`,

  'XNOR_Gate.png': `
    <svg width="200" height="120" xmlns="http://www.w3.org/2000/svg">
      <path d="M 20,40 L 60,40" stroke="black" stroke-width="8" fill="none" stroke-linecap="round"/>
      <path d="M 20,80 L 60,80" stroke="black" stroke-width="8" fill="none" stroke-linecap="round"/>
      <path d="M 175,60 L 195,60" stroke="black" stroke-width="8" fill="none" stroke-linecap="round"/>
      <path d="M 40,20 Q 70,60 40,100" stroke="black" stroke-width="8" fill="none" stroke-linecap="round"/>
      <path d="M 55,20 Q 85,60 55,100 Q 115,100 145,60 Q 115,20 55,20 Z" stroke="black" stroke-width="8" fill="white" stroke-linejoin="round"/>
      <!-- circle -->
      <circle cx="156" cy="60" r="11" stroke="black" stroke-width="8" fill="white" />
    </svg>`,

  // I will also regenerate AND just in case it looks slightly different so they all match perfectly
  'AND_Gate.png': `
    <svg width="200" height="120" xmlns="http://www.w3.org/2000/svg">
      <!-- inputs -->
      <path d="M 20,40 L 60,40" stroke="black" stroke-width="8" fill="none" stroke-linecap="round"/>
      <path d="M 20,80 L 60,80" stroke="black" stroke-width="8" fill="none" stroke-linecap="round"/>
      <!-- output -->
      <path d="M 145,60 L 195,60" stroke="black" stroke-width="8" fill="none" stroke-linecap="round"/>
      <!-- main body -->
      <path d="M 60,20 L 105,20 A 40 40 0 0 1 105 100 L 60,100 Z" stroke="black" stroke-width="8" fill="white" stroke-linejoin="round"/>
    </svg>`,

  // OR Gate
  'OR_Gate.png': `
    <svg width="200" height="120" xmlns="http://www.w3.org/2000/svg">
      <path d="M 20,40 L 70,40" stroke="black" stroke-width="8" fill="none" stroke-linecap="round"/>
      <path d="M 20,80 L 70,80" stroke="black" stroke-width="8" fill="none" stroke-linecap="round"/>
      <path d="M 145,60 L 195,60" stroke="black" stroke-width="8" fill="none" stroke-linecap="round"/>
      <path d="M 50,20 Q 80,60 50,100 Q 120,100 145,60 Q 120,20 50,20 Z" stroke="black" stroke-width="8" fill="white" stroke-linejoin="round"/>
    </svg>`
};

async function generate() {
  for (const [filename, svg] of Object.entries(gates)) {
    const filePath = path.join(outDir, filename);
    await sharp(Buffer.from(svg))
      .png()
      .toFile(filePath);
    console.log('Generated', filename);
  }
}

generate().catch(console.error);
