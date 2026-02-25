const { verifyAccessToken } = require('../utils/jwt');
const logger = require('../main/common/logger');

const authenticate = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = verifyAccessToken(token);
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    req.user = decoded;
    next();
  } catch (err) {
    logger.error('Authentication middleware error:', err);
    res.status(401).json({ error: 'Authentication failed' });
  }
};

const authorize = (requiredPermissions = []) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      const userPermissions = req.user.permissions || [];
      console.log("@@@@", req.user)
      if (requiredPermissions.length === 0) {
        return next();
      }

      const hasPermission = requiredPermissions.some(permission =>
        userPermissions.includes(permission)
      );

      if (!hasPermission) {
        logger.warn(`Unauthorized access attempt by user ${req.user.userId}`);
        return res.status(403).json({ error: 'Insufficient permissions' });
      }

      next();
    } catch (err) {
      logger.error('Authorization middleware error:', err);
      res.status(500).json({ error: 'Authorization check failed' });
    }
  };
};

const authorizeRoles = (requiredRoles = []) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
      }

      if (requiredRoles.length === 0) {
        return next();
      }

      const hasRole = requiredRoles.includes(req.user.role);

      if (!hasRole) {
        logger.warn(`Unauthorized role access attempt by user ${req.user.userId}`);
        return res.status(403).json({ error: 'Insufficient permissions' });
      }

      next();
    } catch (err) {
      logger.error('Role authorization middleware error:', err);
      res.status(500).json({ error: 'Authorization check failed' });
    }
  };
};

module.exports = {
  authenticate,
  authorize,
  authorizeRoles
};
