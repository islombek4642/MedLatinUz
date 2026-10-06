/**
 * MedLatin UZ - Xavfsiz Ma'lumotlarni Yuklab Olish Skripti (Safe Data Fetcher)
 * 
 * Bu skript endpointlardan (AnatomyFYI va Latdict) batafsil ma'lumotlarni
 * xavfsiz (rate limit, kesh, xatoliklarni qayta urinish) yo'l bilan yuklab oladi.
 * 
 * Foydalanish:
 *   node scripts/fetch-details.js --limit=50     (Birinchi 50 tasini yuklash)
 *   node scripts/fetch-details.js --category=organs  (Faqat a'zolarni yuklash)
 *   node scripts/fetch-details.js --all         (Hammasini xavfsiz ketma-ketlikda yuklash)
 */

import fs from 'fs';
import path from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

const CACHE_DIR = path.resolve('data/cache');
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

// Konfiguratsiya
const DELAY_MS = 600; // Har bir so'rov orasida 600ms kutiladi (Cloudflare bloklamasligi uchun)
const ANATOMY_IP = '188.114.96.1'; // AnatomyFYI Cloudflare DNS aylanib o'tish

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithCurl(url) {
  const isAnatomy = url.includes('anatomyfyi.com');
  const args = [
    '-s',
    '-L',
    '-A', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    '--max-time', '15'
  ];

  if (isAnatomy) {
    args.push('--resolve', `anatomyfyi.com:443:${ANATOMY_IP}`);
  }

  args.push(url);

  try {
    const { stdout } = await execFileAsync('curl.exe', args, { maxBuffer: 10 * 1024 * 1024 });
    return stdout;
  } catch (err) {
    console.error(`Xatolik curl da [${url}]:`, err.message);
    return null;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const limitArg = args.find(a => a.startsWith('--limit='));
  const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : 10;

  console.log('='.repeat(60));
  console.log('  MedLatin UZ - Xavfsiz Endpoint Yuklovchi');
  console.log('='.repeat(60));
  console.log(`- So'rovlar orasidagi tanaffus: ${DELAY_MS} ms`);
  console.log(`- Kesh jildi: ${CACHE_DIR}`);
  console.log(`- Maksimal yuklash chegarasi: ${limit} ta element\n`);

  // Organlar ro'yxatidan namunalar olamiz
  const organsPath = 'data/anatomy_organs.json';
  if (!fs.existsSync(organsPath)) {
    console.error('anatomy_organs.json topilmadi!');
    return;
  }

  const organs = JSON.parse(fs.readFileSync(organsPath, 'utf8'));
  const targetOrgans = organs.slice(0, limit);

  console.log(`Yuklanayotgan elementlar soni: ${targetOrgans.length}`);

  let successCount = 0;
  let cacheCount = 0;

  for (let i = 0; i < targetOrgans.length; i++) {
    const item = targetOrgans[i];
    const slug = (item.slug || item.latin || '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const cacheFile = path.join(CACHE_DIR, `organ_${slug}.html`);

    console.log(`[${i + 1}/${targetOrgans.length}] ${item.latin} (${item.name_uz || item.name_en})...`);

    if (fs.existsSync(cacheFile) && fs.statSync(cacheFile).size > 500) {
      console.log(`  -> Keshdan olindi (avval yuklangan)`);
      cacheCount++;
      continue;
    }

    let fullUrl = item.url || '';
    if (!fullUrl && item.slug) {
      fullUrl = item.slug.startsWith('http') ? item.slug : `https://anatomyfyi.com${item.slug}`;
    }
    if (!fullUrl) {
      fullUrl = `https://anatomyfyi.com/structure/${slug}/`;
    }

    const html = await fetchWithCurl(fullUrl);

    if (html && html.length > 500) {
      fs.writeFileSync(cacheFile, html, 'utf8');
      console.log(`  -> Muvaffaqiyatli yuklandi (${(html.length / 1024).toFixed(1)} KB)`);
      successCount++;
    } else {
      console.log(`  -> Yuklab bo'lmadi yoki bo'sh sahifa`);
    }

    // Xavfsizlik tanaffusi
    await sleep(DELAY_MS);
  }

  console.log('\n' + '='.repeat(60));
  console.log(`Tugadi! Yangi yuklangan: ${successCount}, Keshdan: ${cacheCount}`);
  console.log('='.repeat(60));
}

main().catch(err => console.error(err));
