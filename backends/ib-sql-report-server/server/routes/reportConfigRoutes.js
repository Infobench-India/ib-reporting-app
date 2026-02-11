const express = require('express');
const router = express.Router();
const reportConfigController = require('../api/controllers/reportConfigController');
const { authenticate, authorize, authorizeRoles } = require('../middleware/auth');

// Report Configs - Protected with RBAC
router.get('/reports', authenticate, authorize(['read_report']), reportConfigController.listReports);
router.post('/reports', authenticate, authorize(['create_report']), reportConfigController.createReport);
router.get('/reports/:id', authenticate, authorize(['read_report']), reportConfigController.getReportById);
router.put('/reports/:id', authenticate, authorize(['update_report']), reportConfigController.updateReport);
router.delete('/reports/:id', authenticate, authorize(['delete_report']), reportConfigController.deleteReport);

// Report Settings (Global) - Admin only
router.get('/report-settings', authenticate, authorizeRoles(['Admin']), reportConfigController.getSettings);
router.put('/report-settings', authenticate, authorizeRoles(['Admin']), reportConfigController.updateSettings);

// Bulk Import - Admin only
router.post('/import-json', authenticate, authorizeRoles(['Admin']), reportConfigController.importJson);

module.exports = router;
