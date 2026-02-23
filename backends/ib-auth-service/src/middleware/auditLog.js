const logger = require('../main/common/logger');
const AuditService = require('../api/services/AuditService');

/**
 * Audit logging middleware
 * Logs all API requests and responses
 */
const auditLogger = (req, res, next) => {
  const startTime = Date.now();

  // Override res.json to capture response
  const originalJson = res.json.bind(res);
  res.json = function (data) {
    const duration = Date.now() - startTime;
    const ipAddress = req.ip || req.connection.remoteAddress;

    // Log audit for sensitive operations
    const isSensitiveOperation = [
      'POST',
      'PUT',
      'DELETE'
    ].includes(req.method);

    if (isSensitiveOperation && req.user) {
      AuditService.logAction(
        req.user.userId,
        `${req.method} ${req.path}`,
        req.path.split('/')[1],
        {
          method: req.method,
          path: req.path,
          duration: `${duration}ms`,
          requestBody: req.body
        },
        ipAddress,
        res.statusCode
      );
    }

    logger.info(
      `${req.method} ${req.path} - ${res.statusCode} - ${duration}ms - User: ${req.user?.userId || 'anonymous'}`
    );

    return originalJson(data);
  };

  next();
};

module.exports = {
  auditLogger
};
