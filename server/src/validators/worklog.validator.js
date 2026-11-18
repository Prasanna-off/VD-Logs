const { z } = require('zod');

const createWorkLogSchema = z.object({
  work_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Valid work date in YYYY-MM-DD required'),
  title: z.string().min(2, 'Work log title is required').trim(),
  description: z.string().min(5, 'Detailed description of work performed is required').trim(),
  related_task_assignment_id: z.string().uuid().optional().or(z.literal('')),
  minutes_spent: z.number().int().min(0, 'Minutes spent must be positive').optional().or(z.literal('')),
  additional_notes: z.string().optional(),
  is_submitted: z.boolean().default(false)
});

const updateWorkLogSchema = z.object({
  title: z.string().min(2).trim().optional(),
  description: z.string().min(5).trim().optional(),
  related_task_assignment_id: z.string().uuid().optional().or(z.literal('')),
  minutes_spent: z.number().int().min(0).optional().or(z.literal('')),
  additional_notes: z.string().optional(),
  is_submitted: z.boolean().optional()
});

const reviewWorkLogSchema = z.object({
  decision: z.enum(['approved', 'needs_revision']),
  review_comment: z.string().optional()
});

module.exports = {
  createWorkLogSchema,
  updateWorkLogSchema,
  reviewWorkLogSchema
};
