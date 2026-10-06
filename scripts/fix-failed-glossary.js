import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';

const CACHE_DIR = path.resolve('data/cache');
const ANATOMY_IP = '188.114.96.1';

const glossaryHtml = fs.readFileSync('glossary.html', 'utf8');
const cardRegex = /<a[^>]*href=["'](\/glossary\/[^"']+)["'][^>]*>[\s\S]*?<h3[^>]*>([\s\S]*?)<\/h3>/gi;

const exactLinks = new Map();
let m;
while ((m = cardRegex.exec(glossaryHtml)) !== null) {
  const link = m[1];
  const name = m[2].replace(/<[^>]+>/g, '').replace(/&#x27;/g, "'").trim();
  exactLinks.set(name.toLowerCase(), link);
}

console.log(`Found ${exactLinks.size} exact links in glossary.html`);

const glossaryPath = 'data/anatomy_glossary.json';
const glossary = JSON.parse(fs.readFileSync(glossaryPath, 'utf8'));

let fixed = 0;
for (const item of glossary) {
  const cleanName = item.latin.replace(/&#x27;/g, "'").trim().toLowerCase();
  const exactLink = exactLinks.get(cleanName);
  
  // Check if item has ellipsis
  if (item.definition_uz.includes('…') || item.definition_uz.includes('...')) {
    console.log(`Item with ellipsis: "${item.latin}" -> Link: ${exactLink}`);

    if (exactLink) {
      const slug = exactLink.replace(/^\/glossary\//, '').replace(/\/$/, '');
      const cacheFile = path.join(CACHE_DIR, `glossary_${slug}.html`);
      let html;
      if (fs.existsSync(cacheFile) && fs.statSync(cacheFile).size > 500) {
        html = fs.readFileSync(cacheFile, 'utf8');
      } else {
        const url = `https://anatomyfyi.com${exactLink}`;
        console.log(`Fetching ${url}...`);
        try {
          html = execFileSync('curl.exe', [
            '-s', '-L',
            '-A', 'Mozilla/5.0',
            '--max-time', '15',
            '--resolve', `anatomyfyi.com:443:${ANATOMY_IP}`,
            url
          ], { encoding: 'utf8' });
          if (html && html.length > 500) {
            fs.writeFileSync(cacheFile, html, 'utf8');
          }
        } catch (e) {
          console.error(`Failed ${url}:`, e.message);
        }
      }

      if (html) {
        const main = html.match(/<main[\s\S]*?<\/main>/i)?.[0] || '';
        const paragraphs = [...main.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)]
          .map(p => p[1].replace(/<[^>]+>/g, '').trim())
          .filter(p => p.length > 25 && !p.includes('AnatomyFYI') && !p.includes('cookie') && !p.includes('All rights reserved'));

        if (paragraphs.length > 0) {
          item.definition_uz = `Anatomik ta'rif: ${paragraphs[0]}`;
          item.description_en = paragraphs[0];
          item.slug = exactLink;
          fixed++;
          console.log(`  -> Fixed! ${paragraphs[0].slice(0, 70)}...`);
        }
      }
    }
  }
}

fs.writeFileSync(glossaryPath, JSON.stringify(glossary, null, 2), 'utf8');
console.log(`Total fixed: ${fixed}. Remaining items with ellipsis: ${glossary.filter(i => i.definition_uz.includes('…') || i.definition_uz.includes('...')).length}`);
