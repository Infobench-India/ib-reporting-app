const express = require('express');
const router = express.Router();
const reportConfigController = require('../api/controllers/reportConfigController');

// Report Configs
router.get('/reports', reportConfigController.listReports);
router.post('/reports', reportConfigController.createReport);
router.get('/reports/:id', reportConfigController.getReportById);
router.put('/reports/:id', reportConfigController.updateReport);
router.delete('/reports/:id', reportConfigController.deleteReport);

// Report Settings (Global)
router.get('/report-settings', reportConfigController.getSettings);
router.put('/report-settings', reportConfigController.updateSettings);

// Bulk Import
router.post('/import-json', reportConfigController.importJson);

module.exports = router;
