const express = require('express');
const router = express.Router();
const WorkLogController = require('../controllers/worklog.controller');
const { requireAuth, requireRole } = require('../middleware/auth.middleware');
const validateRequest = require('../middleware/validate.middleware');
const {
  createWorkLogSchema,
  updateWorkLogSchema,
  reviewWorkLogSchema
} = require('../validators/worklog.validator');

router.use(requireAuth);

// Staff Work Log routes
router.post('/', requireRole('staff'), validateRequest(createWorkLogSchema), WorkLogController.create);
router.patch('/:id', requireRole('staff'), validateRequest(updateWorkLogSchema), WorkLogController.update);
router.get('/my', requireRole('staff'), WorkLogController.listMy);

// Admin Work Log routes
router.get('/admin', requireRole('admin'), WorkLogController.listAdmin);
router.post('/:id/review', requireRole('admin'), validateRequest(reviewWorkLogSchema), WorkLogController.review);

module.exports = router;
