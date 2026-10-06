import dns from 'dns';

dns.lookup('anatomyfyi.com', (err, address, family) => {
  if (err) {
    console.error('DNS error for anatomyfyi.com:', err);
  } else {
    console.log(`anatomyfyi.com IP: ${address} (IPv${family})`);
  }
});

dns.lookup('www.latin-dictionary.net', (err, address, family) => {
  if (err) {
    console.error('DNS error for latin-dictionary.net:', err);
  } else {
    console.log(`latin-dictionary.net IP: ${address} (IPv${family})`);
  }
});
