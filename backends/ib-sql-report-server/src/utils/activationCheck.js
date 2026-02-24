const axios = require('axios');
const logger = require('../main/common/logger');

const AUTH_SERVICE_BASE = process.env.AUTH_SERVICE_BASE || 'http://localhost:3051';
const CACHE_TTL_MS = parseInt(process.env.ACTIVATION_CACHE_TTL_MS || '60000', 10); // 60s default
const MAX_RETRIES = parseInt(process.env.ACTIVATION_MAX_RETRIES || '3', 10);
const BASE_DELAY_MS = parseInt(process.env.ACTIVATION_BASE_DELAY_MS || '500', 10);

let cache = {
  status: null,
  ts: 0
};

function isCacheValid() {
  return cache.status && (Date.now() - cache.ts) < CACHE_TTL_MS;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithRetries() {
  let lastErr = null;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const resp = await axios.get(`${AUTH_SERVICE_BASE}/api/auth/activation/status`, { timeout: 5000 });
      if (resp.status === 200) {
        console.log('Activation check successful:', resp.data);
        // Return the full data object from the response
        return { activated: true, ...resp.data };
      }
      // Unexpected non-200 (shouldn't happen; treat as not activated)
      return { activated: false, reason: `unexpected-status-${resp.status}` };
    } catch (err) {
      lastErr = err;
      // If server responded 403, no need to retry
      if (err.response && err.response.status === 403) {
        return { activated: false, reason: err.response.data?.reason || 'not-activated' };
      }
      logger.warn(`Activation check attempt ${attempt} failed: ${err.message || err}`);
      if (attempt < MAX_RETRIES) {
        const delay = BASE_DELAY_MS * Math.pow(2, attempt - 1);
        await sleep(delay);
      }
    }
  }
  logger.error('Activation check final failure', lastErr && (lastErr.message || lastErr));
  return { activated: false, reason: 'network-error', error: lastErr && (lastErr.message || String(lastErr)) };
}

async function checkActivation(forceRefresh = false) {
  if (!forceRefresh && isCacheValid()) {
    console.log('Using cached activation status:', cache.status);
    return cache.status;
  }

  const status = await fetchWithRetries();
  console.log('Fetched activation status:', status);
  cache = { status, ts: Date.now() };
  return status;
}

// Allow forcing a refresh from other modules if necessary
async function forceRefresh() {
  return checkActivation(true);
}

module.exports = { checkActivation, forceRefresh };
