const https = require('https');

const data = JSON.stringify({
  messages: [{ role: 'user', content: 'Say test' }],
  model: 'llama-3.3-70b-versatile',
});

const options = {
  hostname: 'api.groq.com',
  port: 443,
  path: '/openai/v1/chat/completions',
  method: 'POST',
  headers: {
    'Authorization': 'Bearer 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',
    'Content-Type': 'application/json',
    'Content-Length': data.length,
  },
};

const req = https.request(options, (res) => {
  let responseBody = '';
  res.on('data', (chunk) => {
    responseBody += chunk;
  });
  res.on('end', () => {
    console.log(`Status Code: ${res.statusCode}`);
    console.log(`Response: ${responseBody}`);
  });
});

req.on('error', (error) => {
  console.error(error);
});

req.write(data);
req.end();
