const express = require('express');
const router = express.Router();
const schedulerController = require('../api/controllers/schedulerController');
const { authenticate, authorize } = require('../middleware/auth');

// Schedule Routes - Protected with RBAC
router.post('/', authenticate, authorize(['create_report']), schedulerController.createSchedule);
router.get('/', authenticate, authorize(['read_report']), schedulerController.listSchedules);
router.get('/:id', authenticate, authorize(['read_report']), schedulerController.getScheduleById);
router.put('/:id', authenticate, authorize(['update_report']), schedulerController.updateSchedule);
router.delete('/:id', authenticate, authorize(['delete_report']), schedulerController.deleteSchedule);

// History Routes - Protected with RBAC
router.get('/history/list', authenticate, authorize(['read_report']), schedulerController.listHistory);
router.get('/history/:id/download', authenticate, authorize(['read_report']), schedulerController.downloadAttachment);
router.post('/history/:id/resend', authenticate, authorize(['create_report']), schedulerController.resendReport);

module.exports = router;
