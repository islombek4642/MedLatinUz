import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const latinHtmlPath = path.resolve(__dirname, '../latin.html');
const dataDir = path.resolve(__dirname, '../data');

console.log('Reading latin.html...');
const content = fs.readFileSync(latinHtmlPath, 'utf8');

const itemRegex = /<li id="word-(\d+)" class="word">\s*<a href="([^"]+)">([^<]+)<\/a>\s*([a-zA-Z]+)\s*<\/li>/g;

const posConfigs = {
  n: { filename: 'latin_nouns.json', category: 'latin_noun', uzLabel: 'Ot (Noun)', prefix: 'lat_n' },
  adj: { filename: 'latin_adjectives.json', category: 'latin_adjective', uzLabel: 'Sifat (Adjective)', prefix: 'lat_adj' },
  v: { filename: 'latin_verbs.json', category: 'latin_verb', uzLabel: "Fe'l (Verb)", prefix: 'lat_v' },
  adv: { filename: 'latin_adverbs.json', category: 'latin_adverb', uzLabel: 'Ravish (Adverb)', prefix: 'lat_adv' },
  prep: { filename: 'latin_prepositions.json', category: 'latin_preposition', uzLabel: "Old qo'shimcha (Prep)", prefix: 'lat_prep' },
  conj: { filename: 'latin_conjunctions.json', category: 'latin_conjunction', uzLabel: "Bog'lovchi (Conj)", prefix: 'lat_conj' },
  interj: { filename: 'latin_interjections.json', category: 'latin_interjection', uzLabel: 'Undov (Interj)', prefix: 'lat_intj' }
};

const buckets = {};
for (const k of Object.keys(posConfigs)) {
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

while ((match = itemRegex.exec(content)) !== null) {
  const wordId = match[1];
  const link = match[2];
  const latin = cleanText(match[3]);
  const pos = match[4].trim().toLowerCase();

  const cfg = posConfigs[pos];
  if (!cfg) continue;

  total++;
  const count = buckets[pos].length + 1;
  const id = `${cfg.prefix}_${String(count).padStart(5, '0')}`;

  const translationUz = `${latin} (${cfg.uzLabel})`;
  const definitionUz = `Lotin tili leksikasi: ${cfg.uzLabel} so'z turkumi (${latin}).`;

  buckets[pos].push({
    id,
    latin,
    category: cfg.category,
    pos: pos,
    pos_uz: cfg.uzLabel,
    translation_uz: translationUz,
    definition_uz: definitionUz,
    source_url: link
  });
}

console.log(`Parsed total ${total} words from latin.html.`);

for (const [pos, items] of Object.entries(buckets)) {
  const cfg = posConfigs[pos];
  const targetFile = path.join(dataDir, cfg.filename);
  fs.writeFileSync(targetFile, JSON.stringify(items, null, 2), 'utf8');
  console.log(`✓ Saved ${items.length} items to data/${cfg.filename}`);
}

console.log('All 7 Latin POS category files created successfully!');
