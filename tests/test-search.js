import assert from 'assert';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { SearchEngine } from '../js/modules/search-engine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load sample entries from actual JSON files
const sampleFiles = ['prescriptions.json', 'anatomy.json', 'clinical.json', 'general.json'];
let allEntries = [];
for (const f of sampleFiles) {
  const p = path.resolve(__dirname, '../data', f);
  if (fs.existsSync(p)) {
    allEntries = allEntries.concat(JSON.parse(fs.readFileSync(p, 'utf8')));
  }
}

console.log('Running SearchEngine unit tests...');

const engine = new SearchEngine();
engine.init(allEntries);

// Test 1: Search by Latin term with punctuation (e.g. "rp" finds "Rp.")
const res1 = engine.search('rp');
assert(res1.length > 0, 'Test 1 Failed: "rp" should find "Rp."');
assert(res1[0].latin.startsWith('Rp'), `Test 1 Failed: First result should be Rp, got ${res1[0].latin}`);
console.log('✓ Test 1 Passed: Case-insensitive search with punctuation');

// Test 2: Search with dots "d.t.d" finds "D.t.d.N."
const res2 = engine.search('d.t.d');
assert(res2.some(e => e.id === 'rx_002'), 'Test 2 Failed: "d.t.d" should find D.t.d.N.');
console.log('✓ Test 2 Passed: Punctuation normalization');

// Test 3: Search by Uzbek translation ("yurak" finds "Cor")
const res3 = engine.search('yurak');
assert(res3.some(e => e.latin.includes('Cor')), 'Test 3 Failed: "yurak" should find "Cor"');
console.log('✓ Test 3 Passed: Bi-directional search (Uzbek to Latin)');

// Test 4: Category filtering
const res4 = engine.search('', 'anatomy');
assert(res4.length > 0, 'Test 4 Failed: Category anatomy should have entries');
assert(res4.every(e => e.category === 'anatomy'), 'Test 4 Failed: All entries must be anatomy');
console.log('✓ Test 4 Passed: Category filtering');

// Test 5: Search query + category filter together
const res5 = engine.search('bosh', 'clinical');
assert(res5.some(e => e.id === 'cln_001'), 'Test 5 Failed: "bosh" in clinical should find Cephalalgia');
console.log('✓ Test 5 Passed: Combined query + category filter');

console.log('ALL SEARCH ENGINE TESTS PASSED!');
