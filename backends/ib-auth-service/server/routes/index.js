const express = require('express');
const router = express.Router();
const AuthController = require('../api/controllers/AuthController');
const RoleController = require('../api/controllers/RoleController');
const PermissionController = require('../api/controllers/PermissionController');
const UserController = require('../api/controllers/UserController');
const { authenticate, authorize, authorizeRoles } = require('../middleware/auth');

// Auth routes
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/logout', authenticate, AuthController.logout);
router.post('/refresh-token', AuthController.refreshToken);
router.get('/profile', authenticate, AuthController.getProfile);

// Role routes (protected)
router.get('/roles', authenticate, RoleController.getAllRoles);
router.get('/roles/:roleId', authenticate, RoleController.getRoleById);
router.post('/roles', authenticate, authorizeRoles(['Admin']), RoleController.createRole);
router.post('/roles/assign-permission', authenticate, authorizeRoles(['Admin']), RoleController.assignPermission);
router.post('/roles/remove-permission', authenticate, authorizeRoles(['Admin']), RoleController.removePermission);

// Permission routes (protected)
router.get('/permissions', authenticate, PermissionController.getAllPermissions);
router.get('/permissions/:permissionId', authenticate, PermissionController.getPermissionById);
router.post('/permissions', authenticate, authorizeRoles(['Admin']), PermissionController.createPermission);

// User routes (admin)
router.get('/users', authenticate, authorizeRoles(['Admin']), UserController.listUsers);
router.put('/users/:id/role', authenticate, authorizeRoles(['Admin']), UserController.updateRole);
router.get('/users/:id', authenticate, authorizeRoles(['Admin']), UserController.getUser);

module.exports = router;
