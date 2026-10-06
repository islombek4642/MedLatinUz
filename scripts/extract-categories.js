import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const hhhPath = path.resolve(__dirname, '../hhh.html');
const dataDir = path.resolve(__dirname, '../data');

console.log('Reading hhh.html...');
const content = fs.readFileSync(hhhPath, 'utf8');

const cardRegex = /<a href="\/structure\/([^"]+)\/"[^>]*>[\s\S]*?<h3[^>]*>([\s\S]*?)<\/h3>[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>[\s\S]*?<span[^>]*class="[^"]*rounded-full[^"]*"[^>]*>([\s\S]*?)<\/span>/g;

const categoryConfigs = {
  Organ: { filename: 'anatomy_organs.json', uzLabel: "Ichki a'zo", prefix: 'org' },
  Bone: { filename: 'anatomy_bones.json', uzLabel: 'Suyak', prefix: 'bon' },
  Nerve: { filename: 'anatomy_nerves.json', uzLabel: 'Asab tolasi (Nerv)', prefix: 'nrv' },
  Vessel: { filename: 'anatomy_vessels.json', uzLabel: 'Qon tomiri', prefix: 'vsl' },
  Muscle: { filename: 'anatomy_muscles.json', uzLabel: 'Mushak', prefix: 'mus' },
  Gland: { filename: 'anatomy_glands.json', uzLabel: 'Bez', prefix: 'gld' },
  Joint: { filename: 'anatomy_joints.json', uzLabel: "Bo'g'im", prefix: 'jnt' },
  Ligament: { filename: 'anatomy_ligaments.json', uzLabel: 'Boylam', prefix: 'lig' },
  Tendon: { filename: 'anatomy_tendons.json', uzLabel: 'Pay', prefix: 'tnd' }
};

const buckets = {};
for (const k of Object.keys(categoryConfigs)) {
  buckets[k] = [];
}

function cleanText(str) {
  if (!str) return '';
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

let match;
let total = 0;

while ((match = cardRegex.exec(content)) !== null) {
  const slug = match[1].trim();
  const latin = cleanText(match[2]);
  const english = cleanText(match[3]);
  const type = match[4].trim();

  const cfg = categoryConfigs[type];
  if (!cfg) continue;

  total++;
  const count = buckets[type].length + 1;
  const id = `${cfg.prefix}_${String(count).padStart(5, '0')}`;

  const translationUz = english 
    ? `${english} (${cfg.uzLabel})` 
    : `${latin} (${cfg.uzLabel})`;

  const definitionUz = `Anatomik tuzilma: Inson tanasining ${cfg.uzLabel} tizimi qismi${english ? ` (${english})` : ''}.`;

  buckets[type].push({
    id,
    latin,
    category: `anatomy_${type.toLowerCase()}`,
    type: type,
    type_uz: cfg.uzLabel,
    english,
    translation_uz: translationUz,
    definition_uz: definitionUz,
    slug: `/structure/${slug}/`
  });
}

console.log(`Parsed total ${total} items from hhh.html.`);

for (const [type, items] of Object.entries(buckets)) {
  const cfg = categoryConfigs[type];
  const targetFile = path.join(dataDir, cfg.filename);
  fs.writeFileSync(targetFile, JSON.stringify(items, null, 2), 'utf8');
  console.log(`✓ Saved ${items.length} items to data/${cfg.filename}`);
}

console.log('All 9 anatomical category files generated successfully!');
