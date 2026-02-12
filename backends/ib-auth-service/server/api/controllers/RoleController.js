const RoleService = require('../services/RoleService');
const logger = require('../../main/common/logger');

class RoleController {
  static async getAllRoles(req, res) {
    try {
      const roles = await RoleService.getAllRoles();
      res.json({ roles });
    } catch (err) {
      logger.error('Get all roles failed:', err);
      res.status(500).json({ error: 'Failed to fetch roles' });
    }
  }

  static async getRoleById(req, res) {
    try {
      const { roleId } = req.params;
      const role = await RoleService.getRoleById(roleId);

      if (!role) {
        return res.status(404).json({ error: 'Role not found' });
      }

      const permissions = await RoleService.getRolePermissions(roleId);

      res.json({ role, permissions });
    } catch (err) {
      logger.error('Get role by id failed:', err);
      res.status(500).json({ error: 'Failed to fetch role' });
    }
  }

  static async createRole(req, res) {
    try {
      const { name, description } = req.body;

      if (!name) {
        return res.status(400).json({ error: 'Role name is required' });
      }

      const role = await RoleService.createRole(name, description);
      res.status(201).json({ message: 'Role created successfully', role });
    } catch (err) {
      logger.error('Create role failed:', err);
      res.status(500).json({ error: 'Failed to create role' });
    }
  }

  static async assignPermission(req, res) {
    try {
      const { roleId, permissionId } = req.body;

      if (!roleId || !permissionId) {
        return res.status(400).json({ error: 'roleId and permissionId are required' });
      }

      await RoleService.assignPermissionToRole(roleId, permissionId);
      res.json({ message: 'Permission assigned successfully' });
    } catch (err) {
      logger.error('Assign permission failed:', err);
      res.status(500).json({ error: 'Failed to assign permission' });
    }
  }

  static async removePermission(req, res) {
    try {
      const { roleId, permissionId } = req.body;

      if (!roleId || !permissionId) {
        return res.status(400).json({ error: 'roleId and permissionId are required' });
      }

      await RoleService.removePermissionFromRole(roleId, permissionId);
      res.json({ message: 'Permission removed successfully' });
    } catch (err) {
      logger.error('Remove permission failed:', err);
      res.status(500).json({ error: 'Failed to remove permission' });
    }
  }

  static async updateRole(req, res) {
    try {
      const { roleId } = req.params;
      const updates = req.body;

      await RoleService.updateRole(roleId, updates);
      res.json({ message: 'Role updated successfully' });
    } catch (err) {
      logger.error('Update role failed:', err);
      res.status(500).json({ error: 'Failed to update role' });
    }
  }
}

module.exports = RoleController;
