const path = require('path');
require('dotenv').config({
  path: process.pkg
    ? path.join(__dirname, '../.env.production')
    : path.join(__dirname, '../.env')
});
// Initialize Scheduler
const { initScheduler } = require('./api/services/schedulerService');
const { checkActivation } = require('./utils/activationCheck');

async function start() {
  // Always initialize scheduler; it will check activation internally before running jobs
  initScheduler();
}

start();
