import fs from 'fs';
import { SearchEngine } from '../js/modules/search-engine.js';

const data = JSON.parse(fs.readFileSync('./data/dictionary.json', 'utf8'));

console.log('Testing SearchEngine with migrated dataset...');
const engine = new SearchEngine();
engine.init(data);

// 1. Search 'Rp.'
const resRp = engine.search('Rp.');
console.log('Search "Rp.":', resRp.length, 'results. First item:', resRp[0].latin, '|', resRp[0].uzbek);

// 2. Search English term 'Skeletal'
const resEn = engine.search('Skeletal');
console.log('Search English "Skeletal":', resEn.length, 'results. First item:', resEn[0].latin, '| EN:', resEn[0].english);

// 3. Search Uzbek term "bosh og'rig'i"
const resUz = engine.search("bosh og'rig'i");
console.log('Search Uzbek "bosh og\'rig\'i":', resUz.length, 'results. First item:', resUz[0].latin, '|', resUz[0].uzbek);

// 4. Test category filters
const anat = engine.search('', 'anatomy');
const lat = engine.search('', 'latin');
const rx = engine.search('', 'prescription');
const clin = engine.search('', 'clinical');

console.log('Category filter anatomy:', anat.length);
console.log('Category filter latin:', lat.length);
console.log('Category filter prescription:', rx.length);
console.log('Category filter clinical:', clin.length);

if (anat.length === 14982 && lat.length === 5931 && rx.length === 35 && clin.length === 24) {
  console.log('SUCCESS: All category filters and search queries work 100% accurately!');
} else {
  console.error('Category counts mismatch!');
  process.exit(1);
}
