import http from 'http';

function req(path, method='GET', data=null) {
  return new Promise((resolve, reject) => {
    const opts = { hostname:'localhost', port:5000, path, method, headers:{} };
    if (data) opts.headers['Content-Type'] = 'application/json';
    const r = http.request(opts, res => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(body) }));
    });
    r.on('error', e => reject(e));
    if (data) r.write(JSON.stringify(data));
    r.end();
  });
}

try {
  const calc = await req('/api/routes/calculate', 'POST', { startLocation:'Prague', endLocation:'Rome' });
  console.log('Route ID:', calc.body.id);
  console.log('Number of segments:', calc.body.segments?.length || 0);
  
  if (calc.body.segments) {
    calc.body.segments.forEach((seg, i) => {
      console.log(`\nSegment ${i + 1}:`);
      console.log('  Title:', seg.title);
      console.log('  Start:', seg.startLocation?.name, seg.startLocation?.coordinates);
      console.log('  End:', seg.endLocation?.name, seg.endLocation?.coordinates);
      console.log('  Waypoints:', seg.waypoints?.length || 0);
      if (seg.waypoints && seg.waypoints.length > 0) {
        seg.waypoints.forEach((wp, j) => {
          console.log(`    Waypoint ${j + 1}:`, wp.name, wp.coordinates);
        });
      }
    });
  }
} catch (e) {
  console.error('ERR', e.message);
}
