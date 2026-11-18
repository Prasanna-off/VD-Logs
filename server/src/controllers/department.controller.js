const DepartmentService = require('../services/department.service');

class DepartmentController {
  static async list(req, res, next) {
    try {
      const includeInactive = req.query.include_inactive === 'true';
      const departments = await DepartmentService.listDepartments(req.scopedClient, includeInactive);
      res.status(200).json({ data: departments });
    } catch (error) {
      next(error);
    }
  }

  static async create(req, res, next) {
    try {
      const department = await DepartmentService.createDepartment(req.scopedClient, req.body, req.user.id);
      res.status(201).json({ data: department });
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const department = await DepartmentService.updateDepartment(req.scopedClient, req.params.id, req.body);
      res.status(200).json({ data: department });
    } catch (error) {
      next(error);
    }
  }

  static async deactivate(req, res, next) {
    try {
      const department = await DepartmentService.deactivateDepartment(req.scopedClient, req.params.id);
      res.status(200).json({ data: department });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = DepartmentController;
