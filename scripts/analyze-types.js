import fs from 'fs';

const content = fs.readFileSync('hhh.html', 'utf8');
const cardRegex = /<a href="\/structure\/([^"]+)\/"[^>]*>[\s\S]*?<h3[^>]*>([\s\S]*?)<\/h3>[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>[\s\S]*?<span[^>]*class="[^"]*rounded-full[^"]*"[^>]*>([\s\S]*?)<\/span>/g;

let match;
const counts = {};
const samplesByType = {};

while ((match = cardRegex.exec(content)) !== null) {
  const slug = match[1].trim();
  const latin = match[2].trim();
  const english = match[3].trim();
  const type = match[4].trim();

  counts[type] = (counts[type] || 0) + 1;
  if (!samplesByType[type]) samplesByType[type] = [];
  if (samplesByType[type].length < 3) {
    samplesByType[type].push({ latin, english });
  }
}

console.log('Total per structure type:');
for (const [t, c] of Object.entries(counts)) {
  console.log(`- ${t}: ${c}`);
}

console.log('\nSamples by type:', JSON.stringify(samplesByType, null, 2));
