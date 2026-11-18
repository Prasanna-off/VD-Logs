const StaffService = require('../services/staff.service');

class StaffController {
  static async list(req, res, next) {
    try {
      const { search, department_id, status, limit, offset } = req.query;
      const result = await StaffService.listStaff(req.scopedClient, {
        search,
        department_id,
        status,
        limit: limit ? parseInt(limit, 10) : 50,
        offset: offset ? parseInt(offset, 10) : 0
      });
      res.status(200).json({ data: result.data, meta: { total: result.total, limit: result.limit, offset: result.offset } });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const staff = await StaffService.getStaffById(req.scopedClient, req.params.id);
      res.status(200).json({ data: staff });
    } catch (error) {
      next(error);
    }
  }

  static async create(req, res, next) {
    try {
      const staff = await StaffService.createStaff(req.scopedClient, req.body);
      res.status(201).json({ data: staff });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const staff = await StaffService.updateStaff(req.scopedClient, req.params.id, req.body);
      res.status(200).json({ data: staff });
    } catch (error) {
      next(error);
    }
  }

  static async deactivate(req, res, next) {
    try {
      const staff = await StaffService.deactivateStaff(req.scopedClient, req.params.id);
      res.status(200).json({ data: staff });
    } catch (error) {
      next(error);
    }
  }

  static async resetPassword(req, res, next) {
    try {
      await StaffService.resetStaffPassword(req.params.id, req.body.new_password);
      res.status(200).json({ data: { message: 'Password reset successfully.' } });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = StaffController;
