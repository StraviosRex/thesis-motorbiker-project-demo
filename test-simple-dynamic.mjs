import http from 'http';

console.log('Testing Prague → Istanbul dynamic route...\n');

const data = JSON.stringify({
  startLocation: 'Prague',
  endLocation: 'Istanbul'
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
    console.log('Response:', body);
    try {
      const json = JSON.parse(body);
      console.log('\nParsed:', JSON.stringify(json, null, 2));
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
