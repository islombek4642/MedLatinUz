import fs from 'fs';
import path from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);
const CACHE_DIR = path.resolve('data/cache');
if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });

const DELAY_MS = 250;
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

function extractDefinition(html) {
  if (!html) return null;
  const main = html.match(/<main[\s\S]*?<\/main>/i)?.[0] || '';
  const paragraphs = [...main.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)]
    .map(m => m[1].replace(/<[^>]+>/g, '').trim())
    .filter(p => p.length > 25 && !p.includes('AnatomyFYI') && !p.includes('cookie') && !p.includes('All rights reserved'));

  return paragraphs.length > 0 ? paragraphs[0] : null;
}

async function run() {
  const glossaryPath = 'data/anatomy_glossary.json';
  const glossary = JSON.parse(fs.readFileSync(glossaryPath, 'utf8'));

  console.log(`Starting safe fetch for ${glossary.length} glossary terms...`);
  let updatedCount = 0;
  let cacheCount = 0;

  for (let i = 0; i < glossary.length; i++) {
    const item = glossary[i];
    // slug is e.g. "/glossary/#pineal-gland" or "pineal-gland"
    let slug = (item.slug || '').replace(/^\/glossary\/#?/, '').replace(/\/$/, '').trim();
    if (!slug) {
      slug = item.latin.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    }

    const cacheFile = path.join(CACHE_DIR, `glossary_${slug}.html`);
    const url = `https://anatomyfyi.com/glossary/${slug}/`;

    let html;
    if (fs.existsSync(cacheFile) && fs.statSync(cacheFile).size > 500) {
      html = fs.readFileSync(cacheFile, 'utf8');
      cacheCount++;
    } else {
      process.stdout.write(`[${i + 1}/${glossary.length}] ${item.latin} (${slug})... `);
      html = await fetchHtml(url);
      if (html && html.length > 500) {
        fs.writeFileSync(cacheFile, html, 'utf8');
        process.stdout.write(`OK (${(html.length / 1024).toFixed(1)} KB)\n`);
      } else {
        process.stdout.write(`FAILED\n`);
      }
      await sleep(DELAY_MS);
    }

    const fullDef = extractDefinition(html);
    if (fullDef) {
      item.definition_uz = `Anatomik ta'rif: ${fullDef}`;
      item.description_en = fullDef;
      item.slug = `/glossary/${slug}/`;
      updatedCount++;
    }

    // Save progress every 30 items
    if ((i + 1) % 30 === 0) {
      fs.writeFileSync(glossaryPath, JSON.stringify(glossary, null, 2), 'utf8');
      console.log(`-- Checkpoint saved: ${i + 1}/${glossary.length} items --`);
    }
  }

  fs.writeFileSync(glossaryPath, JSON.stringify(glossary, null, 2), 'utf8');
  console.log(`\nSuccessfully updated ${glossary.length} glossary terms! (Updated: ${updatedCount}, From Cache: ${cacheCount})`);
}

run().catch(console.error);
