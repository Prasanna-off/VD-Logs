const { z } = require('zod');

const createTaskSchema = z.object({
  title: z.string().min(2, 'Task title must be at least 2 characters').trim(),
  description: z.string().optional(),
  category: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  start_at: z.string().datetime().optional().or(z.literal('')),
  due_at: z.string().datetime().optional().or(z.literal('')),
  instructions: z.string().optional(),
  assigned_staff_ids: z.array(z.string().uuid()).min(1, 'Assign at least one staff member'),
  checklist_items: z.array(z.object({
    title: z.string().min(1, 'Checklist item title is required').trim(),
    description: z.string().optional(),
    is_required: z.boolean().default(true)
  })).optional()
});

const updateTaskSchema = z.object({
  title: z.string().min(2).trim().optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  start_at: z.string().datetime().optional().or(z.literal('')),
  due_at: z.string().datetime().optional().or(z.literal('')),
  instructions: z.string().optional(),
  is_archived: z.boolean().optional()
});

const updateChecklistProgressSchema = z.object({
  is_completed: z.boolean()
});

const submitTaskAssignmentSchema = z.object({
  submission_notes: z.string().optional()
});

const reviewTaskAssignmentSchema = z.object({
  decision: z.enum(['completed', 'needs_revision']),
  review_comment: z.string().optional()
});

module.exports = {
  createTaskSchema,
  updateTaskSchema,
  updateChecklistProgressSchema,
  submitTaskAssignmentSchema,
  reviewTaskAssignmentSchema
};
