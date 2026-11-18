const express = require('express');
const router = express.Router();
const StaffController = require('../controllers/staff.controller');
const { requireAuth, requireRole } = require('../middleware/auth.middleware');
const validateRequest = require('../middleware/validate.middleware');
const {
  createStaffSchema,
  updateStaffSchema,
  resetStaffPasswordSchema
} = require('../validators/staff.validator');

// All staff management routes require Admin authorization
router.use(requireAuth, requireRole('admin'));

router.get('/', StaffController.list);
router.post('/', validateRequest(createStaffSchema), StaffController.create);
router.get('/:id', StaffController.getById);
router.patch('/:id', validateRequest(updateStaffSchema), StaffController.update);
router.post('/:id/deactivate', StaffController.deactivate);
router.post('/:id/reset-password', validateRequest(resetStaffPasswordSchema), StaffController.resetPassword);

module.exports = router;
