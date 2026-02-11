const PermissionService = require('../services/PermissionService');
const logger = require('../../main/common/logger');

class PermissionController {
  static async getAllPermissions(req, res) {
    try {
      const permissions = await PermissionService.getAllPermissions();
      res.json({ permissions });
    } catch (err) {
      logger.error('Get all permissions failed:', err);
      res.status(500).json({ error: 'Failed to fetch permissions' });
    }
  }

  static async getPermissionById(req, res) {
    try {
      const { permissionId } = req.params;
      const permission = await PermissionService.getPermissionById(permissionId);

      if (!permission) {
        return res.status(404).json({ error: 'Permission not found' });
      }

      res.json({ permission });
    } catch (err) {
      logger.error('Get permission by id failed:', err);
      res.status(500).json({ error: 'Failed to fetch permission' });
    }
  }

  static async createPermission(req, res) {
    try {
      const { name, description, action, resource } = req.body;

      if (!name || !action || !resource) {
        return res.status(400).json({ error: 'name, action, and resource are required' });
      }

      const permission = await PermissionService.createPermission(name, description, action, resource);
      res.status(201).json({ message: 'Permission created successfully', permission });
    } catch (err) {
      logger.error('Create permission failed:', err);
      res.status(500).json({ error: 'Failed to create permission' });
    }
  }
}

module.exports = PermissionController;
