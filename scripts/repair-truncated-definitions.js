/**
 * MedLatin UZ - Kesilib qolgan ta'riflarni tiklash skripti (Repair Truncated Definitions)
 * 
 * Ushbu skript data/cache dagi mavjud HTML fayllardan to'liq,
 * kesilmagan abzaslarni o'qib, barcha "..." bilan tugagan ta'riflarni
 * 100% to'liq matn bilan yangilaydi (0 tarmoq so'rovi, bir necha soniyada).
 */

import fs from 'fs';
import path from 'path';

const CACHE_DIR = path.resolve('data/cache');

function extractFullDescription(html) {
  if (!html) return null;

  const main = html.match(/<main[\s\S]*?<\/main>/i)?.[0] || html;
  const paragraphs = [...main.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)]
    .map(m => m[1].replace(/<[^>]+>/g, '').trim())
    .filter(p => p.length > 25 && 
                 !p.includes('AnatomyFYI') && 
                 !p.includes('cookie') && 
                 !p.includes('educational and informational') &&
                 !p.includes('All rights reserved'));

  const fullPara = paragraphs.find(p => !p.endsWith('...') && !p.endsWith('…'));
  if (fullPara) return fullPara;
  if (paragraphs.length > 0) return paragraphs[0];

  return null;
}

const files = [
  'data/anatomy_tendons.json',
  'data/anatomy_ligaments.json',
  'data/anatomy_joints.json',
  'data/anatomy_glands.json',
  'data/anatomy_muscles.json',
  'data/anatomy_vessels.json',
  'data/anatomy_nerves.json',
  'data/anatomy_bones.json',
  'data/anatomy_organs.json'
];

console.log('='.repeat(65));
console.log('  MedLatin UZ - Kesilib qolgan ta\'riflarni tiklash');
console.log('='.repeat(65));

let grandRepaired = 0;
let grandRemaining = 0;

for (const filePath of files) {
  if (!fs.existsSync(filePath)) continue;

  const items = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  let repairedInFile = 0;
  let remainingInFile = 0;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const def = item.definition_uz || '';

    // Faqat ... yoki … bilan tugaganlarni qidirish
    if (def.endsWith('...') || def.endsWith('…')) {
      let slug = (item.slug || '').replace(/^\/structure\//, '').replace(/\/$/, '').trim();
      if (!slug) {
        slug = item.latin.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      }

      const cacheFile = path.join(CACHE_DIR, `struct_${slug}.html`);
      if (fs.existsSync(cacheFile) && fs.statSync(cacheFile).size > 500) {
        const html = fs.readFileSync(cacheFile, 'utf8');
        const fullDesc = extractFullDescription(html);

        if (fullDesc && !fullDesc.endsWith('...') && !fullDesc.endsWith('…')) {
          const typeLabel = item.type_uz || item.type || "A'zo";
          item.definition_uz = `Anatomik ta'rif (${typeLabel}): ${fullDesc}`;
          item.description_en = fullDesc;
          repairedInFile++;
        } else {
          remainingInFile++;
        }
      } else {
        remainingInFile++;
      }
    }
  }

  if (repairedInFile > 0) {
    fs.writeFileSync(filePath, JSON.stringify(items, null, 2), 'utf8');
  }

  console.log(`${filePath.padEnd(28)}: Tiklandi: ${String(repairedInFile).padStart(4)} | Qoldi: ${String(remainingInFile).padStart(4)}`);
  grandRepaired += repairedInFile;
  grandRemaining += remainingInFile;
}

console.log('='.repeat(65));
console.log(`JAMI TIKLANGAN TA'RIFLAR: ${grandRepaired}`);
console.log(`KESHDAN TOPILMAGAN / QOLGAN: ${grandRemaining}`);
console.log('='.repeat(65));
