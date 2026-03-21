const http = require('http');

const data = JSON.stringify({
  name: 'Test Name',
  email: `test${Date.now()}@test.com`,
  password: 'password123',
  phone: `+1${Date.now()}`,
  role: 'patient'
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/signup',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => console.log(`Status: ${res.statusCode}\nBody: ${body}`));
});

req.on('error', (e) => console.error(`Problem with request: ${e.message}`));
req.write(data);
req.end();
