require("dotenv").config()
const path = require('path');
const envMode = process.env.NODE_ENV || 'production';
if (envMode === 'production') {
  require('dotenv').config({ path: path.resolve(__dirname, '.env.production') });
} else {
  require('dotenv').config({ path: path.resolve(__dirname, '.env') });
}
// Initialize Scheduler
const { initScheduler } = require('./server/api/services/schedulerService');
const { checkActivation } = require('./server/utils/activationCheck');

async function start() {
  const status = await checkActivation();
  if (!status.activated) {
    console.error('Server not activated, scheduler will not start:', status.reason || status.error);
    process.exit(1);
  }
  initScheduler();
}

start();
