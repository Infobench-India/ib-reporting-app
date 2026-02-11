const express = require('express');
const router = express.Router();
const sqlReportController = require('../api/controllers/sqlReportController');
const { authenticate, authorize } = require('../middleware/auth');

// Protected routes with RBAC
router.post('/sql-report/execute', authenticate, authorize(['read_report']), sqlReportController.executeReport);
router.get('/sql-report/configs', authenticate, authorize(['read_report']), sqlReportController.getConfigs);

module.exports = router;
