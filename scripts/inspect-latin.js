import fs from 'fs';

const content = fs.readFileSync('latin.html', 'utf8');

// Regex to extract items:
// <li id="word-(\d+)" class="word">
//   <a href="([^"]+)">([^<]+)</a>
//   ([a-z]+)
// </li>

const itemRegex = /<li id="word-(\d+)" class="word">\s*<a href="([^"]+)">([^<]+)<\/a>\s*([a-zA-Z]+)\s*<\/li>/g;

let match;
const counts = {};
let total = 0;
const samples = {};

while ((match = itemRegex.exec(content)) !== null) {
  total++;
  const wordId = match[1];
  const link = match[2];
  const latin = match[3].trim();
  const pos = match[4].trim().toLowerCase(); // Part of speech

  counts[pos] = (counts[pos] || 0) + 1;
  if (!samples[pos]) samples[pos] = [];
  if (samples[pos].length < 3) {
    samples[pos].push({ wordId, latin, link });
  }
}

console.log(`Total words matched in latin.html: ${total}`);
console.log('Parts of speech breakdown:');
for (const [pos, c] of Object.entries(counts)) {
  console.log(`- ${pos}: ${c}`);
}
console.log('\nSamples by POS:', JSON.stringify(samples, null, 2));
