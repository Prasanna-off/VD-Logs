const express = require('express');
const router = express.Router();
const DepartmentController = require('../controllers/department.controller');
const { requireAuth, requireRole } = require('../middleware/auth.middleware');
const validateRequest = require('../middleware/validate.middleware');
const {
  createDepartmentSchema,
  updateDepartmentSchema
} = require('../validators/department.validator');

// All department operations require authentication
router.use(requireAuth);

// GET is accessible to authenticated users (so staff dropdowns work)
router.get('/', DepartmentController.list);

// Write operations restricted to Admin only
router.post('/', requireRole('admin'), validateRequest(createDepartmentSchema), DepartmentController.create);
router.patch('/:id', requireRole('admin'), validateRequest(updateDepartmentSchema), DepartmentController.update);
router.post('/:id/deactivate', requireRole('admin'), DepartmentController.deactivate);

module.exports = router;
