const TaskService = require('../services/task.service');

class TaskController {
  static async create(req, res, next) {
    try {
      const task = await TaskService.createTask(req.scopedClient, req.user.id, req.body);
      res.status(201).json({ data: task });
    } catch (error) {
      next(error);
    }
  }

  static async listAdminTasks(req, res, next) {
    try {
      const { status, priority, is_archived, limit, offset } = req.query;
      const result = await TaskService.listAdminTasks(req.scopedClient, {
        status,
        priority,
        is_archived: is_archived === 'true',
        limit: limit ? parseInt(limit, 10) : 50,
        offset: offset ? parseInt(offset, 10) : 0
      });
      res.status(200).json({ data: result.data, meta: { total: result.total, limit: result.limit, offset: result.offset } });
    } catch (error) {
      next(error);
    }
  }

  static async listStaffTasks(req, res, next) {
    try {
      if (!req.staff) {
        return res.status(403).json({ error: { code: 'NOT_STAFF', message: 'Only staff can view assigned tasks.' } });
      }
      const tasks = await TaskService.listStaffTasks(req.scopedClient, req.staff.id, { status: req.query.status });
      res.status(200).json({ data: tasks });
    } catch (error) {
      next(error);
    }
  }

  static async getAssignmentDetails(req, res, next) {
    try {
      const staffId = req.profile.role === 'staff' ? req.staff.id : null;
      const assignment = await TaskService.getAssignmentDetails(req.scopedClient, req.params.assignmentId, staffId);
      res.status(200).json({ data: assignment });
    } catch (error) {
      next(error);
    }
  }

  static async updateChecklistProgress(req, res, next) {
    try {
      if (!req.staff) {
        return res.status(403).json({ error: { code: 'NOT_STAFF', message: 'Only staff can update checklist progress.' } });
      }
      const result = await TaskService.updateChecklistProgress(
        req.scopedClient,
        req.params.assignmentId,
        req.params.itemId,
        req.staff.id,
        req.body.is_completed,
        req.user.id
      );
      res.status(200).json({ data: result });
    } catch (error) {
      next(error);
    }
  }

  static async submitAssignment(req, res, next) {
    try {
      if (!req.staff) {
        return res.status(403).json({ error: { code: 'NOT_STAFF', message: 'Only staff can submit task assignments.' } });
      }
      const result = await TaskService.submitAssignmentForReview(
        req.scopedClient,
        req.params.assignmentId,
        req.staff.id,
        req.body.submission_notes
      );
      res.status(200).json({ data: result });
    } catch (error) {
      next(error);
    }
  }

  static async reviewAssignment(req, res, next) {
    try {
      const result = await TaskService.adjudicateTaskAssignment(
        req.scopedClient,
        req.params.assignmentId,
        req.user.id,
        req.body
      );
      res.status(200).json({ data: result });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = TaskController;
