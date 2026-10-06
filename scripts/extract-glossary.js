import fs from 'fs';

const html = fs.readFileSync('glossary.html', 'utf8');
const termRegex = /<h3[^>]*>([\s\S]*?)<\/h3>\s*<p[^>]*>([\s\S]*?)<\/p>/gi;

let m;
const items = [];
let id = 1;

while ((m = termRegex.exec(html)) !== null) {
  const term = m[1].replace(/<[^>]+>/g, '').trim();
  const def = m[2].replace(/<[^>]+>/g, '').trim();

  // Exclude non-glossary titles if any
  if (!term || !def || term.includes('AnatomyFYI') || term.includes('Navigation') || term.length > 60) {
    continue;
  }

  items.push({
    id: `glo_${String(id++).padStart(4, '0')}`,
    latin: term,
    category: 'anatomy_glossary',
    type: 'Glossary',
    type_uz: 'Anatomik atama',
    english: term,
    translation_uz: `${term} (Anatomik termin)`,
    definition_uz: `Anatomik ta'rif: ${def}`,
    slug: `/glossary/#${encodeURIComponent(term.toLowerCase().replace(/\s+/g, '-'))}`
  });
}

fs.writeFileSync('data/anatomy_glossary.json', JSON.stringify(items, null, 2), 'utf8');
console.log(`Successfully generated ${items.length} glossary terms in data/anatomy_glossary.json`);
