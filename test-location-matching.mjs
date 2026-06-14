import http from 'http';

function req(path, method='GET', data=null) {
  return new Promise((resolve, reject) => {
    const opts = { hostname:'localhost', port:5000, path, method, headers:{} };
    if (data) opts.headers['Content-Type'] = 'application/json';
    const r = http.request(opts, res => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => resolve({ status: res.statusCode, body }));
    });
    r.on('error', e => reject(e));
    if (data) r.write(JSON.stringify(data));
    r.end();
  });
}

const testCases = [
  ['Prague', 'Rome'],
  ['prague', 'rome'],
  ['Praha', 'Roma'],
  ['Czech Republic', 'Italy'],
  ['Berlin', 'Rome'],
];

for (const [start, end] of testCases) {
  try {
    const result = await req('/api/routes/calculate', 'POST', { startLocation: start, endLocation: end });
    const data = JSON.parse(result.body);
    console.log(`✓ ${start} → ${end}: Found route "${data.name}" (ID ${data.id})`);
  } catch (e) {
    console.log(`✗ ${start} → ${end}: ${e.message}`);
  }
}
