import assert from 'assert';
import { LoadingModal } from '../js/modules/loading-modal.js';

console.log('Testing LoadingModal module...');

assert.strictEqual(typeof LoadingModal.isReady, 'function');
assert.strictEqual(typeof LoadingModal.isFirstVisit, 'function');
assert.strictEqual(typeof LoadingModal.markCompleted, 'function');

const modal = new LoadingModal();
assert.strictEqual(typeof modal.show, 'function');
assert.strictEqual(typeof modal.setProgress, 'function');
assert.strictEqual(typeof modal.hide, 'function');

console.log('ALL LOADING MODAL TESTS PASSED!');
