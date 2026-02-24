const express = require('express');
const router = express.Router();
const reportConfigController = require('../api/controllers/reportConfigController');
const { authenticate, authorize, authorizeRoles } = require('../middleware/auth');

const { checkFeature } = require('../middleware/license');

// Report Configs - Protected with RBAC and License
router.get('/reports', authenticate, authorize(['read_report']), checkFeature('sql_analytics'), reportConfigController.listReports);
router.post('/reports', authenticate, authorize(['create_report']), checkFeature('sql_analytics'), reportConfigController.createReport);
router.get('/reports/:id', authenticate, authorize(['read_report']), checkFeature('sql_analytics'), reportConfigController.getReportById);
router.put('/reports/:id', authenticate, authorize(['update_report']), checkFeature('sql_analytics'), reportConfigController.updateReport);
router.delete('/reports/:id', authenticate, authorize(['delete_report']), checkFeature('sql_analytics'), reportConfigController.deleteReport);

// Report Settings (Global) - Admin only
router.get('/report-settings', authenticate, authorizeRoles(['Admin']), checkFeature('sql_analytics'), reportConfigController.getSettings);
router.put('/report-settings', authenticate, authorizeRoles(['Admin']), checkFeature('sql_analytics'), reportConfigController.updateSettings);

// Bulk Import - Admin only
router.post('/import-json', authenticate, authorizeRoles(['Admin']), checkFeature('sql_analytics'), reportConfigController.importJson);

// Testing Routes
router.post('/test-connection', authenticate, authorize(['create_report', 'update_report']), reportConfigController.testConnection);
router.post('/test-query', authenticate, authorize(['create_report', 'update_report']), reportConfigController.testQuery);

module.exports = router;
