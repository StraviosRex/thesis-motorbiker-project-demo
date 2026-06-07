import http from 'http';

function req(path, method='GET', data=null) {
  return new Promise((resolve, reject) => {
    const opts = { hostname:'localhost', port:5000, path, method, headers:{} };
    if (data) opts.headers['Content-Type'] = 'application/json';
    const r = http.request(opts, res => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => {
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode}: ${body}`));
        } else {
          resolve({ status: res.statusCode, body });
        }
      });
    });
    r.on('error', e => reject(e));
    if (data) r.write(JSON.stringify(data));
    r.end();
  });
}

try {
  const result = await req('/api/routes/calculate', 'POST', { 
    startLocation: 'Prague', 
    endLocation: 'Istanbul' 
  });
  const data = JSON.parse(result.body);
  console.log('✓ SUCCESS: Found route');
  console.log('  Route:', data.name);
  console.log('  ID:', data.id);
  console.log('  From:', data.startLocation?.name);
  console.log('  To:', data.endLocation?.name);
  console.log('  Segments:', data.segments?.length);
} catch (e) {
  console.log('✗ FAILED:', e.message);
  console.log('\nThis means there is NO Prague → Istanbul route in the database.');
  console.log('The route matching requires an existing saved route in the database.');
}
