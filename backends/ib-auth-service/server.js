require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const logger = require('./server/main/common/logger');
const config = require('./server/config');

const app = express();
const PORT = config.port;

// CORS configuration for credentials
const corsOptions = {
  origin: process.env.CORS_ORIGIN || ['http://localhost:5000', 'http://localhost:5001', 'http://localhost:5003', 'http://127.0.0.1:5000', 'http://127.0.0.1:5001', 'http://127.0.0.1:5003'],
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
app.use('/api/auth', require('./server/routes'));

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
  });
}

module.exports = app;
