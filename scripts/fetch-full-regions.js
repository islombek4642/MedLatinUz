import fs from 'fs';
import path from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);
const CACHE_DIR = path.resolve('data/cache');
if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });

const DELAY_MS = 300;
const ANATOMY_IP = '188.114.96.1';

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function fetchHtml(url) {
  const args = [
    '-s', '-L',
    '-A', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
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

async function run() {
  const regionsPath = 'data/anatomy_regions.json';
  const regions = JSON.parse(fs.readFileSync(regionsPath, 'utf8'));

  console.log(`Updating ${regions.length} regions with full untruncated descriptions...`);

  for (let i = 0; i < regions.length; i++) {
    const item = regions[i];
    const slug = item.slug.replace(/^\/region\//, '').replace(/\/$/, '');
    const cacheFile = path.join(CACHE_DIR, `region_${slug}.html`);
    const url = `https://anatomyfyi.com/region/${slug}/`;

    let html;
    if (fs.existsSync(cacheFile) && fs.statSync(cacheFile).size > 500) {
      html = fs.readFileSync(cacheFile, 'utf8');
    } else {
      process.stdout.write(`Fetching [${i + 1}/${regions.length}] ${slug}... `);
      html = await fetchHtml(url);
      if (html && html.length > 500) {
        fs.writeFileSync(cacheFile, html, 'utf8');
        process.stdout.write(`OK (${(html.length / 1024).toFixed(1)} KB)\n`);
      } else {
        process.stdout.write(`FAILED\n`);
      }
      await sleep(DELAY_MS);
    }

    if (html) {
      const main = html.match(/<main[\s\S]*?<\/main>/i)?.[0] || '';
      const paragraphs = [...main.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)]
        .map(m => m[1].replace(/<[^>]+>/g, '').trim())
        .filter(p => p.length > 25 && !p.includes('AnatomyFYI') && !p.includes('cookie') && !p.includes('All rights reserved'));

      if (paragraphs.length > 0) {
        const fullDesc = paragraphs[0];
        item.definition_uz = `Inson tanasi sohasi: ${item.translation_uz}. ${fullDesc}`;
        item.description_en = fullDesc;
      }
    }
  }

  fs.writeFileSync(regionsPath, JSON.stringify(regions, null, 2), 'utf8');
  console.log('Successfully updated data/anatomy_regions.json with full descriptions!');
}

run().catch(console.error);
