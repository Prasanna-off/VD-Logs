const AttendanceService = require('../services/attendance.service');

class AttendanceController {
  static async checkIn(req, res, next) {
    try {
      if (!req.staff) {
        return res.status(403).json({
          error: { code: 'NOT_STAFF', message: 'Only staff accounts can record attendance.' }
        });
      }
      const result = await AttendanceService.checkIn(req.scopedClient, req.staff.id);
      res.status(200).json({ data: result });
    } catch (error) {
      next(error);
    }
  }

  static async checkOut(req, res, next) {
    try {
      if (!req.staff) {
        return res.status(403).json({
          error: { code: 'NOT_STAFF', message: 'Only staff accounts can record attendance.' }
        });
      }
      const result = await AttendanceService.checkOut(req.scopedClient, req.staff.id);
      res.status(200).json({ data: result });
    } catch (error) {
      next(error);
    }
  }

  static async getTodayStatus(req, res, next) {
    try {
      if (!req.staff) {
        return res.status(403).json({
          error: { code: 'NOT_STAFF', message: 'Only staff accounts have today status.' }
        });
      }
      const result = await AttendanceService.getTodayStatus(req.scopedClient, req.staff.id);
      res.status(200).json({ data: result });
    } catch (error) {
      next(error);
    }
  }

  static async getMyHistory(req, res, next) {
    try {
      if (!req.staff) {
        return res.status(403).json({
          error: { code: 'NOT_STAFF', message: 'Only staff accounts can access attendance history.' }
        });
      }
      const { limit, offset } = req.query;
      const result = await AttendanceService.getStaffAttendanceHistory(req.scopedClient, req.staff.id, {
        limit: limit ? parseInt(limit, 10) : 30,
        offset: offset ? parseInt(offset, 10) : 0
      });
      res.status(200).json({ data: result.data, meta: { total: result.total, limit: result.limit, offset: result.offset } });
    } catch (error) {
      next(error);
    }
  }

  static async submitCorrection(req, res, next) {
    try {
      if (!req.staff) {
        return res.status(403).json({
          error: { code: 'NOT_STAFF', message: 'Only staff accounts can request corrections.' }
        });
      }
      const result = await AttendanceService.submitCorrectionRequest(req.scopedClient, req.staff.id, req.body);
      res.status(201).json({ data: result });
    } catch (error) {
      next(error);
    }
  }

  static async getMyCorrections(req, res, next) {
    try {
      if (!req.staff) {
        return res.status(403).json({
          error: { code: 'NOT_STAFF', message: 'Only staff accounts can access correction requests.' }
        });
      }
      const result = await AttendanceService.listCorrectionRequests(req.scopedClient, {
        staff_id: req.staff.id
      });
      res.status(200).json({ data: result });
    } catch (error) {
      next(error);
    }
  }

  // Admin endpoints
  static async listAdminAttendance(req, res, next) {
    try {
      const { date, start_date, end_date, staff_id, department_id, incomplete_only, limit, offset } = req.query;
      const result = await AttendanceService.listAdminAttendance(req.scopedClient, {
        date,
        start_date,
        end_date,
        staff_id,
        department_id,
        incomplete_only,
        limit: limit ? parseInt(limit, 10) : 50,
        offset: offset ? parseInt(offset, 10) : 0
      });
      res.status(200).json({ data: result.data, meta: { total: result.total, limit: result.limit, offset: result.offset } });
    } catch (error) {
      next(error);
    }
  }

  static async listAdminCorrections(req, res, next) {
    try {
      const { status } = req.query;
      const result = await AttendanceService.listCorrectionRequests(req.scopedClient, { status });
      res.status(200).json({ data: result });
    } catch (error) {
      next(error);
    }
  }

  static async adjudicateCorrection(req, res, next) {
    try {
      const result = await AttendanceService.adjudicateCorrection(
        req.scopedClient,
        req.params.id,
        req.user.id,
        req.body
      );
      res.status(200).json({ data: result });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AttendanceController;
