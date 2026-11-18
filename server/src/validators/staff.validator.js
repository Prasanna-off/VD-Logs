const { z } = require('zod');

const createStaffSchema = z.object({
  staff_id: z.string().min(2, 'Staff ID is required').trim(),
  full_name: z.string().min(2, 'Full name is required').trim(),
  password: z.string().min(6, 'Initial password must be at least 6 characters'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  department_id: z.string().uuid('Valid department selection is required').optional().or(z.literal('')),
  designation: z.string().optional().or(z.literal('')),
  joining_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Joining date must be in YYYY-MM-DD format').optional().or(z.literal(''))
});

const updateStaffSchema = z.object({
  full_name: z.string().min(2).trim().optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  department_id: z.string().uuid().optional().or(z.literal('')),
  designation: z.string().optional().or(z.literal('')),
  joining_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal('')),
  employment_status: z.enum(['active', 'inactive', 'left']).optional()
});

const resetStaffPasswordSchema = z.object({
  new_password: z.string().min(6, 'Password must be at least 6 characters')
});

module.exports = {
  createStaffSchema,
  updateStaffSchema,
  resetStaffPasswordSchema
};
