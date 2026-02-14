const crypto = require('crypto');
const os = require('os');
const fs = require('fs');

const rawId = os.hostname() + os.arch() + os.platform();
const machineId = crypto.createHash('sha256').update(rawId).digest('hex');

fs.writeFileSync('machine-id.txt', machineId);
console.log('✅ Machine ID:', machineId);
