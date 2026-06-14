import http from 'http';

function req(path) {
  return new Promise((resolve, reject) => {
    const opts = { hostname:'localhost', port:5000, path, method:'GET' };
    const r = http.request(opts, res => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(body) }));
    });
    r.on('error', e => reject(e));
    r.end();
  });
}

try {
  const routes = await req('/api/routes/saved');
  console.log(`Found ${routes.body.length} routes:\n`);
  routes.body.forEach(route => {
    console.log(`${route.id}: ${route.startLocation.name} → ${route.endLocation.name}`);
    console.log(`   "${route.name}"`);
  });
} catch (e) {
  console.error('ERR', e.message);
}
