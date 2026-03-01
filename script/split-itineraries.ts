// scripts/split-itineraries.ts
// Run from repo root: npx tsx scripts/split-itineraries.ts
// Reads itineraries.json and writes one file per trek into client/public/data/itineraries/

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Adjust these paths if your folder structure differs
const INPUT  = path.resolve(__dirname, '../client/src/data/itineraries.json');
const OUTPUT = path.resolve(__dirname, '../client/public/data/itineraries');

if (!fs.existsSync(INPUT)) {
  console.error(`❌ Could not find: ${INPUT}`);
  console.error('   Make sure itineraries.json is at client/src/data/itineraries.json');
  process.exit(1);
}

fs.mkdirSync(OUTPUT, { recursive: true });

const data = JSON.parse(fs.readFileSync(INPUT, 'utf-8'));
let count = 0;

for (const [trekId, trekData] of Object.entries(data)) {
  const outPath = path.join(OUTPUT, `${trekId}.json`);
  fs.writeFileSync(outPath, JSON.stringify(trekData, null, 0));
  count++;
  console.log(`  ✓ ${trekId}.json`);
}

console.log(`\n✅ Done — split ${count} treks → ${OUTPUT}`);
