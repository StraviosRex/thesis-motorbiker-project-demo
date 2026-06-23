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
  const result = await req('/api/routes/calculate', 'POST', { startLocation: 'Praha', endLocation: 'Roma' });
  console.log('Status:', result.status);
  console.log('Response:', result.body);
} catch (e) {
  console.error('Error:', e.message);
}
