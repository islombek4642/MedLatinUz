import assert from 'assert';
import { SearchEngine } from '../js/modules/search-engine.js';

console.log('Running SearchEngine.highlightMatch unit tests...');

// Test 1: Exact punctuation match
const t1 = SearchEngine.highlightMatch('Rp. Charta cerata', 'Rp.');
assert.strictEqual(t1, '<mark class="search-highlight">Rp.</mark> Charta cerata');
console.log('✓ Test 1 Passed: Punctuation query highlighting');

// Test 2: Case insensitivity
const t2 = SearchEngine.highlightMatch('Aorta abdominalis', 'aorta');
assert.strictEqual(t2, '<mark class="search-highlight">Aorta</mark> abdominalis');
console.log('✓ Test 2 Passed: Case-insensitive query highlighting');

// Test 3: Multiple occurrences
const t3 = SearchEngine.highlightMatch('arteria and arteria', 'arteria');
assert.strictEqual(t3, '<mark class="search-highlight">arteria</mark> and <mark class="search-highlight">arteria</mark>');
console.log('✓ Test 3 Passed: Multiple occurrences highlighting');

// Test 4: Empty query returns escaped text without marks
const t4 = SearchEngine.highlightMatch('Normal text <b>bold</b>', '');
assert.strictEqual(t4, 'Normal text &lt;b&gt;bold&lt;/b&gt;');
console.log('✓ Test 4 Passed: Empty query & HTML escaping');

console.log('ALL HIGHLIGHT TESTS PASSED!');
