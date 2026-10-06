import fs from 'fs';

console.log('=== AORTA INSPECTION ===');
const aorta = fs.readFileSync('temp_aorta.html', 'utf8');
// Check title, meta description, paragraphs, headers
const aortaTitle = aorta.match(/<title>([^<]*)<\/title>/i)?.[1];
const aortaDesc = aorta.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i)?.[1];
console.log('Title:', aortaTitle);
console.log('Meta Desc:', aortaDesc);

// Look for structured sections (definition, relations, blood supply, etc.)
const aortaMain = aorta.match(/<main[\s\S]*?<\/main>/i)?.[0];
if (aortaMain) {
  const headings = [...aortaMain.matchAll(/<h[234][^>]*>([\s\S]*?)<\/h[234]>/gi)].map(m => m[1].replace(/<[^>]+>/g, '').trim());
  console.log('Headings in aorta page:', headings);
}

console.log('\n=== LATIN DEFINITION 1 (a) INSPECTION ===');
const latinA = fs.readFileSync('temp_latin_a.html', 'utf8');
const latinTitle = latinA.match(/<title>([^<]*)<\/title>/i)?.[1];
const latinDesc = latinA.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i)?.[1];
console.log('Title:', latinTitle);
console.log('Meta Desc:', latinDesc);

// Look for definitions / translations / forms in latin-dictionary page
const defs = [...latinA.matchAll(/<li[^>]*class=["'][^"']*def[^"']*["'][^>]*>([\s\S]*?)<\/li>/gi)].map(m => m[1].replace(/<[^>]+>/g, '').trim());
console.log('Def elements:', defs);
if (defs.length === 0) {
  // Let's find table or content area
  const contentArea = latinA.match(/<div[^>]*id=["'](?:content|main|definition)[^"']*["'][\s\S]*?<\/div>/i)?.[0] || latinA.slice(2000, 4000);
  console.log('Content snippet:', contentArea.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').slice(0, 500));
}
