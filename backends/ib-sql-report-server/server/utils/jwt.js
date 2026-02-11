const jwt = require('jsonwebtoken');
const logger = require('../main/common/logger');

const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, jwtSecret);
  } catch (err) {
    logger.warn('Access token verification failed:', err.message);
    return null;
  }
};

module.exports = {
  verifyAccessToken
};
