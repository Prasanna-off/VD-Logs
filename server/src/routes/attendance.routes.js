const express = require('express');
const router = express.Router();
const AttendanceController = require('../controllers/attendance.controller');
const { requireAuth, requireRole } = require('../middleware/auth.middleware');
const validateRequest = require('../middleware/validate.middleware');
const {
  correctionRequestSchema,
  correctionDecisionSchema
} = require('../validators/attendance.validator');

router.use(requireAuth);

// Staff Attendance Routes
router.post('/check-in', AttendanceController.checkIn);
router.post('/check-out', AttendanceController.checkOut);
router.get('/today', AttendanceController.getTodayStatus);
router.get('/me', AttendanceController.getMyHistory);
router.post('/correction-requests', validateRequest(correctionRequestSchema), AttendanceController.submitCorrection);
router.get('/correction-requests/me', AttendanceController.getMyCorrections);

// Admin Attendance Routes
router.get('/admin', requireRole('admin'), AttendanceController.listAdminAttendance);
router.get('/admin/corrections', requireRole('admin'), AttendanceController.listAdminCorrections);
router.post('/admin/corrections/:id/decision', requireRole('admin'), validateRequest(correctionDecisionSchema), AttendanceController.adjudicateCorrection);

module.exports = router;
