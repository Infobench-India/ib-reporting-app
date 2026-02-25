const { getPool } = require('../../utils/db');
const logger = require('../../main/common/logger');
const { v4: uuidv4 } = require('uuid');

class RoleService {
  static async getAllRoles() {
    const p = await getPool();

    try {
      const query = `
        SELECT r.id, r.name, r.description, COUNT(p.id) as permissionCount
        FROM Roles r
        LEFT JOIN RolePermissions rp ON r.id = rp."roleId"
        LEFT JOIN Permissions p ON rp."permissionId" = p.id
        WHERE r."isActive" = 1
        GROUP BY r.id, r.name, r.description
        ORDER BY r.name;
      `;

      const result = await p.query(query);
      return result.rows || [];
    } catch (err) {
      logger.error('Get all roles failed:', err);
      throw err;
    }
  }

  static async getRoleById(roleId) {
    const p = await getPool();

    try {
      const query = `
        SELECT id, name, description, isActive
        FROM Roles
        WHERE id = @roleId;
      `;

      const result = await p.query(query, { roleId });

      return result.rows[0] || null;
    } catch (err) {
      logger.error('Get role by id failed:', err);
      throw err;
    }
  }

  static async getRolePermissions(roleId) {
    const p = await getPool();

    try {
      const query = `
        SELECT p.id, p.name, p.description, p.action
        FROM Roles r
        JOIN RolePermissions rp ON r.id = rp."roleId"
        JOIN Permissions p ON rp."permissionId" = p.id
        WHERE r.id = @roleId AND r."isActive" = 1;
      `;

      const result = await p.query(query, { roleId });

      return result.rows || [];
    } catch (err) {
      logger.error('Get role permissions failed:', err);
      throw err;
    }
  }

  static async createRole(name, description) {
    const p = await getPool();

    try {
      const roleId = uuidv4();
      const query = `
        INSERT INTO Roles (id, name, description, "isActive", "createdAt")
        VALUES (@id, @name, @description, 1, ${p.type === 'mssql' ? 'GETDATE()' : 'CURRENT_TIMESTAMP'});
      `;

      await p.query(query, {
        id: roleId,
        name,
        description
      });
      logger.info(`Role created: ${name}`);

      return { id: roleId, name, description, isActive: 1 };
    } catch (err) {
      logger.error('Create role failed:', err);
      throw err;
    }
  }

  static async assignPermissionToRole(roleId, permissionId) {
    const p = await getPool();

    try {
      // Check then insert for portability
      const checkQuery = `SELECT 1 FROM RolePermissions WHERE roleId = @roleId AND permissionId = @permissionId`;
      const checkRes = await p.query(checkQuery, { roleId, permissionId });

      if (checkRes.rows.length === 0) {
        const query = `
          INSERT INTO RolePermissions ("roleId", "permissionId", "createdAt")
          VALUES (@roleId, @permissionId, ${p.type === 'mssql' ? 'GETDATE()' : 'CURRENT_TIMESTAMP'});
        `;
        await p.query(query, { roleId, permissionId });
        logger.info(`Permission assigned to role: ${roleId}`);
      }
    } catch (err) {
      logger.error('Assign permission to role failed:', err);
      throw err;
    }
  }

  static async removePermissionFromRole(roleId, permissionId) {
    const p = await getPool();

    try {
      const query = `
        DELETE FROM RolePermissions
        WHERE roleId = @roleId AND permissionId = @permissionId;
      `;

      await p.query(query, { roleId, permissionId });
      logger.info(`Permission removed from role: ${roleId}`);
    } catch (err) {
      logger.error('Remove permission from role failed:', err);
      throw err;
    }
  }

  static async updateRole(roleId, updates) {
    const p = await getPool();
    try {
      const allowedFields = ['name', 'description', 'isActive'];
      const setClauses = [];
      const params = { roleId };

      for (const [key, value] of Object.entries(updates)) {
        if (allowedFields.includes(key)) {
          setClauses.push(`${key} = @${key}`);
          params[key] = value;
        }
      }

      if (setClauses.length === 0) return;

      const query = `UPDATE Roles SET ${setClauses.join(', ')}, updatedAt = ${p.type === 'mssql' ? 'GETDATE()' : 'CURRENT_TIMESTAMP'} WHERE id = @roleId;`;
      await p.query(query, params);
      logger.info(`Role updated: ${roleId}`);
    } catch (err) {
      logger.error('Update role failed:', err);
      throw err;
    }
  }
}

module.exports = RoleService;
