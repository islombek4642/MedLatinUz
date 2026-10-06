import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const requiredFiles = [
  { file: 'data/prescriptions.json', category: 'prescription' },
  { file: 'data/anatomy.json', category: 'anatomy' },
  { file: 'data/clinical.json', category: 'clinical' },
  { file: 'data/general.json', category: 'general' }
];

let totalEntries = 0;
let errors = [];

for (const { file, category } of requiredFiles) {
  const fullPath = path.resolve(__dirname, '..', file);
  if (!fs.existsSync(fullPath)) {
    errors.push(`Missing file: ${file}`);
    continue;
  }

  let content;
  try {
    content = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
  } catch (err) {
    errors.push(`Invalid JSON in ${file}: ${err.message}`);
    continue;
  }

  if (!Array.isArray(content) || content.length === 0) {
    errors.push(`${file} must contain a non-empty array of entries.`);
    continue;
  }

  content.forEach((item, index) => {
    totalEntries++;
    const prefix = `${file}[${index}] (${item.latin || 'no-latin'})`;
    if (!item.id || typeof item.id !== 'string') errors.push(`${prefix}: missing or invalid id`);
    if (!item.latin || typeof item.latin !== 'string') errors.push(`${prefix}: missing or invalid latin`);
    if (item.category !== category) errors.push(`${prefix}: expected category '${category}', got '${item.category}'`);
    if (!item.translation_uz || typeof item.translation_uz !== 'string') errors.push(`${prefix}: missing or invalid translation_uz`);
    if (!item.definition_uz || typeof item.definition_uz !== 'string') errors.push(`${prefix}: missing or invalid definition_uz`);
  });
}

if (errors.length > 0) {
  console.error('Data validation failed with errors:');
  errors.forEach(e => console.error(' - ' + e));
  process.exit(1);
} else {
  console.log(`PASS: All 4 data files validated successfully! Total entries: ${totalEntries}`);
  process.exit(0);
}
