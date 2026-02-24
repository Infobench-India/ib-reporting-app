const express = require('express');
const router = express.Router();
const sqlReportRoutes = require('./sqlReportRoutes');
const reportConfigRoutes = require('./reportConfigRoutes');
const schedulerRoutes = require('./schedulerRoutes');
const { requireActivation } = require('../middleware/activation');
const { checkFeature } = require('../middleware/license'); // Import checkFeature

// Enforce activation for API endpoints
router.use(requireActivation);

// Apply checkFeature middleware to SQL Report routes
router.use(checkFeature('sql_analytics'), sqlReportRoutes);

// Apply Scheduler routes
router.use('/sql-report-scheduler', schedulerRoutes);

// Other routes (reportConfigRoutes)
router.use(reportConfigRoutes);


module.exports = router;
