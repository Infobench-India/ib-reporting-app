const express = require('express');
const router = express.Router();
const sqlReportRoutes = require('./sqlReportRoutes');
const reportConfigRoutes = require('./reportConfigRoutes');
const schedulerRoutes = require('./schedulerRoutes');
const { requireActivation } = require('../middleware/activation');

// Enforce activation for API endpoints
router.use(requireActivation);
router.use(sqlReportRoutes);
router.use(reportConfigRoutes);
router.use('/sql-report-scheduler', schedulerRoutes);

module.exports = router;
