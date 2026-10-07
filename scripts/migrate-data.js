/**
 * scripts/migrate-data.js
 * Standardizes dictionary.json into the unified schema:
 * 1. id (integer 1..N)
 * 2. latin (string)
 * 3. uzbek (string)
 * 4. english (string)
 * 5. category (string: 'anatomy' | 'latin' | 'prescription' | 'clinical')
 * 6. definition (string)
 *
 * Also regenerates data/dictionary-data.js for offline 0ms execution.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputPath = path.resolve(__dirname, '../data/dictionary.json');
const outputPath = path.resolve(__dirname, '../data/dictionary.json');
const bundlePath = path.resolve(__dirname, '../data/dictionary-data.js');

console.log('Reading:', inputPath);
const raw = fs.readFileSync(inputPath, 'utf8');
const entries = JSON.parse(raw);

console.log(`Loaded ${entries.length} raw entries.`);

const standardized = entries.map((item, index) => {
  let cat = item.category || 'latin';
  if (cat === 'prescription') {
    cat = 'prescription';
  } else if (cat === 'clinical') {
    cat = 'clinical';
  } else if (cat === 'anatomy' || cat.startsWith('anatomy_')) {
    cat = 'anatomy';
  } else if (cat === 'general' || cat.startsWith('latin_') || cat === 'latin') {
    cat = 'latin';
  } else {
    cat = 'latin';
  }

  const latin = (item.latin || '').trim();
  const uzbek = (item.translation_uz || item.uzbek || '').trim();
  const english = (item.english || '').trim();
  const definition = (item.definition_uz || item.definition || item.description_en || '').trim();

  // Strict property insertion order:
  // id -> latin -> uzbek -> english -> category -> definition
  return {
    id: index + 1,
    latin,
    uzbek,
    english,
    category: cat,
    definition
  };
});

console.log('Sample entry #1:');
console.log(JSON.stringify(standardized[0], null, 2));

console.log('Writing standardized data/dictionary.json ...');
const jsonString = JSON.stringify(standardized, null, 2);
fs.writeFileSync(outputPath, jsonString, 'utf8');

console.log('Writing offline bundle data/dictionary-data.js ...');
const bundleString = `// MedLatin UZ - Offline Dictionary Bundle\n// Generated: ${new Date().toISOString()}\nwindow.__MEDLATIN_DATA__ = ${JSON.stringify(standardized)};\n`;
fs.writeFileSync(bundlePath, bundleString, 'utf8');

const statJson = fs.statSync(outputPath);
const statBundle = fs.statSync(bundlePath);

console.log(`Successfully migrated ${standardized.length} entries!`);
console.log(`dictionary.json size: ${(statJson.size / (1024 * 1024)).toFixed(2)} MB`);
console.log(`dictionary-data.js size: ${(statBundle.size / (1024 * 1024)).toFixed(2)} MB`);
