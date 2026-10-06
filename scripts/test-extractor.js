import fs from 'fs';

const content = fs.readFileSync('hhh.html', 'utf8');

// Regex to extract all cards
const cardRegex = /<a href="\/structure\/([^"]+)\/"[^>]*>[\s\S]*?<h3[^>]*>([\s\S]*?)<\/h3>[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>[\s\S]*?<span[^>]*class="[^"]*rounded-full[^"]*"[^>]*>([\s\S]*?)<\/span>/g;

const categories = {
  Organ: { filename: 'anatomy_organs.json', uzLabel: "Ichki a'zo", count: 0, prefix: 'org' },
  Bone: { filename: 'anatomy_bones.json', uzLabel: 'Suyak', count: 0, prefix: 'bon' },
  Nerve: { filename: 'anatomy_nerves.json', uzLabel: 'Asab tolasi (Nerv)', count: 0, prefix: 'nrv' },
  Vessel: { filename: 'anatomy_vessels.json', uzLabel: 'Qon tomiri', count: 0, prefix: 'vsl' },
  Muscle: { filename: 'anatomy_muscles.json', uzLabel: 'Mushak', count: 0, prefix: 'mus' },
  Gland: { filename: 'anatomy_glands.json', uzLabel: 'Bez', count: 0, prefix: 'gld' },
  Joint: { filename: 'anatomy_joints.json', uzLabel: "Bo'g'im", count: 0, prefix: 'jnt' },
  Ligament: { filename: 'anatomy_ligaments.json', uzLabel: 'Boylam', count: 0, prefix: 'lig' },
  Tendon: { filename: 'anatomy_tendons.json', uzLabel: 'Pay', count: 0, prefix: 'tnd' }
};

const buckets = {};
for (const k of Object.keys(categories)) {
  buckets[k] = [];
}

let match;
let total = 0;

function cleanText(str) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

while ((match = cardRegex.exec(content)) !== null) {
  const slug = match[1].trim();
  const latin = cleanText(match[2]);
  const english = cleanText(match[3]);
  const type = match[4].trim();

  if (!categories[type]) {
    continue;
  }

  total++;
  categories[type].count++;
  const cfg = categories[type];
  const id = `${cfg.prefix}_${String(categories[type].count).padStart(5, '0')}`;

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

console.log(`Parsed total ${total} items across ${Object.keys(buckets).length} categories.`);
for (const [k, v] of Object.entries(buckets)) {
  console.log(`- ${k} (${categories[k].filename}): ${v.length} items`);
  if (v.length > 0) {
    console.log(`  Sample:`, JSON.stringify(v[0]));
  }
}
