/**
 * MedLatin UZ - Tartib Bilan Bosqichma-bosqich Yuklovchi (Ordered Batch Fetcher)
 * 
 * Eng kichik toifadan boshlab navbatma-navbat to'liq ta'riflarni yuklaydi:
 * 1. data/anatomy_ligaments.json (121 ta)  - ~45 soniya
 * 2. data/anatomy_joints.json    (156 ta)  - ~55 soniya
 * 3. data/anatomy_glands.json    (520 ta)  - ~3 daqiqa
 * 4. data/anatomy_muscles.json   (1,075 ta)- ~6 daqiqa
 * 5. data/anatomy_vessels.json   (1,113 ta)- ~6 daqiqa
 * 6. data/anatomy_nerves.json    (1,197 ta)- ~7 daqiqa
 * 7. data/anatomy_bones.json     (2,186 ta)- ~12 daqiqa
 * 8. data/anatomy_organs.json    (8,294 ta)- ~45 daqiqa
 */

import fs from 'fs';
import path from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);
const CACHE_DIR = path.resolve('data/cache');
if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });

const DELAY_MS = 280; // Barqaror va xavfsiz tezlik
const ANATOMY_IP = '188.114.96.1';

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function fetchHtml(url) {
  const args = [
    '-s', '-L',
    '-A', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    '--max-time', '15',
    '--resolve', `anatomyfyi.com:443:${ANATOMY_IP}`,
    url
  ];
  try {
    const { stdout } = await execFileAsync('curl.exe', args, { maxBuffer: 10 * 1024 * 1024 });
    return stdout;
  } catch (err) {
    return null;
  }
}

function extractStructureDescription(html) {
  if (!html) return null;
  
  // 1. Asosiy matn abzaslari (to'liq va kesilmagan matn)
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

  // 2. Faqat zaxira sifatida: Meta description (agar kesilmagan bo'lsa)
  const metaDesc = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i)?.[1]?.trim();
  if (metaDesc && metaDesc.length > 25 && !metaDesc.startsWith('Explore') && !metaDesc.includes('AnatomyFYI') && !metaDesc.endsWith('...') && !metaDesc.endsWith('…')) {
    return metaDesc;
  }

  return null;
}

async function processFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`Fayl topilmadi: ${filePath}`);
    return;
  }

  const items = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  console.log('\n' + '='.repeat(60));
  console.log(`Navbatdagi fayl: ${filePath} (${items.length} ta element)`);
  console.log('='.repeat(60));

  let updatedCount = 0;
  let cacheCount = 0;
  let skippedCount = 0;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];

    // Allaqachon boyitilgan elementlarni tekshirish va o'tkazib yuborish
    const isEnriched = item.description_en && 
                       item.definition_uz && 
                       item.definition_uz.startsWith("Anatomik ta'rif") &&
                       !item.definition_uz.endsWith('...') &&
                       !item.definition_uz.endsWith('…');
    if (isEnriched) {
      skippedCount++;
      continue;
    }

    let slug = (item.slug || '').replace(/^\/structure\//, '').replace(/\/$/, '').trim();
    if (!slug) {
      slug = item.latin.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    }

    const cacheFile = path.join(CACHE_DIR, `struct_${slug}.html`);
    const url = `https://anatomyfyi.com/structure/${slug}/`;

    let html;
    if (fs.existsSync(cacheFile) && fs.statSync(cacheFile).size > 500) {
      html = fs.readFileSync(cacheFile, 'utf8');
      cacheCount++;
    } else {
      process.stdout.write(`[${i + 1}/${items.length}] ${item.latin}... `);
      html = await fetchHtml(url);
      if (html && html.length > 500) {
        fs.writeFileSync(cacheFile, html, 'utf8');
        process.stdout.write(`OK (${(html.length / 1024).toFixed(1)} KB)\n`);
      } else {
        process.stdout.write(`FAILED\n`);
      }
      await sleep(DELAY_MS);
    }

    const desc = extractStructureDescription(html);
    if (desc) {
      const typeLabel = item.type_uz || item.type || "A'zo";
      item.definition_uz = `Anatomik ta'rif (${typeLabel}): ${desc}`;
      item.description_en = desc;
      updatedCount++;
    }

    // Saqlash har 25 ta elementda
    if ((i + 1) % 25 === 0 || i === items.length - 1) {
      fs.writeFileSync(filePath, JSON.stringify(items, null, 2), 'utf8');
    }
  }

  console.log(`Tugadi: ${filePath}. Yangilandi: ${updatedCount}, Oldin tayyor (o'tkazildi): ${skippedCount}, Keshdan: ${cacheCount}`);
}

async function run() {
  const queue = [
    'data/anatomy_ligaments.json', // 121
    'data/anatomy_joints.json',    // 156
    'data/anatomy_glands.json',    // 520
    'data/anatomy_muscles.json',   // 1,075
    'data/anatomy_vessels.json',   // 1,113
    'data/anatomy_nerves.json',    // 1,197
    'data/anatomy_bones.json',     // 2,186
    'data/anatomy_organs.json'     // 8,294
  ];

  const args = process.argv.slice(2);
  const singleFile = args.find(a => a.startsWith('--file='));
  
  if (singleFile) {
    await processFile(singleFile.split('=')[1]);
  } else {
    for (const f of queue) {
      await processFile(f);
    }
  }

  console.log('\nBARCHA BOSQICHLAR MUVAFFAQIYATLI YAKUNLANDI!');
}

run().catch(console.error);
