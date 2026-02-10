const express = require('express');
const router = express.Router();
const sqlReportController = require('../api/controllers/sqlReportController');

router.post('/sql-report/execute', sqlReportController.executeReport);
router.get('/sql-report/configs', sqlReportController.getConfigs);

module.exports = router;
