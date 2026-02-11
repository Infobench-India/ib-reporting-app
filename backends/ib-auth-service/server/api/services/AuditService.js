const { getPool } = require('../../utils/db');
const logger = require('../../main/common/logger');
const { v4: uuidv4 } = require('uuid');

class AuditService {
  static async logAction(userId, action, resource, details = {}, ipAddress = null, statusCode = 200) {
    const pool = await getPool();

    try {
      const auditId = uuidv4();
      const query = `
        INSERT INTO AuditLog (id, userId, action, resource, details, ipAddress, statusCode, createdAt)
        VALUES (@id, @userId, @action, @resource, @details, @ipAddress, @statusCode, GETDATE());
      `;

      const request = pool.request();
      request.input('id', auditId);
      request.input('userId', userId || null);
      request.input('action', action);
      request.input('resource', resource);
      request.input('details', JSON.stringify(details));
      request.input('ipAddress', ipAddress);
      request.input('statusCode', statusCode);

      await request.query(query);
      logger.info(`Action logged: ${action} on ${resource}`);
    } catch (err) {
      logger.error('Audit log failed:', err);
      // Don't throw - audit logging is non-critical
    }
  }

  static async getAuditLog(filters = {}, limit = 100, offset = 0) {
    const pool = await getPool();

    try {
      let query = 'SELECT * FROM AuditLog WHERE 1=1';
      const request = pool.request();

      if (filters.userId) {
        query += ' AND userId = @userId';
        request.input('userId', filters.userId);
      }

      if (filters.action) {
        query += ' AND action LIKE @action';
        request.input('action', `%${filters.action}%`);
      }

      if (filters.resource) {
        query += ' AND resource = @resource';
        request.input('resource', filters.resource);
      }

      if (filters.startDate) {
        query += ' AND createdAt >= @startDate';
        request.input('startDate', filters.startDate);
      }

      if (filters.endDate) {
        query += ' AND createdAt <= @endDate';
        request.input('endDate', filters.endDate);
      }

      query += ` ORDER BY createdAt DESC OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY;`;

      const result = await request.query(query);
      return result.recordset || [];
    } catch (err) {
      logger.error('Get audit log failed:', err);
      throw err;
    }
  }
}

module.exports = AuditService;
