import http from 'http';

console.log('Testing POI endpoint for route 3 (Prague to Rome)...\n');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/routes/3/pois',
  method: 'GET',
};

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  
  let body = '';
  res.on('data', (chunk) => {
    body += chunk;
  });
  
  res.on('end', () => {
    try {
      const pois = JSON.parse(body);
      console.log(`\n✓ Found ${pois.length} POIs`);
      
      // Group by type
      const byType = pois.reduce((acc, poi) => {
        acc[poi.type] = (acc[poi.type] || 0) + 1;
        return acc;
      }, {});
      
      console.log('\nPOIs by type:');
      Object.entries(byType).forEach(([type, count]) => {
        console.log(`  ${type}: ${count}`);
      });
      
      // Show first 5 POIs
      console.log('\nFirst 5 POIs:');
      pois.slice(0, 5).forEach(poi => {
        console.log(`  - ${poi.name} (${poi.type})`);
      });
    } catch (e) {
      console.log('Response:', body.substring(0, 200));
    }
  });
});

req.on('error', (e) => {
  console.error(`Request error: ${e.message}`);
});

req.end();
