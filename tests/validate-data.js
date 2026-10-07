import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dictPath = path.resolve(__dirname, '../data/dictionary.json');
const bundlePath = path.resolve(__dirname, '../data/dictionary-data.js');

console.log('Validating unified dictionary database...');

if (!fs.existsSync(dictPath)) {
  console.error('Missing data/dictionary.json');
  process.exit(1);
}

if (!fs.existsSync(bundlePath)) {
  console.error('Missing data/dictionary-data.js');
  process.exit(1);
}

const entries = JSON.parse(fs.readFileSync(dictPath, 'utf8'));

if (!Array.isArray(entries) || entries.length < 20000) {
  console.error(`Invalid entries count: ${entries.length}`);
  process.exit(1);
}

const expectedKeys = ['id', 'latin', 'uzbek', 'english', 'category', 'definition'];
const validCategories = new Set(['anatomy', 'latin', 'prescription', 'clinical']);

for (let i = 0; i < entries.length; i++) {
  const item = entries[i];
  if (item.id !== i + 1) {
    console.error(`Invalid id at index ${i}: expected ${i + 1}, got ${item.id}`);
    process.exit(1);
  }
  if (!item.latin || !item.uzbek || !item.definition) {
    console.error(`Missing required text fields at index ${i}`, item);
    process.exit(1);
  }
  if (!validCategories.has(item.category)) {
    console.error(`Invalid category at index ${i}: ${item.category}`);
    process.exit(1);
  }
  const keys = Object.keys(item);
  if (keys.some((k, idx) => k !== expectedKeys[idx])) {
    console.error(`Invalid key order at index ${i}:`, keys);
    process.exit(1);
  }
}

console.log(`PASS: All ${entries.length.toLocaleString()} entries validated successfully with unified 6-key schema!`);
