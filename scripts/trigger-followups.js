const http = require('http');

console.log("Triggering Follow-Up Engine (Test Mode)...");

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/cron/follow-ups?test=true',
  method: 'GET'
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    console.log(`Response Status: ${res.statusCode}`);
    console.log(`Response Body: ${data}`);
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.end();
