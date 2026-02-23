const path = require('path');
require('dotenv').config({
    path: process.pkg
        ? path.join(__dirname, '../.env.production')
        : path.join(__dirname, '../.env')
});
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const logger = require('./main/common/logger');
const config = require('./config');

const app = express();
const PORT = config.port;

// CORS configuration for credentials
const corsOptions = {
    origin: process.env.CORS_ORIGIN || [
        'http://localhost:5000',
        'http://localhost:5001',
        'http://localhost:5003',
        'http://127.0.0.1:5000',
        'http://127.0.0.1:5001',
        'http://127.0.0.1:5003',
        'http://192.168.2.20:5000',
        'http://192.168.2.20:5001',
        'http://192.168.2.20:5003'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(cors(corsOptions));
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// SQL Pool is initialized on first demand in db.js

// Routes
app.use('/api', require('./routes'));

// Initialize Cron Scheduler
const { initScheduler } = require('./api/services/schedulerService');
const { checkActivation } = require('./utils/activationCheck');

async function startApp() {
    // Always initialize scheduler; it will check activation internally before running jobs
    initScheduler();

    app.listen(PORT, () => {
        logger.info(`SQL Report Server running on port ${PORT}`);
    });
}

startApp();
