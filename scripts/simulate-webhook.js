const http = require('http');

const messages = [
  { phone: "15551234567", name: "Alice", text: "Hi, I'm interested in CloseCraft." },
  { phone: "15551234567", name: "Alice", text: "How much does it cost?" },
  { phone: "15559876543", name: "Bob", text: "I need to talk to a human about an issue." },
  { phone: "15551112222", name: "Charlie", text: "I am ready to buy right now." }
];

async function sendWebhook(msg) {
  const payload = {
    object: "whatsapp_business_account",
    entry: [{
      id: "WHATSAPP_BUSINESS_ACCOUNT_ID",
      changes: [{
        value: {
          messaging_product: "whatsapp",
          metadata: {
            display_phone_number: "16505551111",
            phone_number_id: "123456123"
          },
          contacts: [{
            profile: { name: msg.name },
            wa_id: msg.phone
          }],
          messages: [{
            from: msg.phone,
            id: `wamid.${Math.random().toString(36).substring(7)}`,
            timestamp: Math.floor(Date.now() / 1000).toString(),
            text: { body: msg.text },
            type: "text"
          }]
        },
        field: "messages"
      }]
    }]
  };

  console.log(`\nSimulating incoming message from ${msg.name}: "${msg.text}"`);
  
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/webhooks/whatsapp',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(JSON.stringify(payload))
    }
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        console.log(`Response Status: ${res.statusCode}`);
        resolve(data);
      });
    });

    req.on('error', (e) => {
      console.error(`Problem with request: ${e.message}`);
      reject(e);
    });

    req.write(JSON.stringify(payload));
    req.end();
  });
}

async function run() {
  for (const msg of messages) {
    await sendWebhook(msg);
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
}

run();
