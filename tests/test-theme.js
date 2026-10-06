import assert from 'assert';
import { ThemeManager } from '../js/modules/theme-manager.js';

console.log('Running ThemeManager unit tests...');

// Mock browser globals for testing
class MockStorage {
  constructor() { this.store = {}; }
  getItem(k) { return this.store[k] || null; }
  setItem(k, v) { this.store[k] = String(v); }
  removeItem(k) { delete this.store[k]; }
}

const mockStorage = new MockStorage();
const mockRoot = {
  attributes: {},
  setAttribute(k, v) { this.attributes[k] = v; },
  getAttribute(k) { return this.attributes[k]; }
};

const themeManager = new ThemeManager({
  storage: mockStorage,
  rootElement: mockRoot,
  systemPrefersDark: false
});

// Test 1: Default initialization with light system
themeManager.init();
assert.strictEqual(themeManager.getTheme(), 'light', 'Default theme should be light');
assert.strictEqual(mockRoot.getAttribute('data-theme'), 'light', 'data-theme on root should be light');
console.log('✓ Test 1 Passed: Default theme initialization');

// Test 2: Set explicit theme
themeManager.setTheme('dark');
assert.strictEqual(themeManager.getTheme(), 'dark', 'Theme should be dark');
assert.strictEqual(mockStorage.getItem('medlatin_theme'), 'dark', 'Storage should persist dark');
assert.strictEqual(mockRoot.getAttribute('data-theme'), 'dark', 'Root data-theme should be dark');
console.log('✓ Test 2 Passed: Set explicit theme');

// Test 3: Toggle theme
const newTheme = themeManager.toggleTheme();
assert.strictEqual(newTheme, 'light', 'Toggled theme should be light');
assert.strictEqual(themeManager.getTheme(), 'light', 'Current theme should be light');
assert.strictEqual(mockStorage.getItem('medlatin_theme'), 'light', 'Storage should be updated to light');
assert.strictEqual(mockRoot.getAttribute('data-theme'), 'light', 'Root data-theme should be light');
console.log('✓ Test 3 Passed: Toggle theme');

// Test 4: Restore from storage on init
const restoredManager = new ThemeManager({
  storage: mockStorage,
  rootElement: mockRoot,
  systemPrefersDark: false
});
restoredManager.init();
assert.strictEqual(restoredManager.getTheme(), 'light', 'Should restore light theme from storage');
console.log('✓ Test 4 Passed: Restore from storage');

console.log('ALL THEME TESTS PASSED!');
