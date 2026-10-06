import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { SearchEngine } from '../js/modules/search-engine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sysPath = path.resolve(__dirname, '../data/anatomy_systems.json');
const sysEntries = JSON.parse(fs.readFileSync(sysPath, 'utf8'));

const engine = new SearchEngine();
engine.init(sysEntries);

console.log('Testing categoryFilter = "anatomy_system":');
const catResults = engine.search('', 'anatomy_system');
console.log('Found with category anatomy_system:', catResults.length);

console.log('Testing search query "tizim":');
const tizimResults = engine.search('tizim');
console.log('Found with query "tizim":', tizimResults.length);

console.log('Testing search query "skeletal":');
const skelResults = engine.search('skeletal');
console.log('Found with query "skeletal":', skelResults.length);
