async function checkUrl(url) {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    console.log(`URL: ${url} -> Status: ${res.status} ${res.statusText}`);
    const text = await res.text();
    console.log(`Length: ${text.length} chars. Sample: ${text.slice(0, 200).replace(/\s+/g, ' ')}\n`);
    return { ok: res.ok, status: res.status, length: text.length };
  } catch (err) {
    console.error(`Error fetching ${url}:`, err.message);
    return { ok: false, error: err.message };
  }
}

async function run() {
  console.log('--- Probing AnatomyFYI ---');
  await checkUrl('https://anatomyfyi.com/glossary/');
  await checkUrl('https://anatomyfyi.com/regions/');
  await checkUrl('https://anatomyfyi.com/structure/adductor-longus/');

  console.log('--- Probing Latin Dictionary ---');
  await checkUrl('https://www.latin-dictionary.net/definition/7/abactius-abactia-abactium');
}

run();
