const { machineIdSync } = require('node-machine-id');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '../../');
const EXTERNAL_DIR = process.pkg ? path.dirname(process.execPath) : ROOT_DIR;
const DEFAULT_LICENSE_PATH = path.join(EXTERNAL_DIR, 'activation.lic');
const DEFAULT_PUB_PATH = path.join(ROOT_DIR, 'public.pem');

let publicKey = null;

function loadPublicKey() {
  if (process.env.ACTIVATION_PUBLIC_KEY) {
    publicKey = process.env.ACTIVATION_PUBLIC_KEY;
    return publicKey;
  }

  const pubPath = process.env.ACTIVATION_PUBLIC_KEY_PATH || DEFAULT_PUB_PATH;
  console.log('Loading public key from', pubPath);
  if (fs.existsSync(pubPath)) {
    publicKey = fs.readFileSync(pubPath, 'utf8');
    return publicKey;
  }

  return null;
}

function setPublicKey(pem) {
  publicKey = pem;
}

function getMachineId(options = { original: true }) {
  return machineIdSync(options);
}

function _parseLicense(content) {
  if (!content) return null;
  let text = content;
  if (Buffer.isBuffer(content)) text = content.toString('utf8');
  try {
    return JSON.parse(text);
  } catch (err) {
    return null;
  }
}

function verifyLicense(licenseContent) {
  const license = _parseLicense(licenseContent);
  if (!license) return { valid: false, reason: 'invalid-json' };

  const { data, signature } = license;
  if (!data || !signature) return { valid: false, reason: 'missing-fields' };

  if (!publicKey) loadPublicKey();
  if (!publicKey) return { valid: false, reason: 'no-public-key' };

  try {
    const verifier = crypto.createVerify('SHA256');
    verifier.update(data);
    verifier.end();
    const sigBuf = Buffer.from(signature, 'base64');
    const ok = verifier.verify(publicKey, sigBuf);
    if (!ok) return { valid: false, reason: 'bad-signature' };

    const payload = JSON.parse(data);
    console.log('License payload:', payload);
    const currentMachineId = getMachineId();
    if (payload.machineId !== currentMachineId) return { valid: false, reason: 'machine-id-mismatch' };
    if (payload.expiresAt && new Date() > new Date(payload.expiresAt)) {
      return { valid: false, reason: 'expired' };
    }
    return { valid: true, payload };
  } catch (err) {
    return { valid: false, reason: 'verify-error', error: err.message };
  }
}

function activate(licenseContent, savePath = DEFAULT_LICENSE_PATH) {
  const res = verifyLicense(licenseContent);
  if (!res.valid) return res;

  try {
    let text = licenseContent;
    if (typeof licenseContent !== 'string') text = JSON.stringify(_parseLicense(licenseContent));
    fs.writeFileSync(savePath, text, { encoding: 'utf8', mode: 0o600 });
    return { valid: true, savedTo: savePath };
  } catch (err) {
    return { valid: false, reason: 'save-failed', error: err.message };
  }
}

function isActivated(licensePath = DEFAULT_LICENSE_PATH) {
  if (!fs.existsSync(licensePath)) return { activated: false, reason: 'missing-license' };
  const content = fs.readFileSync(licensePath, 'utf8');
  const res = verifyLicense(content);
  if (!res.valid) return { activated: false, reason: res.reason };
  return { activated: true, payload: res.payload };
}

module.exports = {
  getMachineId,
  verifyLicense,
  activate,
  isActivated,
  loadPublicKey,
  setPublicKey,
};
