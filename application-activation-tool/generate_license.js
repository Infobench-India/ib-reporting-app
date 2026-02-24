const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const features = {
  sql_analytics: true,
  scheduler: true,
  audit_logs: true,
  realtime_monitoring: true,
  advanced_visuals: true,
  unlimited_entities: true,
  autoEmail: true,
  numberOfEmails: 10,
  excelReport: true,
  pdfReport: true,
  numberOfReports: 10,
  numberOfChartsPerReport: 10,
}
function usage() {
  console.log('Usage: node generate_license.js --machineId <id> --key <private.pem> [--out activation.lic] [--expires YYYY-MM-DDTHH:MM:SSZ]');
  process.exit(1);
}

function parseArg(keyShort, keyLong) {
  const idxLong = process.argv.indexOf(`--${keyLong}`);
  const idxShort = process.argv.indexOf(`-${keyShort}`);
  if (idxLong >= 0 && process.argv.length > idxLong + 1) return process.argv[idxLong + 1];
  if (idxShort >= 0 && process.argv.length > idxShort + 1) return process.argv[idxShort + 1];
  return null;
}

const machineId = parseArg('m', 'machineId') || (fs.existsSync('machine-id.txt') ? fs.readFileSync('machine-id.txt', 'utf8').trim() : null);
const keyPath = parseArg('k', 'key') || 'private.pem';
const outPath = parseArg('o', 'out') || 'activation.lic';
const expires = parseArg('e', 'expires') || null;
console.log('Generating license with Machine ID:', machineId);
console.log('Using private key from:', keyPath);
console.log('Output license path:', outPath);
console.log('License expires at:', expires || 'never');
if (!machineId) {
  console.error('Missing machineId');
  usage();
}

if (!fs.existsSync(keyPath)) {
  console.error('Private key not found at', keyPath);
  process.exit(2);
}

const privateKey = fs.readFileSync(keyPath, 'utf8');

const payload = {
  machineId,
  expiresAt: expires || null,
  features,
  issuedAt: new Date().toISOString()
};

const data = JSON.stringify(payload);
const sign = crypto.createSign('SHA256');
sign.update(data);
sign.end();

const signature = sign.sign(privateKey, 'base64');

const finalLicense = {
  data,
  signature
};

fs.writeFileSync(outPath, JSON.stringify(finalLicense, null, 2), 'utf8');
console.log('✅ License generated at', path.resolve(outPath));
