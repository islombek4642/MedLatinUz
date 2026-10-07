import fs from 'fs';
import path from 'path';

const dist = path.resolve('dist');
fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });

const toCopy = ['index.html', 'manifest.json', 'sw.js', 'css', 'js', 'data'];
for (const item of toCopy) {
  if (fs.existsSync(item)) {
    fs.cpSync(path.resolve(item), path.join(dist, item), { recursive: true });
  }
}
console.log('Build successful: all static assets prepared in dist/');
