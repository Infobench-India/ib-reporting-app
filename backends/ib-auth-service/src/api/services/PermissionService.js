const { getPool } = require('../../utils/db');
const logger = require('../../main/common/logger');
const { v4: uuidv4 } = require('uuid');

class PermissionService {
  static async getAllPermissions() {
    const p = await getPool();

    try {
      const query = `
        SELECT id, name, description, action, resource, "isActive"
        FROM Permissions
        WHERE "isActive" = ${p.type === 'mssql' ? 1 : 1}
        ORDER BY resource, action;
      `;

      const result = await p.query(query);
      return result.rows || [];
    } catch (err) {
      logger.error('Get all permissions failed:', err);
      throw err;
    }
  }

  static async getPermissionById(permissionId) {
    const p = await getPool();

    try {
      const query = `
        SELECT id, name, description, action, resource, "isActive"
        FROM Permissions
        WHERE id = @permissionId;
      `;

      const result = await p.query(query, { permissionId });

      return result.rows[0] || null;
    } catch (err) {
      logger.error('Get permission by id failed:', err);
      throw err;
    }
  }

  static async createPermission(name, description, action, resource) {
    const p = await getPool();

    try {
      const permissionId = uuidv4();
      const query = `
        INSERT INTO Permissions (id, name, description, action, resource, "isActive", "createdAt")
        VALUES (@id, @name, @description, @action, @resource, 1, ${p.type === 'mssql' ? 'GETDATE()' : 'CURRENT_TIMESTAMP'});
      `;

      await p.query(query, {
        id: permissionId,
        name,
        description,
        action,
        resource
      });
      logger.info(`Permission created: ${name}`);

      return { id: permissionId, name, description, action, resource, isActive: 1 };
    } catch (err) {
      logger.error('Create permission failed:', err);
      throw err;
    }
  }

  static async updatePermission(permissionId, updates) {
    const p = await getPool();
    try {
      const allowedFields = ['name', 'description', 'action', 'resource', 'isActive'];
      const setClauses = [];
      const params = { permissionId };

      for (const [key, value] of Object.entries(updates)) {
        if (allowedFields.includes(key)) {
          setClauses.push(`${key} = @${key}`);
          params[key] = value;
        }
      }

      if (setClauses.length === 0) return;

      const query = `UPDATE Permissions SET ${setClauses.join(', ')}, updatedAt = ${p.type === 'mssql' ? 'GETDATE()' : 'CURRENT_TIMESTAMP'} WHERE id = @permissionId;`;
      await p.query(query, params);
      logger.info(`Permission updated: ${permissionId}`);
    } catch (err) {
      logger.error('Update permission failed:', err);
      throw err;
    }
  }
}

module.exports = PermissionService;
