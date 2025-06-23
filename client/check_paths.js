const fs = require('fs');
const path = require('path');
const required = ['server.js', 'public', 'src'];
for (const item of required) {
  if (!fs.existsSync(path.join(__dirname, item))) {
    throw new Error(`Missing ${item}`);
  }
}
console.log('Paths OK');
