const { v4: uuidv4 } = require('uuid');
const { getPool } = require('../../utils/db');
const logger = require('../../main/common/logger');

class UserService {
  static async createUser(email, password, firstName, lastName, roleId) {
    const p = await getPool();
    const { hashPassword } = require('../../utils/password');

    try {
      const hashedPassword = await hashPassword(password);
      const userId = uuidv4();

      const query = `
  INSERT INTO Users (id, email, "firstName", "lastName", "passwordHash", "roleId", "isActive", "createdAt")
  VALUES (@id, @email, @firstName, @lastName, @passwordHash, @roleId, 1, ${p.type === 'mssql' ? 'GETDATE()' : 'CURRENT_TIMESTAMP'});
`;

      await p.query(query, {
        id: userId,
        email,
        firstName,
        lastName,
        passwordHash: hashedPassword,
        roleId
      });
      logger.info(`User created: ${email}`);

      return { id: userId, email, firstName, lastName, roleId };
    } catch (err) {
      logger.error('Create user failed:', err);
      throw err;
    }
  }

  static async getUserByEmail(email) {
    const p = await getPool();

    try {
      const query = `
        SELECT u.id, u.email, u."firstName", u."lastName", u."passwordHash", u."roleId", u."isActive", 
               r.name as role
        FROM Users u
        LEFT JOIN Roles r ON u."roleId" = r.id
        WHERE u.email = @email;
      `;

      const result = await p.query(query, { email });

      return result.rows[0] || null;
    } catch (err) {
      logger.error('Get user by email failed:', err);
      throw err;
    }
  }

  static async getUserById(userId) {
    const p = await getPool();

    try {
      const query = `
        SELECT u.id, u.email, u."firstName", u."lastName", u."roleId", u."isActive", 
               r.id as roleId, r.name as role
        FROM Users u
        LEFT JOIN Roles r ON u."roleId" = r.id
        WHERE u.id = @userId;
      `;

      const result = await p.query(query, { userId });

      return result.rows[0] || null;
    } catch (err) {
      logger.error('Get user by id failed:', err);
      throw err;
    }
  }

  static async getUserPermissions(userId) {
    const p = await getPool();

    try {
      const query = `
        SELECT DISTINCT p.id, p.name, p.description, p.action
        FROM Users u
        JOIN Roles r ON u."roleId" = r.id
        JOIN RolePermissions rp ON r.id = rp."roleId"
        JOIN Permissions p ON rp."permissionId" = p.id
        WHERE u.id = @userId AND u."isActive" = 1;
      `;

      const result = await p.query(query, { userId });

      return result.rows || [];
    } catch (err) {
      logger.error('Get user permissions failed:', err);
      throw err;
    }
  }

  static async updateLastLogin(userId) {
    const p = await getPool();

    try {
      const query = `
        UPDATE Users SET lastLogin = ${p.type === 'mssql' ? 'GETDATE()' : 'CURRENT_TIMESTAMP'} WHERE id = @userId;
      `;

      await p.query(query, { userId });

      logger.info(`Last login updated for user: ${userId}`);
    } catch (err) {
      logger.error('Update last login failed:', err);
      // Don't throw - this is non-critical
    }
  }

  static async updateUser(userId, updates) {
    const p = await getPool();

    try {
      const allowedFields = ['firstName', 'lastName', 'email', 'isActive', 'roleId'];
      const setClauses = [];
      const params = { userId };

      for (const [key, value] of Object.entries(updates)) {
        if (allowedFields.includes(key)) {
          setClauses.push(`${key} = @${key}`);
          params[key] = value;
        }
      }

      if (setClauses.length === 0) return;

      const query = `UPDATE Users SET ${setClauses.join(', ')}, updatedAt = ${p.type === 'mssql' ? 'GETDATE()' : 'CURRENT_TIMESTAMP'} WHERE id = @userId;`;
      await p.query(query, params);

      logger.info(`User updated: ${userId}`);
    } catch (err) {
      logger.error('Update user failed:', err);
      throw err;
    }
  }

  static async getAllUsers() {
    const p = await getPool();

    try {
      const query = `
        SELECT u.id, u.email, u."firstName", u."lastName", u."roleId", r.name as role, u."isActive", u."createdAt"
        FROM Users u
        LEFT JOIN Roles r ON u."roleId" = r.id
        ORDER BY u.email;
`;

      const result = await p.query(query);
      return result.rows || [];
    } catch (err) {
      logger.error('Get all users failed:', err);
      throw err;
    }
  }

  static async updateUserRole(userId, roleId) {
    const p = await getPool();

    try {
      const query = `UPDATE Users SET roleId = @roleId, updatedAt = ${p.type === 'mssql' ? 'GETDATE()' : 'CURRENT_TIMESTAMP'} WHERE id = @userId; `;
      await p.query(query, { roleId, userId });
      logger.info(`Updated role for user ${userId} -> ${roleId} `);
    } catch (err) {
      logger.error('Update user role failed:', err);
      throw err;
    }
  }

  static async savePasswordResetToken(userId, token, expiresAt) {
    const p = await getPool();
    try {
      const type_timestamp = p.type === 'mssql' ? 'GETDATE()' : 'CURRENT_TIMESTAMP';
      const type_interval = p.type === 'mssql' ? 'DATEADD(hour, 1, GETDATE())' : "CURRENT_TIMESTAMP + interval '1 hour'";
      const query = `
        INSERT INTO PasswordResets(id, "userId", token, "expiresAt", "createdAt")
        VALUES(@id, @userId, @token, ${type_interval}, ${type_timestamp});
      `;
      await p.query(query, {
        id: uuidv4(),
        userId,
        token
      });
    } catch (err) {
      logger.error('Save reset token failed:', err);
      throw err;
    }
  }

  static async verifyResetToken(token) {
    const p = await getPool();
    try {
      const query = `
        SELECT userId FROM PasswordResets 
        WHERE token = @token AND expiresAt > ${p.type === 'mssql' ? 'GETDATE()' : 'CURRENT_TIMESTAMP'} AND usedAt IS NULL;
      `;
      const result = await p.query(query, { token });
      return result.rows[0]?.userId || null;
    } catch (err) {
      logger.error('Verify reset token failed:', err);
      throw err;
    }
  }

  static async updatePassword(userId, passwordHash) {
    const p = await getPool();
    try {
      const query = `UPDATE Users SET passwordHash = @passwordHash, updatedAt = ${p.type === 'mssql' ? 'GETDATE()' : 'CURRENT_TIMESTAMP'} WHERE id = @userId; `;
      await p.query(query, { passwordHash, userId });
    } catch (err) {
      logger.error('Update password failed:', err);
      throw err;
    }
  }

  static async invalidateResetToken(token) {
    const p = await getPool();
    try {
      const query = `UPDATE PasswordResets SET usedAt = ${p.type === 'mssql' ? 'GETDATE()' : 'CURRENT_TIMESTAMP'} WHERE token = @token; `;
      await p.query(query, { token });
    } catch (err) {
      logger.error('Invalidate reset token failed:', err);
      throw err;
    }
  }
}

module.exports = UserService;
