/**
 * MedLatin UZ - Xavfsiz Batafsil Ma'lumotlarni Yuklab Olish Skripti (Enhanced)
 * 
 * Ushbu skript data/ papkasidagi ixtiyoriy JSON faylni olib, har bir elementning
 * https://anatomyfyi.com/structure/... sahifasidan aniq va to'liq ta'rifini
 * xavfsiz (rate limit, kesh, avtomatik saqlash) usulda yuklaydi va JSON faylni yangilaydi.
 * 
 * Foydalanish:
 *   node scripts/fetch-details.js --file=data/anatomy_tendons.json
 *   node scripts/fetch-details.js --file=data/anatomy_ligaments.json
 *   node scripts/fetch-details.js --file=data/anatomy_joints.json
 *   node scripts/fetch-details.js --limit=20
 */

import fs from 'fs';
import path from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);
const CACHE_DIR = path.resolve('data/cache');
if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });

const DELAY_MS = 350; // Xavfsiz tanaffus
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

async function main() {
  const args = process.argv.slice(2);
  const fileArg = args.find(a => a.startsWith('--file='));
  const limitArg = args.find(a => a.startsWith('--limit='));

  const targetFilePath = fileArg ? fileArg.split('=')[1] : 'data/anatomy_ligaments.json';
  const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : Infinity;

  if (!fs.existsSync(targetFilePath)) {
    console.error(`Fayl topilmadi: ${targetFilePath}`);
    return;
  }

  const items = JSON.parse(fs.readFileSync(targetFilePath, 'utf8'));
  const total = Math.min(items.length, limit);

  console.log('='.repeat(65));
  console.log(`  MedLatin UZ - Batafsil Ta'riflarni Yuklovchi`);
  console.log('='.repeat(65));
  console.log(`- Maqsadli fayl: ${targetFilePath}`);
  console.log(`- Elementlar soni: ${total}`);
  console.log(`- Kesh jildi: ${CACHE_DIR}\n`);

  let updatedCount = 0;
  let cacheCount = 0;

  for (let i = 0; i < total; i++) {
    const item = items[i];
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
      process.stdout.write(`[${i + 1}/${total}] ${item.latin} (${slug})... `);
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
      const nameUz = item.translation_uz || item.latin;
      item.definition_uz = `Anatomik ta'rif (${typeLabel}): ${desc}`;
      item.description_en = desc;
      updatedCount++;
    }

    if ((i + 1) % 25 === 0 || i === total - 1) {
      fs.writeFileSync(targetFilePath, JSON.stringify(items, null, 2), 'utf8');
      console.log(`-- Checkpoint saqlandi: ${i + 1}/${total} --`);
    }
  }

  console.log('\n' + '='.repeat(65));
  console.log(`Muvaffaqiyatli yakunlandi!`);
  console.log(`- Yangilangan ta'riflar: ${updatedCount}`);
  console.log(`- Keshdan olingan: ${cacheCount}`);
  console.log('='.repeat(65));
}

main().catch(console.error);
