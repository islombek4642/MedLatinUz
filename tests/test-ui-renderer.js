import assert from 'assert';
import { UIRenderer } from '../js/modules/ui-renderer.js';

console.log('Testing UIRenderer basics...');

assert.strictEqual(typeof UIRenderer.renderCards, 'function');
assert.strictEqual(typeof UIRenderer.showToast, 'function');
assert.strictEqual(typeof UIRenderer.escapeHtml, 'function');
assert.strictEqual(UIRenderer.escapeHtml('<script>alert("xss")</script>'), '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');

console.log('ALL UI RENDERER BASIC TESTS PASSED!');
