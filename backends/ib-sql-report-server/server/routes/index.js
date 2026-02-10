const express = require('express');
const router = express.Router();
const sqlReportRoutes = require('./sqlReportRoutes');
const reportConfigRoutes = require('./reportConfigRoutes');
const schedulerRoutes = require('./schedulerRoutes');

router.use(sqlReportRoutes);
router.use(reportConfigRoutes);
router.use('/sql-report-scheduler', schedulerRoutes);

module.exports = router;
