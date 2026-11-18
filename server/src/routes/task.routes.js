const express = require('express');
const router = express.Router();
const TaskController = require('../controllers/task.controller');
const { requireAuth, requireRole } = require('../middleware/auth.middleware');
const validateRequest = require('../middleware/validate.middleware');
const {
  createTaskSchema,
  updateChecklistProgressSchema,
  submitTaskAssignmentSchema,
  reviewTaskAssignmentSchema
} = require('../validators/task.validator');

router.use(requireAuth);

// Admin task endpoints
router.post('/', requireRole('admin'), validateRequest(createTaskSchema), TaskController.create);
router.get('/admin', requireRole('admin'), TaskController.listAdminTasks);
router.post('/assignments/:assignmentId/review', requireRole('admin'), validateRequest(reviewTaskAssignmentSchema), TaskController.reviewAssignment);

// Staff endpoints
router.get('/my-tasks', requireRole('staff'), TaskController.listStaffTasks);
router.patch('/assignments/:assignmentId/checklist/:itemId', requireRole('staff'), validateRequest(updateChecklistProgressSchema), TaskController.updateChecklistProgress);
router.post('/assignments/:assignmentId/submit', requireRole('staff'), validateRequest(submitTaskAssignmentSchema), TaskController.submitAssignment);

// Shared / Assignment details endpoint (Role verified inside service)
router.get('/assignments/:assignmentId', TaskController.getAssignmentDetails);

module.exports = router;
