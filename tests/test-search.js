import assert from 'assert';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { SearchEngine } from '../js/modules/search-engine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load entries from unified dictionary.json
const dictPath = path.resolve(__dirname, '../data/dictionary.json');
const allEntries = JSON.parse(fs.readFileSync(dictPath, 'utf8'));

console.log(`Running SearchEngine unit tests with ${allEntries.length.toLocaleString()} entries...`);

const engine = new SearchEngine();
engine.init(allEntries);

// Test 1: Search by Latin term with punctuation (e.g. "rp" finds "Rp.")
const res1 = engine.search('rp');
assert(res1.length > 0, 'Test 1 Failed: "rp" should find "Rp."');
assert(res1.some(e => e.latin === 'Rp.'), 'Test 1 Failed: Should find Rp.');
console.log('✓ Test 1 Passed: Case-insensitive search with punctuation');

// Test 2: Search with dots "systema"
const res2 = engine.search('systema');
assert(res2.length > 0, 'Test 2 Failed: "systema" search');
console.log('✓ Test 2 Passed: Multi-word Latin prefix search');

// Test 3: Search by Uzbek translation ("yurak")
const res3 = engine.search('yurak');
assert(res3.some(e => e.uzbek.toLowerCase().includes('yurak')), 'Test 3 Failed: "yurak" should find heart related entries');
console.log('✓ Test 3 Passed: Bi-directional search (Uzbek to Latin)');

// Test 4: Search by English ("skeletal")
const res4 = engine.search('skeletal');
assert(res4.length > 0, 'Test 4 Failed: "skeletal" should find skeletal terms');
console.log('✓ Test 4 Passed: English search support');

// Test 5: Category filter
const rx = engine.search('', 'prescription');
assert.strictEqual(rx.length, 35, `Expected 35 prescription entries, got ${rx.length}`);
console.log('✓ Test 5 Passed: Category filtering');

console.log('ALL SearchEngine unit tests PASSED!');
