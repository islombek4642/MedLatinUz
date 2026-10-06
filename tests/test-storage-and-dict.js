import assert from 'assert';
import fs from 'fs';
import { DBStorage } from '../js/modules/db-storage.js';
import { SearchEngine } from '../js/modules/search-engine.js';

console.log('Testing dictionary.json integrity and DBStorage...');

// 1. Verify dictionary.json
const dictRaw = fs.readFileSync('data/dictionary.json', 'utf-8');
const entries = JSON.parse(dictRaw);

assert.strictEqual(entries.length, 20972, `Expected 20,972 entries, got ${entries.length}`);
console.log('✓ Test 1 Passed: Unified dictionary.json has exact 20,972 entries');

const idSet = new Set();
for (const item of entries) {
  assert.ok(item.id, 'Entry must have id');
  assert.ok(item.latin, `Entry ${item.id} must have latin`);
  assert.ok(item.translation_uz, `Entry ${item.id} must have translation_uz`);
  assert.ok(item.definition_uz, `Entry ${item.id} must have definition_uz`);
  assert.ok(item.category, `Entry ${item.id} must have category`);
  assert.ok(!idSet.has(item.id), `Duplicate ID found: ${item.id}`);
  idSet.add(item.id);
}
console.log('✓ Test 2 Passed: All 20,972 entries are structurally valid with 0 duplicates');

// 2. Test DBStorage API in Node environment (graceful degradation)
assert.strictEqual(typeof DBStorage.openDB, 'function');
assert.strictEqual(typeof DBStorage.getAll, 'function');
assert.strictEqual(typeof DBStorage.saveAll, 'function');
assert.strictEqual(typeof DBStorage.count, 'function');

const count = await DBStorage.count();
assert.strictEqual(count, 0); // Gracefully returns 0 in Node
console.log('✓ Test 3 Passed: DBStorage graceful degradation in Node environment');

// 3. Test SearchEngine with unified entries
const engine = new SearchEngine();
engine.init(entries);
const rxResults = engine.search('Rp.', 'prescription');
assert.ok(rxResults.length > 0, 'Should find Rp. in prescriptions');
assert.strictEqual(rxResults[0].latin, 'Rp.');
console.log('✓ Test 4 Passed: SearchEngine successfully indexes and queries unified entries');

console.log('ALL STORAGE & UNIFIED DICTIONARY TESTS PASSED!');
