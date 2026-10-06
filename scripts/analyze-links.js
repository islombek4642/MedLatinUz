import fs from 'fs';

function analyzeFile(filename) {
  console.log(`\n=== ANALYZING ${filename} ===`);
  const content = fs.readFileSync(filename, 'utf8');
  const hrefMatches = [...content.matchAll(/href=["']([^"']+)["']/gi)].map(m => m[1]);
  console.log(`Total href links found: ${hrefMatches.length}`);

  const externalUrls = hrefMatches.filter(u => u.startsWith('http://') || u.startsWith('https://'));
  const relativeUrls = hrefMatches.filter(u => u.startsWith('/'));

  const externalHosts = [...new Set(externalUrls.map(u => {
    try { return new URL(u).origin; } catch(e) { return u; }
  }))];
  console.log('Unique external origins:', externalHosts);

  const relativePrefixes = [...new Set(relativeUrls.map(u => {
    const parts = u.split('/').filter(Boolean);
    return parts.length > 0 ? '/' + parts[0] + (parts[1] ? '/' + parts[1] : '') : '/';
  }))];
  console.log('Unique relative paths sample:', relativePrefixes.slice(0, 10));

  console.log('Sample 5 URLs:');
  hrefMatches.slice(0, 5).forEach((u, i) => console.log(`  ${i+1}. ${u}`));

  const structureLinks = hrefMatches.filter(u => u.includes('/structure/'));
  if (structureLinks.length) console.log(`Structure links (/structure/...): ${structureLinks.length}, sample: ${structureLinks[0]}`);

  const defLinks = hrefMatches.filter(u => u.includes('/definition/'));
  if (defLinks.length) console.log(`Definition links (/definition/...): ${defLinks.length}, sample: ${defLinks[0]}`);
}

analyzeFile('hhh.html');
analyzeFile('latin.html');
analyzeFile('systems.html');
