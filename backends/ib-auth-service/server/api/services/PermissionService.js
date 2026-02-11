const { getPool } = require('../../utils/db');
const logger = require('../../main/common/logger');
const { v4: uuidv4 } = require('uuid');

class PermissionService {
  static async getAllPermissions() {
    const pool = await getPool();

    try {
      const query = `
        SELECT id, name, description, action, resource, isActive
        FROM Permissions
        WHERE isActive = 1
        ORDER BY resource, action;
      `;

      const result = await pool.request().query(query);
      return result.recordset || [];
    } catch (err) {
      logger.error('Get all permissions failed:', err);
      throw err;
    }
  }

  static async getPermissionById(permissionId) {
    const pool = await getPool();

    try {
      const query = `
        SELECT id, name, description, action, resource, isActive
        FROM Permissions
        WHERE id = @permissionId;
      `;

      const result = await pool.request()
        .input('permissionId', permissionId)
        .query(query);

      return result.recordset[0] || null;
    } catch (err) {
      logger.error('Get permission by id failed:', err);
      throw err;
    }
  }

  static async createPermission(name, description, action, resource) {
    const pool = await getPool();

    try {
      const permissionId = uuidv4();
      const query = `
        INSERT INTO Permissions (id, name, description, action, resource, isActive, createdAt)
        VALUES (@id, @name, @description, @action, @resource, 1, GETDATE());
      `;

      const request = pool.request();
      request.input('id', permissionId);
      request.input('name', name);
      request.input('description', description);
      request.input('action', action);
      request.input('resource', resource);

      await request.query(query);
      logger.info(`Permission created: ${name}`);

      return { id: permissionId, name, description, action, resource, isActive: true };
    } catch (err) {
      logger.error('Create permission failed:', err);
      throw err;
    }
  }
}

module.exports = PermissionService;
