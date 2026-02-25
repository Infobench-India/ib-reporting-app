const { getPool } = require('../../utils/db');
const logger = require('../../main/common/logger');
const { v4: uuidv4 } = require('uuid');

class AuditService {
  static async logAction(userId, action, resource, details = {}, ipAddress = null, statusCode = 200) {
    const p = await getPool();

    try {
      const auditId = uuidv4();
      const query = `
        INSERT INTO AuditLog (id, "userId", action, resource, details, "ipAddress", "statusCode", "createdAt")
        VALUES (@id, @userId, @action, @resource, @details, @ipAddress, @statusCode, ${p.type === 'mssql' ? 'GETDATE()' : 'CURRENT_TIMESTAMP'});
      `;

      await p.query(query, {
        id: auditId,
        userId: userId || null,
        action,
        resource,
        details: JSON.stringify(details),
        ipAddress,
        statusCode
      });
      logger.info(`Action logged: ${action} on ${resource}`);
    } catch (err) {
      logger.error('Audit log failed:', err);
      // Don't throw - audit logging is non-critical
    }
  }

  static async getAuditLog(filters = {}, limit = 100, offset = 0) {
    const p = await getPool();

    try {
      let query = 'SELECT * FROM AuditLog WHERE 1=1';
      const params = {};

      if (filters.userId) {
        query += ' AND userId = @userId';
        params.userId = filters.userId;
      }

      if (filters.action) {
        query += ' AND action LIKE @action';
        params.action = `%${filters.action}%`;
      }

      if (filters.resource) {
        query += ' AND resource = @resource';
        params.resource = filters.resource;
      }

      if (filters.startDate) {
        query += ' AND "createdAt" >= @startDate';
        params.startDate = filters.startDate;
      }

      if (filters.endDate) {
        query += ' AND "createdAt" <= @endDate';
        params.endDate = filters.endDate;
      }

      query += ` ORDER BY "createdAt" DESC ${p.getPaginationSnippet(limit, offset)}`;

      const result = await p.query(query, params);
      return result.rows || [];
    } catch (err) {
      logger.error('Get audit log failed:', err);
      throw err;
    }
  }
}

module.exports = AuditService;
