import fs from 'fs';
import path from 'path';

const files = fs.readdirSync('data').filter(f => f.endsWith('.json'));

console.log('=== DATA DEFINITION AUDIT ===');
for (const f of files) {
  const p = path.join('data', f);
  const data = JSON.parse(fs.readFileSync(p, 'utf8'));
  const count = data.length;
  
  // Sample definition
  const sample = data[0] || {};
  const defKey = sample.definition_uz ? 'definition_uz' : (sample.meaning_uz ? 'meaning_uz' : 'none');
  const sampleDef = sample.definition_uz || sample.meaning_uz || '';
  
  // Check how many have ellipsis (...)
  const ellipsisCount = data.filter(item => {
    const text = (item.definition_uz || item.meaning_uz || '');
    return text.endsWith('...') || text.endsWith('…') || text.includes('…');
  }).length;

  console.log(`${f.padEnd(28)}: ${String(count).padStart(5)} entries | def field: ${defKey.padEnd(13)} | ellipsis: ${ellipsisCount}`);
}
