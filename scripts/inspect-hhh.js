import fs from 'fs';

const content = fs.readFileSync('hhh.html', 'utf8');

// Regex to extract structure cards
// <a href="/structure/.../" ...>
//   <h3 ...>(latin name)</h3>
//   <p ...>(english name)</p>
//   ...
//   <span ...>(type: Muscle, Bone, Organ, etc.)</span>
// </a>

const cardRegex = /<a href="\/structure\/([^"]+)\/"[^>]*>[\s\S]*?<h3[^>]*>([\s\S]*?)<\/h3>[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>[\s\S]*?<span[^>]*class="[^"]*rounded-full[^"]*"[^>]*>([\s\S]*?)<\/span>/g;

let match;
let count = 0;
const sample = [];
const types = new Set();

while ((match = cardRegex.exec(content)) !== null) {
  count++;
  const slug = match[1].trim();
  const latin = match[2].trim();
  const english = match[3].trim();
  const type = match[4].trim();
  types.add(type);
  if (sample.length < 5) {
    sample.push({ slug, latin, english, type });
  }
}

console.log(`Total anatomical structures found: ${count}`);
console.log('Structure Types:', Array.from(types));
console.log('First 5 samples:', JSON.stringify(sample, null, 2));
