import assert from 'assert';
import { BookmarkManager } from '../js/modules/bookmark-manager.js';

console.log('Running BookmarkManager unit tests...');

class MockStorage {
  constructor() { this.store = {}; }
  getItem(k) { return this.store[k] || null; }
  setItem(k, v) { this.store[k] = String(v); }
  removeItem(k) { delete this.store[k]; }
}

const mockStorage = new MockStorage();
const bookmarkManager = new BookmarkManager({ storage: mockStorage });

// Test 1: Initially empty
assert.strictEqual(bookmarkManager.count(), 0, 'Initial count should be 0');
assert.strictEqual(bookmarkManager.isBookmarked('rx_0001'), false, 'Should not be bookmarked');
console.log('✓ Test 1 Passed: Initially empty state');

// Test 2: Add bookmark
const added = bookmarkManager.add('rx_0001');
assert.strictEqual(added, true, 'Add should return true');
assert.strictEqual(bookmarkManager.isBookmarked('rx_0001'), true, 'Should now be bookmarked');
assert.strictEqual(bookmarkManager.count(), 1, 'Count should be 1');
console.log('✓ Test 2 Passed: Add bookmark');

// Test 3: Toggle bookmark
const toggledOff = bookmarkManager.toggle('rx_0001');
assert.strictEqual(toggledOff, false, 'Toggle off should return false');
assert.strictEqual(bookmarkManager.isBookmarked('rx_0001'), false, 'Should no longer be bookmarked');
assert.strictEqual(bookmarkManager.count(), 0, 'Count should be 0');

const toggledOn = bookmarkManager.toggle('rx_0001');
assert.strictEqual(toggledOn, true, 'Toggle on should return true');
assert.strictEqual(bookmarkManager.isBookmarked('rx_0001'), true, 'Should be bookmarked again');
console.log('✓ Test 3 Passed: Toggle bookmark');

// Test 4: Persistence in storage
const restoredManager = new BookmarkManager({ storage: mockStorage });
assert.strictEqual(restoredManager.isBookmarked('rx_0001'), true, 'Restored manager should have rx_0001');
assert.deepStrictEqual(restoredManager.getAll(), ['rx_0001'], 'GetAll should return stored IDs');
console.log('✓ Test 4 Passed: Storage persistence');

console.log('ALL BOOKMARK TESTS PASSED!');
