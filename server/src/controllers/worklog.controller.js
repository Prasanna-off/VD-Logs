const WorkLogService = require('../services/worklog.service');

class WorkLogController {
  static async create(req, res, next) {
    try {
      if (!req.staff) {
        return res.status(403).json({ error: { code: 'NOT_STAFF', message: 'Only staff can record work logs.' } });
      }
      const log = await WorkLogService.createWorkLog(req.scopedClient, req.staff.id, req.body);
      res.status(201).json({ data: log });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      if (!req.staff) {
        return res.status(403).json({ error: { code: 'NOT_STAFF', message: 'Only staff can update work logs.' } });
      }
      const log = await WorkLogService.updateWorkLog(req.scopedClient, req.params.id, req.staff.id, req.body);
      res.status(200).json({ data: log });
    } catch (error) {
      next(error);
    }
  }

  static async listMy(req, res, next) {
    try {
      if (!req.staff) {
        return res.status(403).json({ error: { code: 'NOT_STAFF', message: 'Only staff can access their work logs.' } });
      }
      const logs = await WorkLogService.listMyWorkLogs(req.scopedClient, req.staff.id, { status: req.query.status });
      res.status(200).json({ data: logs });
    } catch (error) {
      next(error);
    }
  }

  static async listAdmin(req, res, next) {
    try {
      const { status, staff_id, date, start_date, end_date, limit, offset } = req.query;
      const result = await WorkLogService.listAdminWorkLogs(req.scopedClient, {
        status,
        staff_id,
        date,
        start_date,
        end_date,
        limit: limit ? parseInt(limit, 10) : 50,
        offset: offset ? parseInt(offset, 10) : 0
      });
      res.status(200).json({ data: result.data, meta: { total: result.total, limit: result.limit, offset: result.offset } });
    } catch (error) {
      next(error);
    }
  }

  static async review(req, res, next) {
    try {
      const result = await WorkLogService.adjudicateWorkLog(
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

module.exports = WorkLogController;
