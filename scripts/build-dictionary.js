import fs from 'fs';
import path from 'path';

const ORDERED_FILES = [
  'anatomy_systems.json',
  'anatomy_regions.json',
  'anatomy_glossary.json',
  'prescriptions.json',
  'anatomy.json',
  'clinical.json',
  'general.json',
  'anatomy_organs.json',
  'anatomy_bones.json',
  'anatomy_nerves.json',
  'anatomy_vessels.json',
  'anatomy_muscles.json',
  'anatomy_glands.json',
  'anatomy_joints.json',
  'anatomy_ligaments.json',
  'anatomy_tendons.json',
  'latin_nouns.json',
  'latin_adjectives.json',
  'latin_verbs.json',
  'latin_adverbs.json',
  'latin_prepositions.json',
  'latin_conjunctions.json',
  'latin_interjections.json'
];

const dataDir = path.resolve('data');
const merged = [];
const seenIds = new Set();
let duplicatesSkipped = 0;

for (const fileName of ORDERED_FILES) {
  const filePath = path.join(dataDir, fileName);
  if (!fs.existsSync(filePath)) {
    console.warn(`Warning: File missing: ${fileName}`);
    continue;
  }
  const items = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  for (const item of items) {
    if (seenIds.has(item.id)) {
      duplicatesSkipped++;
      continue;
    }
    seenIds.add(item.id);
    merged.push(item);
  }
}

const outputPath = path.join(dataDir, 'dictionary.json');
fs.writeFileSync(outputPath, JSON.stringify(merged));

const stat = fs.statSync(outputPath);
const originalTotalSize = ORDERED_FILES.reduce((sum, f) => {
  const p = path.join(dataDir, f);
  return sum + (fs.existsSync(p) ? fs.statSync(p).size : 0);
}, 0);

console.log('✓ Successfully created unified dictionary.json:');
console.log(`- Total entries: ${merged.length.toLocaleString()}`);
console.log(`- Duplicates skipped: ${duplicatesSkipped}`);
console.log(`- Original total size (23 files): ${(originalTotalSize / (1024 * 1024)).toFixed(2)} MB`);
console.log(`- Unified dictionary.json size: ${(stat.size / (1024 * 1024)).toFixed(2)} MB`);
