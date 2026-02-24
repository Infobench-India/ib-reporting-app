const express = require('express');
const router = express.Router();
const schedulerController = require('../api/controllers/schedulerController');
const { authenticate, authorize } = require('../middleware/auth');

const { checkFeature } = require('../middleware/license');

// Schedule Routes - Protected with RBAC and License
router.post('/', authenticate, authorize(['create_report']), checkFeature('scheduler'), schedulerController.createSchedule);
router.get('/', authenticate, authorize(['read_report']), checkFeature('scheduler'), schedulerController.listSchedules);
router.get('/:id', authenticate, authorize(['read_report']), checkFeature('scheduler'), schedulerController.getScheduleById);
router.put('/:id', authenticate, authorize(['update_report']), checkFeature('scheduler'), schedulerController.updateSchedule);
router.delete('/:id', authenticate, authorize(['delete_report']), checkFeature('scheduler'), schedulerController.deleteSchedule);

// History Routes - Protected with RBAC
router.get('/history/list', authenticate, authorize(['read_report']), checkFeature('scheduler'), schedulerController.listHistory);
router.get('/history/:id/download', authenticate, authorize(['read_report']), checkFeature('scheduler'), schedulerController.downloadAttachment);
router.post('/history/:id/resend', authenticate, authorize(['create_report']), checkFeature('scheduler'), schedulerController.resendReport);

module.exports = router;
