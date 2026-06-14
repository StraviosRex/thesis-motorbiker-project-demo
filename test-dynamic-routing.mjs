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
          resolve({ status: res.statusCode, body: JSON.parse(body) });
        }
      });
    });
    r.on('error', e => reject(e));
    if (data) r.write(JSON.stringify(data));
    r.end();
  });
}

console.log('Testing Dynamic Route Calculation\n');
console.log('='.repeat(50));

const testCases = [
  { start: 'Prague', end: 'Rome', expected: 'curated' },
  { start: 'Prague', end: 'Istanbul', expected: 'dynamic' },
  { start: 'Berlin', end: 'Athens', expected: 'dynamic' },
  { start: 'Paris', end: 'Vienna', expected: 'dynamic' },
];

for (const test of testCases) {
  console.log(`\nTest: ${test.start} → ${test.end} (expecting ${test.expected})`);
  console.log('-'.repeat(50));
  
  try {
    const result = await req('/api/routes/calculate', 'POST', { 
      startLocation: test.start, 
      endLocation: test.end,
      preferences: {
        scenicRoutes: true,
        avoidHighways: true,
        includeFerries: true
      }
    });
    
    const route = result.body;
    const isDynamic = route.id === 0;
    
    console.log(`✓ SUCCESS`);
    console.log(`  Type: ${isDynamic ? 'DYNAMIC' : 'CURATED'}`);
    console.log(`  Route: ${route.name}`);
    console.log(`  Distance: ${Math.round(route.distance)}km`);
    console.log(`  Duration: ${route.duration} minutes`);
    console.log(`  Segments: ${route.segments?.length || 0}`);
    
    if (route.segments && route.segments.length > 0) {
      console.log(`  Days:`);
      route.segments.forEach(seg => {
        console.log(`    Day ${seg.day}: ${seg.title} (${Math.round(seg.distance)}km)`);
      });
    }
    
  } catch (e) {
    console.log(`✗ FAILED: ${e.message}`);
  }
}

console.log('\n' + '='.repeat(50));
console.log('\nNotes:');
console.log('- Curated routes come from the database (ID > 0)');
console.log('- Dynamic routes are calculated on-the-fly (ID = 0)');
console.log('- If dynamic routing fails, check:');
console.log('  1. OPENROUTESERVICE_API_KEY is set in .env');
console.log('  2. API key is valid (sign up at openrouteservice.org)');
console.log('  3. Server logs for detailed error messages');
