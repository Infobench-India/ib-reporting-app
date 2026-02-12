const UserService = require('../services/UserService');
const logger = require('../../main/common/logger');

class UserController {
  static async listUsers(req, res) {
    try {
      const users = await UserService.getAllUsers();
      res.json({ users });
    } catch (err) {
      logger.error('List users failed:', err);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  }

  static async updateRole(req, res) {
    try {
      const userId = req.params.id;
      const { roleId } = req.body;

      if (!roleId) return res.status(400).json({ error: 'roleId is required' });

      await UserService.updateUserRole(userId, roleId);
      res.json({ message: 'User role updated' });
    } catch (err) {
      logger.error('Update user role failed:', err);
      res.status(500).json({ error: 'Failed to update user role' });
    }
  }

  static async getUser(req, res) {
    try {
      const userId = req.params.id;
      const user = await require('../services/UserService').getUserById(userId);
      if (!user) return res.status(404).json({ error: 'User not found' });
      const permissions = await require('../services/UserService').getUserPermissions(userId);
      res.json({ user: { ...user, permissions: permissions.map(p => p.name) } });
    } catch (err) {
      logger.error('Get user failed:', err);
      res.status(500).json({ error: 'Failed to fetch user' });
    }
  }
  static async updateUser(req, res) {
    try {
      const userId = req.params.id;
      const updates = req.body;

      await UserService.updateUser(userId, updates);
      res.json({ message: 'User updated successfully' });
    } catch (err) {
      logger.error('Update user failed:', err);
      res.status(500).json({ error: 'Failed to update user' });
    }
  }
}

module.exports = UserController;
