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
const activationService = require('./services/activationService');
const { initializeDatabase } = require('./utils/init-db');

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

// Routes
app.use('/api/auth', require('./routes'));

// Activation status accessible to routes
try {
  activationService.loadPublicKey();
  const activationStatus = activationService.isActivated();
  app.locals.activation = activationStatus;
  if (activationStatus.activated) {
    logger.info('Application activation: activated');
    logger.info(`Activation payload: ${JSON.stringify(activationStatus.payload)}`);
  } else {
    logger.warn(`Application activation: NOT activated (${activationStatus.reason})`);
  }
} catch (err) {
  logger.error('Activation check failed on startup', err);
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'Auth Service running', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
  });
});

if (require.main === module) {
  app.listen(PORT, () => {
    logger.info(`Authentication Service running on port ${PORT}`);
    // Auto-initialize DB schema on startup (non-blocking)
    initializeDatabase().catch(err => logger.error('DB init failed:', err.message));
  });
}

module.exports = app;
