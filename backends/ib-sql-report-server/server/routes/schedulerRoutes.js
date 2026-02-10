const express = require('express');
const router = express.Router();
const schedulerController = require('../api/controllers/schedulerController');

// Schedule Routes
router.post('/', schedulerController.createSchedule);
router.get('/', schedulerController.listSchedules);
router.get('/:id', schedulerController.getScheduleById);
router.put('/:id', schedulerController.updateSchedule);
router.delete('/:id', schedulerController.deleteSchedule);

// History Routes
router.get('/history/list', schedulerController.listHistory);
router.get('/history/:id/download', schedulerController.downloadAttachment);
router.post('/history/:id/resend', schedulerController.resendReport);

module.exports = router;
