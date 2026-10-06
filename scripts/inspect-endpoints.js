import fs from 'fs';

console.log('=== REGIONS.HTML ===');
const regionsHtml = fs.readFileSync('regions.html', 'utf8');
const regionRegex = /<a[^>]*href=["']\/region\/([^"']+)["'][^>]*>[\s\S]*?<h3[^>]*>([\s\S]*?)<\/h3>[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/gi;
let m;
const regions = [];
while ((m = regionRegex.exec(regionsHtml)) !== null) {
  regions.push({
    slug: m[1].replace(/\/$/, ''),
    name: m[2].replace(/<[^>]+>/g, '').trim(),
    desc: m[3].replace(/<[^>]+>/g, '').trim()
  });
}
console.log(`Found ${regions.length} regions:`);
regions.forEach(r => console.log(`- ${r.name} (${r.slug}): ${r.desc}`));

console.log('\n=== GLOSSARY.HTML ===');
const glossaryHtml = fs.readFileSync('glossary.html', 'utf8');
const termRegex = /<h3[^>]*>([\s\S]*?)<\/h3>\s*<p[^>]*>([\s\S]*?)<\/p>/gi;
const terms = [];
while ((m = termRegex.exec(glossaryHtml)) !== null) {
  const term = m[1].replace(/<[^>]+>/g, '').trim();
  const def = m[2].replace(/<[^>]+>/g, '').trim();
  if (term && def && !term.includes('AnatomyFYI') && !term.includes('Navigation')) {
    terms.push({ term, def });
  }
}
console.log(`Found ${terms.length} glossary terms.`);
console.log('Sample terms (first 10):');
terms.slice(0, 10).forEach(t => console.log(`- ${t.term}: ${t.def.slice(0, 70)}...`));
