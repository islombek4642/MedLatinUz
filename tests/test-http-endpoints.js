import http from 'http';

const endpoints = [
  { url: 'http://localhost:3000/', expectedMime: 'text/html' },
  { url: 'http://localhost:3000/index.html', expectedMime: 'text/html' },
  { url: 'http://localhost:3000/css/main.css', expectedMime: 'text/css' },
  { url: 'http://localhost:3000/css/variables.css', expectedMime: 'text/css' },
  { url: 'http://localhost:3000/js/app.js', expectedMime: 'application/javascript' },
  { url: 'http://localhost:3000/js/modules/search-engine.js', expectedMime: 'application/javascript' },
  { url: 'http://localhost:3000/js/modules/data-loader.js', expectedMime: 'application/javascript' },
  { url: 'http://localhost:3000/js/modules/ui-renderer.js', expectedMime: 'application/javascript' },
  { url: 'http://localhost:3000/data/prescriptions.json', expectedMime: 'application/json' },
  { url: 'http://localhost:3000/data/anatomy.json', expectedMime: 'application/json' },
  { url: 'http://localhost:3000/data/clinical.json', expectedMime: 'application/json' },
  { url: 'http://localhost:3000/data/general.json', expectedMime: 'application/json' },
  { url: 'http://localhost:3000/data/anatomy_organs.json', expectedMime: 'application/json' },
  { url: 'http://localhost:3000/data/anatomy_bones.json', expectedMime: 'application/json' },
  { url: 'http://localhost:3000/data/anatomy_nerves.json', expectedMime: 'application/json' },
  { url: 'http://localhost:3000/data/anatomy_vessels.json', expectedMime: 'application/json' },
  { url: 'http://localhost:3000/data/anatomy_muscles.json', expectedMime: 'application/json' },
  { url: 'http://localhost:3000/data/anatomy_glands.json', expectedMime: 'application/json' },
  { url: 'http://localhost:3000/data/anatomy_joints.json', expectedMime: 'application/json' },
  { url: 'http://localhost:3000/data/anatomy_ligaments.json', expectedMime: 'application/json' },
  { url: 'http://localhost:3000/data/anatomy_tendons.json', expectedMime: 'application/json' },
  { url: 'http://localhost:3000/manifest.json', expectedMime: 'application/json' },
  { url: 'http://localhost:3000/sw.js', expectedMime: 'application/javascript' }
];

async function checkEndpoint(item) {
  return new Promise((resolve, reject) => {
    http.get(item.url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode !== 200) {
          return reject(new Error(`${item.url} returned status ${res.statusCode}`));
        }
        if (item.expectedMime && !res.headers['content-type'].includes(item.expectedMime)) {
          return reject(new Error(`${item.url} expected ${item.expectedMime}, got ${res.headers['content-type']}`));
        }
        resolve({ url: item.url, size: data.length });
      });
    }).on('error', reject);
  });
}

async function run() {
  console.log('Testing HTTP server endpoints...');
  for (const ep of endpoints) {
    try {
      const res = await checkEndpoint(ep);
      console.log(`✓ OK: ${ep.url} (${res.size.toLocaleString()} bytes)`);
    } catch (err) {
      console.error(`✗ FAIL: ${ep.url} - ${err.message}`);
      process.exit(1);
    }
  }
  console.log('\nAll endpoints verified successfully with 200 OK and correct MIME types!');
}

run();
