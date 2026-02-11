const { v4: uuidv4 } = require('uuid');
const { getPool } = require('../../utils/db');
const logger = require('../../main/common/logger');

class UserService {
  static async createUser(email, password, firstName, lastName, roleId) {
    const pool = await getPool();
    const { hashPassword } = require('../../utils/password');

    try {
      const hashedPassword = await hashPassword(password);
      const userId = uuidv4();

      const query = `
        INSERT INTO Users (id, email, firstName, lastName, passwordHash, roleId, isActive, createdAt)
        VALUES (@id, @email, @firstName, @lastName, @passwordHash, @roleId, 1, GETDATE());
      `;

      const request = pool.request();
      request.input('id', userId);
      request.input('email', email);
      request.input('firstName', firstName);
      request.input('lastName', lastName);
      request.input('passwordHash', hashedPassword);
      request.input('roleId', roleId);

      await request.query(query);
      logger.info(`User created: ${email}`);

      return { id: userId, email, firstName, lastName, roleId };
    } catch (err) {
      logger.error('Create user failed:', err);
      throw err;
    }
  }

  static async getUserByEmail(email) {
    const pool = await getPool();

    try {
      const query = `
        SELECT u.id, u.email, u.firstName, u.lastName, u.passwordHash, u.roleId, u.isActive, 
               r.name as role
        FROM Users u
        LEFT JOIN Roles r ON u.roleId = r.id
        WHERE u.email = @email;
      `;

      const result = await pool.request()
        .input('email', email)
        .query(query);

      return result.recordset[0] || null;
    } catch (err) {
      logger.error('Get user by email failed:', err);
      throw err;
    }
  }

  static async getUserById(userId) {
    const pool = await getPool();

    try {
      const query = `
        SELECT u.id, u.email, u.firstName, u.lastName, u.roleId, u.isActive, 
               r.id as roleId, r.name as role
        FROM Users u
        LEFT JOIN Roles r ON u.roleId = r.id
        WHERE u.id = @userId;
      `;

      const result = await pool.request()
        .input('userId', userId)
        .query(query);

      return result.recordset[0] || null;
    } catch (err) {
      logger.error('Get user by id failed:', err);
      throw err;
    }
  }

  static async getUserPermissions(userId) {
    const pool = await getPool();

    try {
      const query = `
        SELECT DISTINCT p.id, p.name, p.description, p.action
        FROM Users u
        JOIN Roles r ON u.roleId = r.id
        JOIN RolePermissions rp ON r.id = rp.roleId
        JOIN Permissions p ON rp.permissionId = p.id
        WHERE u.id = @userId AND u.isActive = 1;
      `;

      const result = await pool.request()
        .input('userId', userId)
        .query(query);

      return result.recordset || [];
    } catch (err) {
      logger.error('Get user permissions failed:', err);
      throw err;
    }
  }

  static async updateLastLogin(userId) {
    const pool = await getPool();

    try {
      const query = `
        UPDATE Users SET lastLogin = GETDATE() WHERE id = @userId;
      `;

      await pool.request()
        .input('userId', userId)
        .query(query);

      logger.info(`Last login updated for user: ${userId}`);
    } catch (err) {
      logger.error('Update last login failed:', err);
      // Don't throw - this is non-critical
    }
  }

  static async updateUser(userId, updates) {
    const pool = await getPool();

    try {
      const allowedFields = ['firstName', 'lastName', 'email'];
      const setClauses = [];
      const request = pool.request();
      request.input('userId', userId);

      for (const [key, value] of Object.entries(updates)) {
        if (allowedFields.includes(key)) {
          setClauses.push(`${key} = @${key}`);
          request.input(key, value);
        }
      }

      if (setClauses.length === 0) return;

      const query = `UPDATE Users SET ${setClauses.join(', ')} WHERE id = @userId;`;
      await request.query(query);

      logger.info(`User updated: ${userId}`);
    } catch (err) {
      logger.error('Update user failed:', err);
      throw err;
    }
  }

  static async getAllUsers() {
    const pool = await getPool();

    try {
      const query = `
        SELECT u.id, u.email, u.firstName, u.lastName, u.roleId, r.name as role, u.isActive, u.createdAt
        FROM Users u
        LEFT JOIN Roles r ON u.roleId = r.id
        ORDER BY u.email;
      `;

      const result = await pool.request().query(query);
      return result.recordset || [];
    } catch (err) {
      logger.error('Get all users failed:', err);
      throw err;
    }
  }

  static async updateUserRole(userId, roleId) {
    const pool = await getPool();

    try {
      const query = `UPDATE Users SET roleId = @roleId, updatedAt = GETDATE() WHERE id = @userId;`;
      await pool.request().input('roleId', roleId).input('userId', userId).query(query);
      logger.info(`Updated role for user ${userId} -> ${roleId}`);
    } catch (err) {
      logger.error('Update user role failed:', err);
      throw err;
    }
  }
}

module.exports = UserService;
