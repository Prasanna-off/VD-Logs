const express = require('express');
const router = express.Router();
const AnalyticsController = require('../controllers/analytics.controller');
const { requireAuth, requireRole } = require('../middleware/auth.middleware');

// All analytics and export endpoints restricted strictly to Admin
router.use(requireAuth, requireRole('admin'));

router.get('/overview', AnalyticsController.getOverview);
router.get('/attendance-trends', AnalyticsController.getAttendanceTrends);
router.post('/exports/attendance', AnalyticsController.exportAttendance);
router.post('/exports/work-reports', AnalyticsController.exportWorkReports);

module.exports = router;
