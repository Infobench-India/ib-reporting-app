const jwt = require('jsonwebtoken');
const config = require('../config');
const logger = require('../main/common/logger');

const generateTokens = (user) => {
  try {
    const accessToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        roleId: user.roleId,
        role: user.role,
        permissions: user.permissions || []
      },
      config.jwtSecret,
      { expiresIn: config.jwtExpiry }
    );

    const refreshToken = jwt.sign(
      { userId: user.id, email: user.email },
      config.jwtRefreshSecret,
      { expiresIn: config.jwtRefreshExpiry }
    );

    return { accessToken, refreshToken };
  } catch (err) {
    logger.error('Token generation failed:', err);
    throw err;
  }
};

const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, config.jwtSecret);
  } catch (err) {
    logger.warn('Access token verification failed:', err.message);
    return null;
  }
};

const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, config.jwtRefreshSecret);
  } catch (err) {
    logger.warn('Refresh token verification failed:', err.message);
    return null;
  }
};

const decodeToken = (token) => {
  try {
    return jwt.decode(token);
  } catch (err) {
    logger.warn('Token decode failed:', err.message);
    return null;
  }
};

module.exports = {
  generateTokens,
  verifyAccessToken,
  verifyRefreshToken,
  decodeToken
};
