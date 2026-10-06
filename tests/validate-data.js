import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const requiredFiles = [
  // Original curated sets
  { file: 'data/prescriptions.json', category: 'prescription' },
  { file: 'data/anatomy.json', category: 'anatomy' },
  { file: 'data/clinical.json', category: 'clinical' },
  { file: 'data/general.json', category: 'general' },
  
  // Specific anatomical categories from hhh.html
  { file: 'data/anatomy_organs.json', category: 'anatomy_organ' },
  { file: 'data/anatomy_bones.json', category: 'anatomy_bone' },
  { file: 'data/anatomy_nerves.json', category: 'anatomy_nerve' },
  { file: 'data/anatomy_vessels.json', category: 'anatomy_vessel' },
  { file: 'data/anatomy_muscles.json', category: 'anatomy_muscle' },
  { file: 'data/anatomy_glands.json', category: 'anatomy_gland' },
  { file: 'data/anatomy_joints.json', category: 'anatomy_joint' },
  { file: 'data/anatomy_ligaments.json', category: 'anatomy_ligament' },
  { file: 'data/anatomy_tendons.json', category: 'anatomy_tendon' },

  // Human body systems, regions, and glossary
  { file: 'data/anatomy_systems.json', category: 'anatomy_system' },
  { file: 'data/anatomy_regions.json', category: 'anatomy_region' },
  { file: 'data/anatomy_glossary.json', category: 'anatomy_glossary' },

  // Specific Latin categories from latin.html
  { file: 'data/latin_nouns.json', category: 'latin_noun' },
  { file: 'data/latin_adjectives.json', category: 'latin_adjective' },
  { file: 'data/latin_verbs.json', category: 'latin_verb' },
  { file: 'data/latin_adverbs.json', category: 'latin_adverb' },
  { file: 'data/latin_prepositions.json', category: 'latin_preposition' },
  { file: 'data/latin_conjunctions.json', category: 'latin_conjunction' },
  { file: 'data/latin_interjections.json', category: 'latin_interjection' }
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

  let sample = content[0];
  totalEntries += content.length;

  if (!sample.id || !sample.latin || !sample.translation_uz || !sample.definition_uz) {
    errors.push(`${file}: first sample is missing required fields`);
  }
}

if (errors.length > 0) {
  console.error('Data validation failed with errors:');
  errors.forEach(e => console.error(' - ' + e));
  process.exit(1);
} else {
  console.log(`PASS: All ${requiredFiles.length} data files validated successfully! Total entries: ${totalEntries}`);
  process.exit(0);
}
