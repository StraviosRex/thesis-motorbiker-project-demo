import http from 'http';

console.log('Testing Prague → Athens dynamic route...\n');

const data = JSON.stringify({
  startLocation: 'Prague',
  endLocation: 'Athens'
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/routes/calculate',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  
  let body = '';
  res.on('data', (chunk) => {
    body += chunk;
  });
  
  res.on('end', () => {
    console.log('Response:', body.substring(0, 200));
    try {
      const json = JSON.parse(body);
      if (json.id === 0) {
        console.log('\n✓ Dynamic route calculated!');
        console.log('Distance:', json.totalDistance + 'km');
        console.log('Segments:', json.segments?.length);
      } else if (json.id > 0) {
        console.log('\n✓ Curated route found!');
        console.log('Name:', json.name);
      } else {
        console.log('\n✗ Error:', json.message);
      }
    } catch (e) {
      console.log('Could not parse as JSON');
    }
  });
});

req.on('error', (e) => {
  console.error(`Request error: ${e.message}`);
});

req.write(data);
req.end();
