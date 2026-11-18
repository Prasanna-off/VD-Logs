const { z } = require('zod');

const createDepartmentSchema = z.object({
  name: z.string().min(2, 'Department name must be at least 2 characters').trim(),
  description: z.string().optional()
});

const updateDepartmentSchema = z.object({
  name: z.string().min(2, 'Department name must be at least 2 characters').trim().optional(),
  description: z.string().optional(),
  is_active: z.boolean().optional()
});

module.exports = {
  createDepartmentSchema,
  updateDepartmentSchema
};
