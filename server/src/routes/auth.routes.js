const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');
const { requireAuth } = require('../middleware/auth.middleware');
const validateRequest = require('../middleware/validate.middleware');
const { authLimiter } = require('../middleware/rateLimit.middleware');
const {
  staffLoginSchema,
  adminLoginSchema,
  changePasswordSchema,
  updateProfileSchema
} = require('../validators/auth.validator');

// Public authentication routes with rate limiting
router.post('/staff/login', authLimiter, validateRequest(staffLoginSchema), AuthController.staffLogin);
router.post('/admin/login', authLimiter, validateRequest(adminLoginSchema), AuthController.adminLogin);

// Protected routes
router.get('/me', requireAuth, AuthController.getMe);
router.post('/change-password', requireAuth, validateRequest(changePasswordSchema), AuthController.changePassword);
router.patch('/profile', requireAuth, validateRequest(updateProfileSchema), AuthController.updateProfile);
router.post('/logout', requireAuth, AuthController.logout);

module.exports = router;
