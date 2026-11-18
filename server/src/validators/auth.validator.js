const { z } = require('zod');

const staffLoginSchema = z.object({
  staff_id: z.string().min(1, 'Staff ID is required').trim(),
  password: z.string().min(1, 'Password is required')
});

const adminLoginSchema = z.object({
  email: z.string().email('Invalid email address').trim().toLowerCase(),
  password: z.string().min(1, 'Password is required')
});

const changePasswordSchema = z.object({
  current_password: z.string().min(1, 'Current password is required'),
  new_password: z.string().min(6, 'New password must be at least 6 characters')
});

const updateProfileSchema = z.object({
  display_name: z.string().min(1).optional(),
  theme_preference: z.enum(['light', 'dark', 'system']).optional()
});

module.exports = {
  staffLoginSchema,
  adminLoginSchema,
  changePasswordSchema,
  updateProfileSchema
};
