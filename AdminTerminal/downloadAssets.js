const https = require('https');
const fs = require('fs');
const path = require('path');

const gates = [
  { name: 'AND_Gate.png', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/AND_ANSI.svg/500px-AND_ANSI.svg.png' },
  { name: 'OR_Gate.png', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/OR_ANSI.svg/500px-OR_ANSI.svg.png' },
  { name: 'NOT_Gate.png', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/NOT_ANSI.svg/500px-NOT_ANSI.svg.png' },
  { name: 'NAND_Gate.png', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/NAND_ANSI.svg/500px-NAND_ANSI.svg.png' },
  { name: 'NOR_Gate.png', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/NOR_ANSI.svg/500px-NOR_ANSI.svg.png' },
  { name: 'XOR_Gate.png', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/XOR_ANSI.svg/500px-XOR_ANSI.svg.png' },
  { name: 'XNOR_Gate.png', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/XNOR_ANSI.svg/500px-XNOR_ANSI.svg.png' }
];

const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR);

async function downloadImage(name, url) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(UPLOADS_DIR, name);
    const file = fs.createWriteStream(filePath);
    const options = {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Levidex/1.0' }
    };
    https.get(url, options, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        https.get(response.headers.location, options, (res) => {
          res.pipe(file);
          file.on('finish', () => { file.close(); resolve(); });
        });
      } else {
        response.pipe(file);
        file.on('finish', () => { file.close(); resolve(); });
      }
    }).on('error', (err) => {
      fs.unlink(filePath, () => {});
      reject(err);
    });
  });
}

async function run() {
  console.log("🌐 Initiating autonomous asset retrieval sequence...");
  for (const gate of gates) {
    console.log(`⬇️ Downloading ${gate.name}...`);
    try {
      await downloadImage(gate.name, gate.url);
    } catch(e) { console.error("Error", e); }
  }
  console.log("✅ All assets successfully pulled to local staging.");
}

run();
