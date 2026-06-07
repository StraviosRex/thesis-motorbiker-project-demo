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

try {
  const saved = await req('/api/routes/saved');
  console.log('SAVED', saved.status, saved.body.slice(0,300));
  const calc = await req('/api/routes/calculate', 'POST', { startLocation:'Prague', endLocation:'Rome' });
  console.log('CALC', calc.status, calc.body.slice(0,500));
} catch (e) {
  console.error('ERR', e.message);
}
