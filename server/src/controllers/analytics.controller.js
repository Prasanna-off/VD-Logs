const AnalyticsService = require('../services/analytics.service');
const ExportService = require('../services/export.service');

class AnalyticsController {
  static async getOverview(req, res, next) {
    try {
      const metrics = await AnalyticsService.getOverviewMetrics(req.scopedClient);
      res.status(200).json({ data: metrics });
    } catch (error) {
      next(error);
    }
  }

  static async getAttendanceTrends(req, res, next) {
    try {
      const days = req.query.days ? parseInt(req.query.days, 10) : 14;
      const trends = await AnalyticsService.getAttendanceTrends(req.scopedClient, days);
      res.status(200).json({ data: trends });
    } catch (error) {
      next(error);
    }
  }

  static async exportAttendance(req, res, next) {
    try {
      const workbook = await ExportService.exportAttendance(req.scopedClient, req.body);
      const filename = `VD_Logs_Attendance_${new Date().toISOString().slice(0, 10)}.xlsx`;

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      next(error);
    }
  }

  static async exportWorkReports(req, res, next) {
    try {
      const workbook = await ExportService.exportWorkReports(req.scopedClient, req.body);
      const filename = `VD_Logs_WorkReports_${new Date().toISOString().slice(0, 10)}.xlsx`;

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AnalyticsController;
