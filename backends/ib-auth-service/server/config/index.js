module.exports = {
  sqlUri: process.env.SQL_CONFIG_DB || '',
  port: process.env.AUTH_SERVICE_PORT || 3051,
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-change-in-production',
  jwtExpiry: process.env.JWT_EXPIRY || '15m',
  jwtRefreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
  nodeEnv: process.env.NODE_ENV || 'development'
};
