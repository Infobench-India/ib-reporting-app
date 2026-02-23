const jwt = require('jsonwebtoken');
const logger = require('../main/common/logger');

const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

const verifyAccessToken = (token) => {
  try {
    console.log("Access token verification###s:", token);
    console.log("Access token verification###s:", jwtSecret);
    return jwt.verify(token, jwtSecret);
  } catch (err) {
    console.log("Access token verification failed###s:", err.message);
    logger.warn('Access token verification failed:', err.message);
    return null;
  }
};

module.exports = {
  verifyAccessToken
};
